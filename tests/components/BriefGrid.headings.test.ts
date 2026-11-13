import { test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import BriefGrid from "../../src/components/BriefGrid.astro";
import { headingsAt } from "../support/html";
import { story } from "../support/stories";

const GENERATED_AT = "2026-01-15T12:00:00.000Z";
const NOW = new Date(GENERATED_AT).getTime();

async function render(count: number) {
  const stories = Array.from({ length: count }, (_, i) =>
    story(i + 1, GENERATED_AT),
  );
  const container = await AstroContainer.create();
  return container.renderToString(BriefGrid, {
    props: { stories, generatedAt: GENERATED_AT, now: NOW },
  });
}

test("renders Also today as an h2", async () => {
  const html = await render(7);
  expect(headingsAt(html, 2).map((h) => h.text)).toContain("Also today");
});

test("Also today is no longer an h3", async () => {
  const html = await render(7);
  expect(headingsAt(html, 3).map((h) => h.text)).not.toContain("Also today");
});

test("the Also today h2 keeps the eyebrow style", async () => {
  const html = await render(7);
  expect(html).toMatch(
    /<h2[^>]*class="[^"]*\beyebrow\b[^"]*"[^>]*>\s*Also today\s*<\/h2>/,
  );
});

test("compact story titles under Also today stay h3", async () => {
  const html = await render(7);
  const compact = html.slice(html.indexOf("Also today"));
  const titles = headingsAt(compact, 3).map((h) => h.text);
  expect(titles).toHaveLength(2);
  expect(titles[0]).toContain("Story 6");
  expect(titles[1]).toContain("Story 7");
});

test("renders no Also today heading when five or fewer stories leave no compact list", async () => {
  const html = await render(5);
  expect(headingsAt(html, 2).map((h) => h.text)).not.toContain("Also today");
});

test("BriefGrid renders no h1 of its own", async () => {
  const html = await render(7);
  expect(headingsAt(html, 1)).toHaveLength(0);
});
