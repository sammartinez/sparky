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
