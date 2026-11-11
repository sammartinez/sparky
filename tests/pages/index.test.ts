import { test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import IndexPage from "../../src/pages/index.astro";
import { href } from "../../src/lib/brief";
import { headings, headingsAt, innerOf, linksTo } from "../support/html";

// The digests collection is empty under Vitest, so this is the no-brief state.
async function render() {
  const container = await AstroContainer.create();
  return container.renderToString(IndexPage);
}

test("the home page with no brief has exactly one h1 reading No brief yet", async () => {
  const html = await render();
  expect(headingsAt(html, 1).map((h) => h.text)).toEqual(["No brief yet"]);
});

test("the home page with no brief passes no standfirst", async () => {
  const html = await render();
  expect(innerOf(html, "header")).not.toMatch(/<p\b/);
});

test("the home page keeps its empty-state message", async () => {
  const html = await render();
  expect(innerOf(html, "main")).toContain("Nothing here yet.");
});

test("the home page wordmark links home and is not inside a heading", async () => {
  const html = await render();
  const wordmark = linksTo(html, href("/")).filter((inner) =>
    inner.includes("Sparky News"),
  );
  expect(wordmark).toHaveLength(1);
  for (const heading of headings(html)) {
    expect(heading.text).not.toContain("Sparky News");
  }
});
