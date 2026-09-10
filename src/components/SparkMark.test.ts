import { test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import SparkMark from "./SparkMark.astro";

async function render(props: Record<string, unknown> = {}) {
  const container = await AstroContainer.create();
  return container.renderToString(SparkMark, { props });
}

test("renders the shared spark glyph", () => {
  return render().then((html) => {
    expect(html).toContain('viewBox="0 0 100 100"');
    expect(html).toContain('points="62,3 20,55 46,55 38,97 88,38 56,38"');
  });
});

test("passes the class prop through to the svg", async () => {
  const html = await render({ class: "h-9 w-9 shrink-0" });
  expect(html).toMatch(/<svg[^>]*class="h-9 w-9 shrink-0"/);
});

test("gradient tracks the site's --color-accent token instead of a hardcoded hex", async () => {
  const html = await render();
  expect(html).toContain("stop-color: var(--color-accent)");
  expect(html).toContain(
    "stop-color: color-mix(in srgb, var(--color-accent) 35%, white)",
  );
});

test("each render gets its own gradient id, so two marks on one page don't collide", async () => {
  const [first, second] = await Promise.all([render(), render()]);
  const idOf = (html: string) =>
    html.match(/linearGradient id="(spark-[a-z0-9]+)"/)?.[1];
  const firstId = idOf(first);
  const secondId = idOf(second);
  expect(firstId).toBeTruthy();
  expect(secondId).toBeTruthy();
  expect(firstId).not.toEqual(secondId);
  // The polygon must reference the same id its own <defs> declared.
  expect(first).toContain(`fill="url(#${firstId})"`);
});
