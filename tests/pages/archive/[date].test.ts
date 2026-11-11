import { test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import DatePage from "../../../src/pages/archive/[date].astro";
import { headings, headingsAt, innerOf } from "../../support/html";
import { story } from "../../support/stories";

const DATE = "2026-11-09";
const GENERATED_AT = "2026-11-09T12:00:00.000Z";

async function render(storyCount = 2, date = DATE) {
  const stories = Array.from({ length: storyCount }, (_, i) =>
    story(i + 1, GENERATED_AT),
  );
  const container = await AstroContainer.create();
  return container.renderToString(DatePage, {
    params: { date },
    props: {
      entry: {
        id: date,
        data: { date, generatedAt: GENERATED_AT, windowHours: 36, stories },
      },
      newer: null,
      older: null,
    },
  });
}

test("an archived brief has exactly one h1 reading the brief's long date", async () => {
  const html = await render();
  expect(headingsAt(html, 1).map((h) => h.text)).toEqual([
    "Monday, November 9, 2026",
  ]);
});

test("the h1 follows the entry's date, not a fixed day", async () => {
  const html = await render(2, "2026-01-01");
  expect(headingsAt(html, 1).map((h) => h.text)).toEqual([
    "Thursday, January 1, 2026",
  ]);
});

test("an archived brief passes no standfirst", async () => {
  const html = await render();
  expect(innerOf(html, "header")).not.toMatch(/<p\b/);
});

test("the long date appears once in the header, as the h1 only", async () => {
  const html = await render();
  expect(
    innerOf(html, "header").split("Monday, November 9, 2026"),
  ).toHaveLength(2);
});

test("an archived brief with no stories still has exactly one h1", async () => {
  const html = await render(0);
  expect(headingsAt(html, 1).map((h) => h.text)).toEqual([
    "Monday, November 9, 2026",
  ]);
});

test("a full brief keeps one h1 with Also today as an h2 beneath it", async () => {
  const html = await render(7);
  expect(headingsAt(html, 1)).toHaveLength(1);
  expect(headingsAt(html, 2).map((h) => h.text)).toContain("Also today");
});

test("the archived brief wordmark is not inside a heading", async () => {
  const html = await render();
  for (const heading of headings(html)) {
    expect(heading.text).not.toContain("Sparky News");
  }
});
