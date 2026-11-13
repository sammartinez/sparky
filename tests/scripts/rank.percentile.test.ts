// C1: an HN story matched by several Algolia keyword queries arrives once per
// query. It must count once among its source's peers, or it drags every other
// story's percentile around.
import { test, expect } from "vitest";
import { canonicalize, rank } from "../../scripts/rank.ts";
import type { RawItem } from "../../scripts/types.ts";
import {
  copies,
  distinctStories,
  hnHit,
  item,
  LOBSTERS,
  lobstersItem,
  normalizedByUrl,
} from "../support/rawItems.ts";

const NEUTRAL = 0.5;

/** Six distinct HN front-page stories; "llm 0.31" is the one three queries match. */
const REPEATED = hnHit(44001005, {
  title: "llm 0.31",
  url: "https://github.com/simonw/llm/releases/tag/0.31",
  points: 180,
  comments: 42,
});

const OTHERS: RawItem[] = [
  hnHit(44001001, {
    title: "Serving LLMs on Tenstorrent hardware",
    url: "https://example.org/tenstorrent",
    points: 31,
    comments: 4,
  }),
  hnHit(44001002, {
    title: "A field guide to agent evals",
    url: "https://example.net/agent-evals",
    points: 64,
    comments: 12,
  }),
  hnHit(44001003, {
    title: "Why our RAG pipeline got slower",
    url: "https://example.com/rag-slower",
    points: 97,
    comments: 30,
  }),
  hnHit(44001004, {
    title: "Fine-tuning on a single consumer GPU",
    url: "https://example.io/single-gpu",
    points: 140,
    comments: 55,
  }),
  hnHit(44001006, {
    title: "DeepSeek launches v4.1 flash",
    url: "https://example.dev/deepseek-flash",
    points: 412,
    comments: 230,
  }),
];

/** Four distinct HN stories with distinct points: one short of a real distribution. */
function fourStories(): RawItem[] {
  return distinctStories("four.example", 4);
}

function expectAllNeutral(items: RawItem[], uniqueStories: number) {
  const out = rank(items);
  expect(out.length).toBe(uniqueStories);
  expect(out.map((s) => s.normalized)).toEqual(
    Array.from({ length: uniqueStories }, () => NEUTRAL),
  );
}

// --- AC1: the reported case -------------------------------------------------

test("an HN story returned by three queries leaves every story's normalized as if it came back once", () => {
  const once = rank([...OTHERS, REPEATED]);
  const thrice = rank([...OTHERS, ...copies(REPEATED, 3)]);

  expect(normalizedByUrl(thrice)).toEqual(normalizedByUrl(once));
});

test("an HN story returned by three queries is still one story with one HN appearance", () => {
  const out = rank([...OTHERS, ...copies(REPEATED, 3)]);
  const story = out.find((s) => s.url === REPEATED.url)!;

  expect(out.length).toBe(OTHERS.length + 1);
  expect(story.appearances).toEqual([
    {
      source: "hn",
      label: "HN",
      points: 180,
      comments: 42,
      discussionUrl: "https://news.ycombinator.com/item?id=44001005",
    },
  ]);
});

test("three copies of one story do not lift a batch of four past the neutral prior", () => {
  const [first, ...rest] = fourStories();

  expectAllNeutral([...copies(first, 3), ...rest], 4);
});

// --- AC2: duplicates are matched on canonical URL ---------------------------

test.each([
  ["a tracking parameter", "https://four.example/2?utm_source=hn"],
  ["a www. prefix", "https://www.four.example/2"],
  ["a trailing slash", "https://four.example/2/"],
])(
  "a copy that differs only by %s counts once among its source's peers",
  (_difference, url) => {
    const stories = fourStories();
    const copy = { ...stories[2], url };

    expectAllNeutral([...stories, copy], 4);
  },
);

