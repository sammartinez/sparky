import { test, expect, vi } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import ArchivePage from "../../../src/pages/archive/index.astro";
import { headings, headingsAt, innerOf } from "../../support/html";

// Whether the content store is populated under Vitest depends on whether
// `astro sync`/`astro check` has run in this checkout. Stand in for the store
// only, as an empty collection, so the empty state is tested deterministically.
vi.mock("astro:content", () => ({ getCollection: async () => [] }));

async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(ArchivePage);
}

test("the archive page has exactly one h1 reading Archive", async () => {
  const html = await render();
  expect(headingsAt(html, 1).map((h) => h.text)).toEqual(["Archive"]);
});

test("the archive page keeps its brief-count standfirst after the h1", async () => {
  const html = await render();
  const header = innerOf(html, "header");
  expect(header).toMatch(
    /<p[^>]*class="[^"]*\beyebrow\b[^"]*"[^>]*>\s*0 briefs\s*<\/p>/,
  );
  expect(header.indexOf("0 briefs")).toBeGreaterThan(header.indexOf("</h1>"));
});

test("the archive page wordmark is not inside a heading", async () => {
  const html = await render();
  for (const heading of headings(html)) {
    expect(heading.text).not.toContain("Sparky News");
  }
});

test("the empty archive page shows the no-briefs message once and no list", async () => {
  const main = innerOf(await render(), "main");
  expect(main.split("No briefs archived yet.")).toHaveLength(2);
  expect(main).not.toMatch(/<ol\b/);
  expect(main).not.toMatch(/<li\b/);
  expect(headingsAt(main, 2)).toEqual([]);
});
