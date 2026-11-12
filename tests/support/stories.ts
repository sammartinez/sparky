/** A digest story shaped like the entries in data/digests/*.json. */
export function story(
  i: number,
  createdAt: string,
  overrides: Record<string, unknown> = {},
) {
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

/**
 * A digest collection entry for the ISO date `id`, shaped like what
 * `getCollection("digests")` returns, with one story per title.
 */
export function digestEntry(id: string, titles: string[] = []) {
  const generatedAt = `${id}T12:00:00.000Z`;
  return {
    id,
    collection: "digests",
    data: {
      date: id,
      generatedAt,
      windowHours: 36,
      stories: titles.map((title, i) => story(i + 1, generatedAt, { title })),
    },
  };
}
