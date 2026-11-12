import { test, expect, vi } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { href } from "../../src/lib/brief";
import {
  anchorsTo,
  expectTapTargets,
  headingsAt,
  innerOf,
  mainNavLinks,
  textOf,
} from "../support/html";
import { story } from "../support/stories";

const GENERATED_AT = "2026-11-09T12:00:00.000Z";

// The content store is empty under Vitest. Stand in for the store only (the
// filesystem-backed collection), so the page and src/lib/brief run for real.
vi.mock("astro:content", () => ({
  getCollection: async () => [
    {
      id: "2026-11-08",
      collection: "digests",
      data: {
        date: "2026-11-08",
        generatedAt: "2026-11-08T12:00:00.000Z",
        windowHours: 36,
        stories: [],
      },
    },
    {
      id: "2026-11-09",
      collection: "digests",
      data: {
        date: "2026-11-09",
        generatedAt: GENERATED_AT,
        windowHours: 36,
        stories: [story(1, GENERATED_AT), story(2, GENERATED_AT)],
      },
    },
  ],
}));

async function render() {
  const { default: IndexPage } = await import("../../src/pages/index.astro");
  const container = await AstroContainer.create();
  return container.renderToString(IndexPage);
}

test("the home page with a brief has exactly one h1 reading the newest brief's long date", async () => {
  const html = await render();
  expect(headingsAt(html, 1).map((h) => h.text)).toEqual([
    "Monday, November 9, 2026",
  ]);
});

test("the home page with a brief passes no standfirst", async () => {
  const html = await render();
  expect(innerOf(html, "header")).not.toMatch(/<p\b/);
});

test("the home page with a brief renders that brief's stories", async () => {
  const html = await render();
  expect(innerOf(html, "main")).toContain("Story 1");
});

test("the home page links to the previous brief by its short date", async () => {
  const html = await render();
  const links = anchorsTo(html, href("archive/2026-11-08"));
  expect(links.map((a) => textOf(a.inner))).toEqual(["← Sun, Nov 8"]);
});

test("the home page navigation reads older then All briefs, with no newer link", async () => {
  const html = await render();
  expect(mainNavLinks(html).map((a) => textOf(a.inner))).toEqual([
    "← Sun, Nov 8",
    "All briefs",
  ]);
});

test("the home page All briefs link goes to the archive", async () => {
  const html = await render();
  const links = anchorsTo(innerOf(html, "main"), href("archive"));
  expect(links.map((a) => textOf(a.inner))).toEqual(["All briefs"]);
});

test("every navigation link on the home page is at least 44px tall", async () => {
  const html = await render();
  const links = mainNavLinks(html);
  expect(links).toHaveLength(2);
  expectTapTargets(links);
});
