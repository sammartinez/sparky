import { test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import StoryCard from "../../src/components/StoryCard.astro";

const NOW = new Date("2026-01-15T12:00:00.000Z").getTime();

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    rank: 3,
    title: "A very good story",
    url: "https://example.com/story",
    domain: "example.com",
    createdAt: "2026-01-15T10:00:00.000Z",
    why: "It matters because reasons.",
    normalized: 0.6,
    appearances: [{ source: "hn", label: "HN", points: 150, comments: 40 }],
    now: NOW,
    ...overrides,
  };
}

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(StoryCard, { props });
}

test("rank is zero-padded to two digits", async () => {
  const html = await render(baseProps({ rank: 3 }));
  expect(html).toContain(">03<");
});

test("double-digit ranks are left as-is", async () => {
  const html = await render(baseProps({ rank: 12 }));
  expect(html).toContain(">12<");
});

test("feature and grid variants render as an article, compact renders as a row", async () => {
  const feature = await render(baseProps({ variant: "feature" }));
  const grid = await render(baseProps({ variant: "grid" }));
  const compact = await render(baseProps({ variant: "compact" }));

  expect(feature).toContain("<article");
  expect(feature).toContain("col-span-6 px-7 py-8");
  expect(grid).toContain("<article");
  expect(grid).toContain("sm:col-span-3");
  expect(compact).not.toContain("<article");
  expect(compact).toContain("grid-cols-[2.5rem_1fr]");
});

test("a single appearance shows no corroboration badge", async () => {
  const html = await render(
    baseProps({
      appearances: [{ source: "hn", label: "HN", points: 150, comments: 40 }],
    }),
  );
  expect(html).not.toContain("sources");
});

test("multiple appearances show the corroboration count", async () => {
  const html = await render(
    baseProps({
      appearances: [
        { source: "hn", label: "HN", points: 150, comments: 40 },
        { source: "reddit", label: "r/ML", points: 80, comments: 12 },
      ],
    }),
  );
  expect(html).toContain("×2 sources");
});

test("omits the why paragraph when there is no rationale", async () => {
  const html = await render(baseProps({ why: "" }));
  expect(html).not.toContain("italic");
});

test("a badge without a discussion url falls back to the story url", async () => {
  const html = await render(
    baseProps({
      url: "https://example.com/story",
      appearances: [{ source: "hn", label: "HN", points: 150, comments: 40 }],
    }),
  );
  expect(html).toMatch(
    /href="https:\/\/example\.com\/story"[^>]*>\s*<span>HN<\/span>/,
  );
});

test("a badge with its own discussion url uses that instead", async () => {
  const html = await render(
    baseProps({
      appearances: [
        {
          source: "hn",
          label: "HN",
          points: 150,
          comments: 40,
          discussionUrl: "https://news.ycombinator.com/item?id=1",
        },
      ],
    }),
  );
  expect(html).toContain('href="https://news.ycombinator.com/item?id=1"');
});
