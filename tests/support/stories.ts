import type { Digest, Story } from "../../scripts/types.ts";

/** A digest story shaped like the entries in data/digests/*.json. */
export function story(
  i: number,
  createdAt: string,
  overrides: Partial<Story> = {},
): Story {
  return {
    id: `s${i}`,
    title: `Story ${i}`,
    url: `https://example.com/${i}`,
    canonicalUrl: `https://example.com/${i}`,
    domain: "example.com",
    createdAt,
    appearances: [{ source: "hn", label: "HN", points: 100, comments: 10 }],
    normalized: 0.5,
    score: 1,
    ...overrides,
  };
}

/** A brief as scripts/build-digest.ts writes it, dated by its `generatedAt` day. */
export function digest(generatedAt: string, stories: Story[] = []): Digest {
  return {
    date: generatedAt.slice(0, 10),
    generatedAt,
    windowHours: 36,
    stories,
  };
}

/**
 * A digest collection entry for the ISO date `id`, shaped like what
 * `getCollection("digests")` returns, with one story per title.
 */
export function digestEntry(id: string, titles: string[] = []) {
  const generatedAt = `${id}T12:00:00.000Z`;
  return {
    id,
    collection: "digests",
    data: digest(
      generatedAt,
      titles.map((title, i) => story(i + 1, generatedAt, { title })),
    ),
  };
}
