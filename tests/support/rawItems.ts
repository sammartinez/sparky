/** RawItem fixtures for the rank pipeline, shaped like what scripts/sources.ts emits. */
import type { RawItem, Story } from "../../scripts/types.ts";

const HOUR_MS = 3_600_000;
const NOW = Date.now();

/** One HN item, an hour old, unless overridden. */
export function item(overrides: Partial<RawItem> = {}): RawItem {
  return {
    source: "hn",
    label: "HN",
    title: "t",
    url: "https://a.com/1",
    points: 100,
    comments: 10,
    createdAt: NOW - HOUR_MS,
    ...overrides,
  };
}

const DISTINCT_TITLES = [
  "Quantization tricks",
  "Browser agents reviewed",
  "Evaluation harness design",
  "Tokenizer bugs",
  "Vector databases compared",
  "Compiler fuzzing",
  "Speech synthesis",
  "Robot grasping",
];

/**
 * `n` unrelated items on one source with points 0, 20, 40, ... and titles too
 * different to merge. Five or more are enough peers that a source stops
 * getting the neutral 0.5 prior. `skip` starts further down the title list, so
 * two batches in one test do not share titles.
 */
export function distinctStories(
  domain: string,
  n: number,
  overrides: Partial<RawItem> = {},
  skip = 0,
): RawItem[] {
  return DISTINCT_TITLES.slice(skip, skip + n).map((title, i) =>
    item({
      url: `https://${domain}/${i}`,
      title,
      points: i * 20,
      ...overrides,
    }),
  );
}

/**
 * An HN story as the Algolia search API hands it back: an external URL plus
 * the thread it is discussed in. Each keyword query that matches the story
 * returns an identical hit, so the same RawItem arrives once per query.
 */
export function hnHit(
  objectID: number,
  overrides: Partial<RawItem> = {},
): RawItem {
  return item({
    discussionUrl: `https://news.ycombinator.com/item?id=${objectID}`,
    ...overrides,
  });
}

/** The same item as `n` separate objects, as `n` overlapping queries return it. */
export function copies(original: RawItem, n: number): RawItem[] {
  return Array.from({ length: n }, () => ({ ...original }));
}

/** Each ranked story's `normalized`, keyed by canonical URL. */
export function normalizedByUrl(stories: Story[]): Record<string, number> {
  return Object.fromEntries(stories.map((s) => [s.canonicalUrl, s.normalized]));
}
