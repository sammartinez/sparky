// C2: two releases of the same tool have near-identical titles ("llm 0.30",
// "llm 0.31") and were merged as one story from two outlets. Titles that
// disagree on version are different stories.
import { test, expect } from "vitest";
import { rank } from "../../scripts/rank.ts";
import type { RawItem, Story } from "../../scripts/types.ts";
import {
  item,
  labelsOf,
  lobstersItem,
  LLM_030,
  LLM_031,
} from "../support/rawItems.ts";

/** The same release as a feed entry: no traction signal, a feed-name label. */
function fromFeed(original: RawItem, url: string): RawItem {
  return item({
    source: "rss",
    label: "Simon Willison",
    title: original.title,
    url,
    points: null,
    comments: null,
    createdAt: original.createdAt,
  });
}

/** What a reader sees of each story, in URL order. */
function summarize(stories: Story[]) {
  return stories
    .map((s) => ({ title: s.title, url: s.url, labels: labelsOf(s) }))
    .sort((a, b) => a.url.localeCompare(b.url));
}

/** Every input comes back as its own story: own title, own URL, one appearance. */
function expectSeparateStories(items: RawItem[]) {
  const expected = items
    .map((i) => ({ title: i.title, url: i.url, labels: [i.label] }))
    .sort((a, b) => a.url.localeCompare(b.url));

  expect(summarize(rank(items))).toEqual(expected);
}

/** Every input lands in a single story, one appearance per input. */
function expectOneStory(items: RawItem[]) {
  const out = rank(items);

  expect(out.length).toBe(1);
  expect(labelsOf(out[0])).toEqual(items.map((i) => i.label).sort());
}

// --- AC5: the reported case -------------------------------------------------

test("llm 0.30 and llm 0.31 on HN are two stories, each with its own title, URL and one appearance", () => {
  expectSeparateStories([LLM_030, LLM_031]);
});

test("llm 0.30 on HN and llm 0.31 from a feed are two stories, each with its own title, URL and one appearance", () => {
  expectSeparateStories([
    LLM_030,
    fromFeed(LLM_031, "https://simonwillison.net/2026/Nov/11/llm/"),
  ]);
});

test("a second outlet's llm 0.31 joins the 0.31 story, not the 0.30 story ranked ahead of it", () => {
  const out = rank([
    LLM_030,
    LLM_031,
    fromFeed(LLM_031, "https://simonwillison.net/2026/Nov/11/llm/"),
  ]);

  expect(summarize(out)).toEqual([
    { title: "llm 0.30", url: LLM_030.url, labels: ["HN"] },
    { title: "llm 0.31", url: LLM_031.url, labels: ["HN", "Simon Willison"] },
  ]);
});

// --- AC6: same version, different outlets -----------------------------------

test("similar titles carrying the same dotted version still merge across outlets", () => {
  expectOneStory([
    item({
      title: "Ollama v0.9.1 is out now",
      url: "https://ollama.example/blog/0-9-1",
    }),
    lobstersItem({
      title: "Ollama v0.9.1 is out now, with faster loads",
      url: "https://news.example/ollama-0-9-1",
    }),
  ]);
});

// --- AC7: only one title carries a number -----------------------------------

test.each([
  ["numbered title first", 0],
  ["unnumbered title first", 1],
])(
  "similar titles merge when only one of them carries a number (%s)",
  (_order, rotate) => {
    const pair = [
      item({
        title: "Anthropic releases Claude Opus 5 model",
        url: "https://verge.example/opus-5",
      }),
      lobstersItem({
        title: "Anthropic releases Claude Opus model",
        url: "https://techcrunch.example/opus",
      }),
    ];

    expectOneStory([...pair.slice(rotate), ...pair.slice(0, rotate)]);
  },
);

test("an unnumbered story that absorbed one release does not absorb the next release too", () => {
  const out = rank([
    item({
      title: "Anthropic releases Claude Opus model",
      url: "https://verge.example/opus",
    }),
    lobstersItem({
      title: "Anthropic releases Claude Opus 5 model",
      url: "https://techcrunch.example/opus-5",
    }),
    fromFeed(
      item({ title: "Anthropic releases Claude Opus 6 model" }),
      "https://simonwillison.net/2026/Nov/12/opus-6/",
    ),
  ]);

  expect(summarize(out)).toEqual([
    {
      title: "Anthropic releases Claude Opus 6 model",
      url: "https://simonwillison.net/2026/Nov/12/opus-6/",
      labels: ["Simon Willison"],
    },
    {
      title: "Anthropic releases Claude Opus model",
      url: "https://verge.example/opus",
      labels: ["HN", "Lobsters"],
    },
  ]);
});

// --- AC8: glued and v-prefixed versions -------------------------------------

test.each([
  [
    "glued to a word",
    "Llama4 released for everyone",
    "Llama5 released for everyone",
  ],
  ["prefixed with v", "Ollama v0.9.1 is out now", "Ollama v0.9.2 is out now"],
])(
  "titles that differ only in a version %s are two stories",
  (_form, earlier, later) => {
    expectSeparateStories([
      item({ title: earlier, url: "https://releases.example/earlier" }),
      lobstersItem({ title: later, url: "https://releases.example/later" }),
    ]);
  },
);
