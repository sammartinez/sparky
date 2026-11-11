import { test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import StoryCard from "../../src/components/StoryCard.astro";
import { classesOfParentOf, elements } from "../support/html";

const NOW = new Date("2026-01-15T12:00:00.000Z").getTime();
const DOMAIN = "example.com";

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    rank: 3,
    title: "A very good story",
    url: "https://example.com/story",
    domain: DOMAIN,
    createdAt: "2026-01-15T10:00:00.000Z",
    normalized: 0.6,
    appearances: [{ source: "hn", label: "HN", points: 150, comments: 40 }],
    now: NOW,
    variant: "grid",
    ...overrides,
  };
}

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(StoryCard, { props });
}

/** Classes of the metadata row: the element whose first child is the domain. */
function metaRow(html: string): string[] {
  return classesOfParentOf(html, "div", DOMAIN);
}

test("the grid card lays its content out as a column", async () => {
  const html = await render(baseProps());
  const [card] = elements(html, "article");

  expect(card.classes).toContain("flex");
  expect(card.classes).toContain("flex-col");
});

test("the grid card pushes its metadata row to the bottom edge", async () => {
  const html = await render(baseProps());

  expect(metaRow(html)).toContain("mt-auto");
});

test("the grid card's metadata row has no second top margin fighting the push to the bottom", async () => {
  const html = await render(baseProps());
  const margins = metaRow(html).filter((c) => /^-?mt-/.test(c));

  expect(margins).toEqual(["mt-auto"]);
});

test("the grid card's metadata row keeps its top rule and the padding above it", async () => {
  const html = await render(baseProps());
  const row = metaRow(html);

  expect(row).toEqual(
    expect.arrayContaining(["border-rule", "border-t", "pt-3.5"]),
  );
});

test("the grid card still has the half-width column span and its padding", async () => {
  const html = await render(baseProps());
  const [card] = elements(html, "article");

  expect(card.classes).toEqual(
    expect.arrayContaining([
      "col-span-6",
      "sm:col-span-3",
      "px-6",
      "py-6",
      "relative",
    ]),
  );
});

test("the grid card's rank number renders exactly as before", async () => {
  const html = await render(baseProps({ rank: 3 }));

  expect(html).toContain(
    '<span class="bg-accent text-paper absolute -top-3.5 left-4 px-2.5 py-1 font-mono text-xs tabular-nums">03</span>',
  );
});

test("the grid card's rank bar renders exactly as before", async () => {
  const html = await render(baseProps({ normalized: 0.6 }));

  expect(html).toMatch(
    /<span class="bg-rule mt-2 block h-0\.75 w-full overflow-hidden rounded-full">\s*<span class="bg-accent block h-full" style="width:60%"><\/span>\s*<\/span>/,
  );
});