test("any number of decorated copies of four stories still leaves every story neutral", () => {
  const stories = fourStories();
  const decorated = stories.flatMap((s) => [
    { ...s, url: `${s.url}?utm_campaign=newsletter&ref=hn` },
    { ...s, url: s.url.replace("https://", "http://www.") },
    { ...s, url: `${s.url}/#comments` },
  ]);

  expectAllNeutral([...stories, ...decorated], 4);
});

// --- AC3: copies that disagree on points ------------------------------------

test("copies carrying different points leave a batch of four at the neutral prior", () => {
  const stories = fourStories();
  const copy = { ...stories[1], points: 500 };
  const another = { ...stories[1], points: 3 };

  expectAllNeutral([...stories, copy, another], 4);
});

test.each([
  ["lowest first", [12, 45, 30]],
  ["highest first", [45, 12, 30]],
])(
  "a story whose copies disagree on points counts once at its highest value (%s)",
  (_order, points) => {
    const peers = [
      item({
        url: "https://peers.example/b",
        title: "Quantization tricks",
        points: 20,
      }),
      item({
        url: "https://peers.example/c",
        title: "Browser agents reviewed",
        points: 30,
      }),
      item({
        url: "https://peers.example/d",
        title: "Tokenizer bugs",
        points: 40,
      }),
      item({
        url: "https://peers.example/e",
        title: "Compiler fuzzing",
        points: 50,
      }),
    ];
    const disputed = item({
      url: "https://peers.example/a",
      title: "Speech synthesis",
    });

    const out = normalizedByUrl(
      rank([...peers, ...points.map((p) => ({ ...disputed, points: p }))]),
    );

    // Unique points are 20, 30, 40, 45 (the disputed story's best), 50, so the
    // peers below 45 are unaffected and the ones above it have one more peer
    // beneath them. The disputed story's own value is out of scope here.
    expect({
      b: out["https://peers.example/b"],
      c: out["https://peers.example/c"],
      d: out["https://peers.example/d"],
      e: out["https://peers.example/e"],
    }).toEqual({ b: 0, c: 0.2, d: 0.4, e: 0.8 });
  },
);

// --- AC4: the same URL on two sources ---------------------------------------

/** Five HN and five Lobsters stories; one URL is on both. */
function twoSourceBatch(): { hn: RawItem[]; lobsters: RawItem[] } {
  return {
    hn: [
      ...distinctStories("hn-only.example", 4),
      item({ url: "https://shared.example/post", title: "shared", points: 90 }),
    ],
    lobsters: [
      ...distinctStories("lobsters-only.example", 4, LOBSTERS, 4),
      lobstersItem({
        url: "https://www.shared.example/post/",
        title: "shared",
        points: 90,
      }),
    ],
  };
}

function expectCountedOncePerSource(items: RawItem[]) {
  const out = rank(items);
  const shared = out.find(
    (s) => s.canonicalUrl === canonicalize("https://shared.example/post"),
  )!;
  const bySource = (domain: string) =>
    out
      .filter((s) => s.domain === domain)
      .map((s) => s.normalized)
      .sort((a, b) => a - b);

  // Five peers on each source: the four fillers sit at 0, 0.2, 0.4, 0.6 and
  // the shared story tops both tables.
  expect(out.length).toBe(9);
  expect(bySource("hn-only.example")).toEqual([0, 0.2, 0.4, 0.6]);
  expect(bySource("lobsters-only.example")).toEqual([0, 0.2, 0.4, 0.6]);
  expect(shared.normalized).toBe(0.8);
  expect(shared.appearances.map((a) => a.label).sort()).toEqual([
    "HN",
    "Lobsters",
  ]);
}

test("a URL on HN and Lobsters counts once in each source's peers and merges into one story with two appearances", () => {
  const { hn, lobsters } = twoSourceBatch();

  expectCountedOncePerSource([...hn, ...lobsters]);
});

test("a URL returned three times by HN and once by Lobsters still counts once per source", () => {
  const { hn, lobsters } = twoSourceBatch();
  const shared = hn[hn.length - 1];

  expectCountedOncePerSource([...hn, ...copies(shared, 2), ...lobsters]);
});
