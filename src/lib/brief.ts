import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export type DigestEntry = CollectionEntry<"digests">;

/** Prefix a path with the configured base so it works on a project Pages site. */
export function href(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`.replace(/\/$/, "") || "/";
}

/** All digests, newest first. Ids are ISO dates so a string sort is enough. */
export async function allDigests(): Promise<DigestEntry[]> {
  const entries = await getCollection("digests");
  return entries.sort((a, b) => b.id.localeCompare(a.id));
}

const SOURCE_ORDER = ["hn", "reddit", "lobsters", "hf", "rss"];

/** Sort appearances so the badge order is stable across stories. */
export function orderedAppearances<T extends { source: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source),
  );
}

export function formatDate(iso: string): string {
  // Parse as a plain date, not a UTC instant, so it doesn't slip a day.
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function relativeAge(iso: string, now = Date.now()): string {
  const hours = Math.max(0, (now - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
