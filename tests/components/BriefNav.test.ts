import { describe, test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import BriefNav from "../../src/components/BriefNav.astro";
import { href } from "../../src/lib/brief";
import {
  anchorsTo,
  elements,
  expectTapTargets,
  innerOf,
  textOf,
} from "../support/html";

const OLDER = "2026-11-04";
const NEWER = "2026-11-05";
const OLDER_HREF = href(`archive/${OLDER}`);
const NEWER_HREF = href(`archive/${NEWER}`);
const ARCHIVE_HREF = href("archive");
const ISO_DATE = /\d{4}-\d{2}-\d{2}/;
const EMPTY_SPAN_FIRST = /^\s*<span\b[^>]*>\s*<\/span>\s*<a\b/;
const EMPTY_SPAN_LAST = /<\/a>\s*<span\b[^>]*>\s*<\/span>\s*$/;

async function render(props: Record<string, unknown> = {}) {
  const container = await AstroContainer.create();
  return container.renderToString(BriefNav, { props });
}

/** Text of every link in the nav, in document order. */
function linkTexts(html: string): string[] {
  return elements(innerOf(html, "nav"), "a").map((a) => textOf(a.inner));
}

const sides = [
  { name: "both neighbours", props: { older: OLDER, newer: NEWER } },
  { name: "only an older brief", props: { older: OLDER } },
  { name: "only a newer brief", props: { newer: NEWER } },
  { name: "no neighbours", props: {} },
  { name: "null neighbours", props: { older: null, newer: null } },
];

describe.each(sides)("with $name", ({ props }) => {
  test("renders exactly one nav", async () => {
    const html = await render(props);
    expect(elements(html, "nav")).toHaveLength(1);
  });

  test("the All briefs link to the archive is present", async () => {
    const html = await render(props);
    const links = anchorsTo(innerOf(html, "nav"), ARCHIVE_HREF);
    expect(links.map((a) => textOf(a.inner))).toEqual(["All briefs"]);
  });

  test("every link is at least 44px tall and centres its content", async () => {
    const html = await render(props);
    expectTapTargets(elements(innerOf(html, "nav"), "a"));
  });

  test("no link shows an ISO date as its text", async () => {
    const html = await render(props);
    for (const text of linkTexts(html)) {
      expect(text).not.toMatch(ISO_DATE);
    }
  });
});

test("the older link reads an arrow then the short date and goes to that brief", async () => {
  const html = await render({ older: OLDER, newer: NEWER });
  const links = anchorsTo(html, OLDER_HREF);
  expect(links.map((a) => textOf(a.inner))).toEqual(["← Wed, Nov 4"]);
});

test("the newer link reads the short date then an arrow and goes to that brief", async () => {
  const html = await render({ older: OLDER, newer: NEWER });
  const links = anchorsTo(html, NEWER_HREF);
  expect(links.map((a) => textOf(a.inner))).toEqual(["Thu, Nov 5 →"]);
});

test("the links come in the order older, All briefs, newer", async () => {
  const html = await render({ older: OLDER, newer: NEWER });
  expect(linkTexts(html)).toEqual([
    "← Wed, Nov 4",
    "All briefs",
    "Thu, Nov 5 →",
  ]);
});

test("the short dates follow the ids they are given", async () => {
  const html = await render({ older: "2026-10-31", newer: "2026-11-02" });
  expect(linkTexts(html)).toEqual([
    "← Sat, Oct 31",
    "All briefs",
    "Mon, Nov 2 →",
  ]);
});

test("a missing older brief renders no link on that side", async () => {
  const html = await render({ newer: NEWER });
  expect(linkTexts(html)).toEqual(["All briefs", "Thu, Nov 5 →"]);
});

test("a missing older brief leaves an empty span in the first slot", async () => {
  const html = await render({ newer: NEWER });
  expect(innerOf(html, "nav")).toMatch(EMPTY_SPAN_FIRST);
});

test("a missing newer brief renders no link on that side", async () => {
  const html = await render({ older: OLDER });
  expect(linkTexts(html)).toEqual(["← Wed, Nov 4", "All briefs"]);
});

test("a missing newer brief leaves an empty span in the last slot", async () => {
  const html = await render({ older: OLDER });
  expect(innerOf(html, "nav")).toMatch(EMPTY_SPAN_LAST);
});

test("with no neighbours All briefs is the only link, between two empty spans", async () => {
  const html = await render();
  const nav = innerOf(html, "nav");
  expect(linkTexts(html)).toEqual(["All briefs"]);
  expect(nav).toMatch(EMPTY_SPAN_FIRST);
  expect(nav).toMatch(EMPTY_SPAN_LAST);
});

test("a null neighbour is treated as missing", async () => {
  const html = await render({ older: null, newer: null });
  expect(linkTexts(html)).toEqual(["All briefs"]);
});
