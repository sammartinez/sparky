import { test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import Base from "../../src/layouts/Base.astro";
import { href } from "../../src/lib/brief";
import {
  headings,
  headingsAt,
  innerOf,
  linksTo,
  textOf,
} from "../support/html";

const WORDMARK = "Sparky News";
const HEADING = "Monday, November 9, 2026";
const OLD_TAGLINE = "What the AI world is talking about";

async function render(
  props: Record<string, unknown> = {},
  slot = '<p data-testid="page-body">Page body</p>',
) {
  const container = await AstroContainer.create();
  return container.renderToString(Base, {
    props: { title: "A page — Sparky News", heading: HEADING, ...props },
    slots: { default: slot },
  });
}

test("renders exactly one h1", async () => {
  const html = await render();
  expect(headingsAt(html, 1)).toHaveLength(1);
});

test("the h1 text is the heading prop", async () => {
  const html = await render({ heading: "Archive" });
  expect(headingsAt(html, 1).map((h) => h.text)).toEqual(["Archive"]);
});

test("the h1 sits in the page header, before the main content", async () => {
  const html = await render();
  expect(headingsAt(innerOf(html, "header"), 1).map((h) => h.text)).toEqual([
    HEADING,
  ]);
});

test("still renders exactly one h1 when the slotted page content has its own h2", async () => {
  const html = await render({}, "<h2>Also today</h2>");
  expect(headingsAt(html, 1)).toHaveLength(1);
  expect(headingsAt(html, 2).map((h) => h.text)).toEqual(["Also today"]);
});

test("the wordmark is a link to the home page holding the spark mark and the site name", async () => {
  const html = await render();
  const wordmark = linksTo(html, href("/")).filter((inner) =>
    inner.includes(WORDMARK),
  );
  expect(wordmark).toHaveLength(1);
  expect(wordmark[0]).toContain("<svg");
  expect(textOf(wordmark[0])).toBe(WORDMARK);
});

test("the wordmark link contains no heading element", async () => {
  const html = await render();
  const wordmark = linksTo(html, href("/")).find((inner) =>
    inner.includes(WORDMARK),
  );
  expect(wordmark).toBeDefined();
  expect(wordmark).not.toMatch(/<h[1-6]\b/);
});

test("the site name is not inside any heading element", async () => {
  const html = await render();
  for (const heading of headings(html)) {
    expect(heading.text).not.toContain(WORDMARK);
  }
  // The wordmark link itself must not be wrapped by a heading either.
  expect(html).not.toMatch(/<h[1-6]\b[^>]*>\s*<a\b/);
});

test("a standfirst renders as an eyebrow paragraph after the h1", async () => {
  const html = await render({ standfirst: "12 briefs" });
  const header = innerOf(html, "header");
  expect(header).toMatch(
    /<p[^>]*class="[^"]*\beyebrow\b[^"]*"[^>]*>\s*12 briefs\s*<\/p>/,
  );
  expect(header.indexOf("12 briefs")).toBeGreaterThan(header.indexOf("</h1>"));
  expect(header.indexOf("</h1>")).toBeGreaterThan(-1);
});

test("renders no standfirst paragraph when standfirst is omitted", async () => {
  const html = await render();
  expect(innerOf(html, "header")).not.toMatch(/<p\b/);
});

test("the old default tagline is gone", async () => {
  const html = await render();
  expect(html).not.toContain(OLD_TAGLINE);
});

test("renders the default slot inside main", async () => {
  const html = await render();
  expect(innerOf(html, "main")).toContain('data-testid="page-body"');
});
