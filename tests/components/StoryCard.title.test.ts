import { describe, test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import StoryCard from "../../src/components/StoryCard.astro";
import { anchorsTo, readText } from "../support/html";
import { STORY_URL, storyCardProps } from "../support/storyCard";

/** The badge has its own discussion url, so the title is the only link to STORY_URL. */
function baseProps(overrides: Record<string, unknown> = {}) {
  return storyCardProps({
    appearances: [
      {
        source: "hn",
        label: "HN",
        points: 150,
        comments: 40,
        discussionUrl: "https://news.ycombinator.com/item?id=1",
      },
    ],
    ...overrides,
  });
}

async function titleLink(props: Record<string, unknown>) {
  const container = await AstroContainer.create();
  const html = await container.renderToString(StoryCard, { props });
  const links = anchorsTo(html, STORY_URL);
  expect(links).toHaveLength(1);
  return links[0];
}

describe.each(["feature", "grid", "compact"])("%s variant", (variant) => {
  test("the title link is underlined at rest in the muted colour", async () => {
    const link = await titleLink(baseProps({ variant }));

    expect(link.classes).toContain("underline");
    expect(link.classes).toContain("decoration-muted");
    expect(link.classes).not.toContain("decoration-rule");
  });

  test("the title text and its underline turn the accent colour on hover", async () => {
    const link = await titleLink(baseProps({ variant }));

    expect(link.classes).toContain("hover:text-accent");
    expect(link.classes).toContain("hover:decoration-accent");
  });

  test("the title link reads as the title, a space, then the new-tab note", async () => {
    const link = await titleLink(baseProps({ variant }));

    expect(readText(link.inner)).toBe("A very good story (opens in new tab)");
  });

  test("the new-tab note stays screen-reader only, after a single whitespace character", async () => {
    const link = await titleLink(baseProps({ variant }));

    expect(link.inner).toMatch(
      /A very good story\s<span class="sr-only">\(opens in new tab\)<\/span>/,
    );
  });
});

test("a title that ends in punctuation is still separated from the new-tab note", async () => {
  const link = await titleLink(
    baseProps({ title: "Is this the end?", variant: "grid" }),
  );

  expect(readText(link.inner)).toBe("Is this the end? (opens in new tab)");
});
