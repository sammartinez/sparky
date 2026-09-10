import { test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import BriefGrid from "./BriefGrid.astro";

const GENERATED_AT = "2026-01-15T12:00:00.000Z";
const NOW = new Date(GENERATED_AT).getTime();

function story(i: number, overrides: Record<string, unknown> = {}) {
  return {
    id: `s${i}`,
    title: `Story ${i}`,
    url: `https://example.com/${i}`,
    canonicalUrl: `https://example.com/${i}`,
    domain: "example.com",
    createdAt: GENERATED_AT,
    appearances: [{ source: "hn", label: "HN", points: 100, comments: 10 }],
    normalized: 0.5,
    score: 1,
    aiScore: 8,
    why: `Why ${i} matters`,
    ...overrides,
  };
}

async function render(stories: ReturnType<typeof story>[]) {
  const container = await AstroContainer.create();
  return container.renderToString(BriefGrid, {
    props: { stories, generatedAt: GENERATED_AT, now: NOW },
  });
}

test("shows the quiet-morning message when there are no stories", async () => {
  const html = await render([]);
  expect(html).toContain("Quiet morning");
  expect(html).not.toContain("grid-cols-6");
});

test("a single story renders as the feature card alone, no grid or Also today", async () => {
  const html = await render([story(1)]);
  expect(html).toContain("Story 1");
  expect(html).toContain(">01<");
  expect(html).not.toContain("Also today");
});

test("five stories fill the feature + 2x2 grid with no leftover for Also today", async () => {
  const html = await render([1, 2, 3, 4, 5].map((i) => story(i)));
  for (const n of ["01", "02", "03", "04", "05"]) {
    expect(html).toContain(`>${n}<`);
  }
  expect(html).not.toContain("Also today");
});

test("more than five stories spill into the Also today compact list", async () => {
  const html = await render([1, 2, 3, 4, 5, 6, 7].map((i) => story(i)));
  expect(html).toContain("Also today");

  const alsoTodayIndex = html.indexOf("Also today");
  const compactSection = html.slice(alsoTodayIndex);
  expect(compactSection).toContain("Story 6");
  expect(compactSection).toContain("Story 7");
  // The feature/grid stories should appear before the "Also today" heading, not in it.
  expect(html.slice(0, alsoTodayIndex)).toContain("Story 1");
  expect(compactSection).not.toContain("Story 1");
});

test("passes the digest's story count through to the DawnRule timeline", async () => {
  const html = await render([story(1), story(2), story(3)]);
  expect(html).toContain("Timeline showing when each of the 3 stories");
});
