import { describe, test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import StoryMeta from "../../src/components/StoryMeta.astro";
import { anchorsTo, classesOfParentOf, elements } from "../support/html";

const STORY_URL = "https://example.com/story";
const HN_URL = "https://news.ycombinator.com/item?id=1";
const LOBSTERS_URL = "https://lobste.rs/s/abc";
const DOMAIN = "example.com";

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    url: STORY_URL,
    domain: DOMAIN,
    age: "2h ago",
    badges: [
      { label: "HN", points: 150, discussionUrl: HN_URL },
      { label: "Lobsters", points: 80, discussionUrl: LOBSTERS_URL },
    ],
    ...overrides,
  };
}

async function render(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  return container.renderToString(StoryMeta, { props });
}

/** Every class used anywhere in the rendered row. */
function allClasses(html: string): string[] {
  return [...html.matchAll(/\bclass="([^"]*)"/g)].flatMap((m) =>
    m[1].split(/\s+/).filter(Boolean),
  );
}

const variants = [
  { name: "default", compact: false },
  { name: "compact", compact: true },
];

describe.each(variants)("$name variant", ({ compact }) => {
  test("the row sets its text at 12px", async () => {
    const html = await render(baseProps({ compact }));
    expect(classesOfParentOf(html, "div", DOMAIN)).toContain("text-xs");
  });

  test("nothing in the row uses a custom font size below 12px", async () => {
    const html = await render(baseProps({ compact }));
    const customSizes = allClasses(html).filter((c) =>
      /^text-\[[\d.]+(rem|em|px)\]$/.test(c),
    );
    expect(customSizes).toEqual([]);
  });

  test("every source badge link is at least 24px tall and centres its content", async () => {
    const html = await render(baseProps({ compact }));
    const badges = [
      ...anchorsTo(html, HN_URL),
      ...anchorsTo(html, LOBSTERS_URL),
    ];

    expect(badges).toHaveLength(2);
    for (const badge of badges) {
      expect(badge.classes).toEqual(
        expect.arrayContaining(["min-h-6", "inline-flex", "items-center"]),
      );
    }
  });

  test("the points number is shown in tabular figures and is not dimmed", async () => {
    const html = await render(baseProps({ compact }));
    const [badge] = anchorsTo(html, HN_URL);
    const points = elements(badge.inner, "span").find(
      (s) => s.inner.trim() === "150",
    );

    expect(points).toBeDefined();
    expect(points!.classes).toContain("tabular-nums");
    expect(points!.classes.filter((c) => c.includes("opacity-"))).toEqual([]);
    // No colour of its own either: it inherits the badge's muted colour.
    expect(points!.classes.filter((c) => c.includes("/"))).toEqual([]);
  });
});

test("a class passed by the parent is added to the row without replacing its 12px size", async () => {
  const html = await render(baseProps({ class: "mt-auto" }));
  const row = classesOfParentOf(html, "div", DOMAIN);

  expect(row).toContain("mt-auto");
  expect(row).toContain("text-xs");
});
