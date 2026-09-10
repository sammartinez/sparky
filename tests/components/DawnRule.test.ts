import { test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import DawnRule from "../../src/components/DawnRule.astro";

const GENERATED_AT = "2026-01-15T12:00:00.000Z";
const END = new Date(GENERATED_AT).getTime();
const HOUR = 3_600_000;

function hoursAgo(h: number) {
  return new Date(END - h * HOUR).toISOString();
}

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(DawnRule, { props });
}

/** Pull the one <span title="..."> tick the story's title identifies. */
function tickFor(html: string, title: string) {
  const match = html.match(new RegExp(`<span[^>]*title="${title}"[^>]*>`));
  expect(match, `no tick found for "${title}"`).toBeTruthy();
  const style = match![0].match(/style="([^"]*)"/)?.[1] ?? "";
  return {
    left: Number(style.match(/left:([\d.]+)%/)?.[1]),
    height: Number(style.match(/height:(\d+)px/)?.[1]),
    opacity: Number(style.match(/opacity:([\d.]+)/)?.[1]),
    hot: match![0].includes("bg-accent2"),
  };
}

test("sr-only caption reports the story count and window", async () => {
  const html = await render({
    stories: [{ title: "a", createdAt: hoursAgo(1), normalized: 0.5 }],
    generatedAt: GENERATED_AT,
    windowHours: 24,
  });
  const caption = html.replace(/\s+/g, " ");
  expect(caption).toContain("each of the 1 stories first appeared");
  expect(caption).toContain("the last 24 hours");
});

test("default 36h window shows the standard hour marks", async () => {
  const html = await render({ stories: [], generatedAt: GENERATED_AT });
  expect(html).toContain(">−36h<");
  expect(html).toContain(">−24h<");
  expect(html).toContain(">−12h<");
  expect(html).toContain(">now<");
});

test("a narrower window drops hour marks that would fall outside it", async () => {
  const html = await render({
    stories: [],
    generatedAt: GENERATED_AT,
    windowHours: 10,
  });
  expect(html).toContain(">−10h<");
  expect(html).toContain(">now<");
  expect(html).not.toContain(">−24h<");
  expect(html).not.toContain(">−12h<");
});

test("a story right at generatedAt sits at the right edge of the rule", async () => {
  const html = await render({
    stories: [{ title: "brand-new", createdAt: GENERATED_AT, normalized: 0.5 }],
    generatedAt: GENERATED_AT,
    windowHours: 36,
  });
  expect(tickFor(html, "brand-new").left).toBe(100);
});

test("a story older than the window clamps to the left edge instead of going negative", async () => {
  const html = await render({
    stories: [{ title: "ancient", createdAt: hoursAgo(100), normalized: 0.5 }],
    generatedAt: GENERATED_AT,
    windowHours: 36,
  });
  expect(tickFor(html, "ancient").left).toBe(0);
});

test("normalized >= 0.9 renders as a hot tick at full opacity", async () => {
  const html = await render({
    stories: [{ title: "hot-one", createdAt: hoursAgo(1), normalized: 0.95 }],
    generatedAt: GENERATED_AT,
  });
  const tick = tickFor(html, "hot-one");
  expect(tick.hot).toBe(true);
  expect(tick.opacity).toBe(1);
});

test("normalized below 0.9 renders as a dim, non-hot tick", async () => {
  const html = await render({
    stories: [{ title: "cool-one", createdAt: hoursAgo(1), normalized: 0.4 }],
    generatedAt: GENERATED_AT,
  });
  const tick = tickFor(html, "cool-one");
  expect(tick.hot).toBe(false);
  expect(tick.opacity).toBe(0.45);
});

test("tick height scales with normalized traction", async () => {
  const html = await render({
    stories: [{ title: "big", createdAt: hoursAgo(1), normalized: 1 }],
    generatedAt: GENERATED_AT,
  });
  // 5 + round(1 * 17) = 22
  expect(tickFor(html, "big").height).toBe(22);
});
