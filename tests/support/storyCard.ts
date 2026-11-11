/** Props for rendering StoryCard.astro in tests. */

/** Frozen "now", two hours after the fixture story was created. */
export const NOW = new Date("2026-01-15T12:00:00.000Z").getTime();

export const STORY_URL = "https://example.com/story";
export const STORY_DOMAIN = "example.com";

export function storyCardProps(overrides: Record<string, unknown> = {}) {
  return {
    rank: 3,
    title: "A very good story",
    url: STORY_URL,
    domain: STORY_DOMAIN,
    createdAt: "2026-01-15T10:00:00.000Z",
    normalized: 0.6,
    appearances: [{ source: "hn", label: "HN", points: 150, comments: 40 }],
    now: NOW,
    ...overrides,
  };
}
