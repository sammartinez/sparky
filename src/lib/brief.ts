import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";
import {
  DATE_LOCALE,
  ISO_DATE_SEPARATOR,
  LONG_DATE_FORMAT,
  MONTH_FORMAT,
  MONTH_KEY_LENGTH,
  ROUTE_ARCHIVE,
  SHORT_DATE_FORMAT,
} from "../constants";

export type DigestEntry = CollectionEntry<"digests">;

/** Prefix a path with the configured base so it works on a project Pages site. */
export function href(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`.replace(/\/$/, "") || "/";
}

/** Link to one archived brief by its id (an ISO date). */
export function briefHref(id: string): string {
  return href(`${ROUTE_ARCHIVE}/${id}`);
}

/** All digests, newest first. Ids are ISO dates so a string sort is enough. */
export async function allDigests(): Promise<DigestEntry[]> {
  const entries = await getCollection("digests");
  return entries.sort((a, b) => b.id.localeCompare(a.id));
}

const SOURCE_ORDER = ["hn", "lobsters", "hf", "rss"];

/** Sort appearances so the badge order is stable across stories. */
export function orderedAppearances<T extends { source: string }>(
  items: T[],
): T[] {
  return [...items].sort(
    (a, b) => SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source),
  );
}

function formatPlainDate(
  iso: string,
  format: Intl.DateTimeFormatOptions,
): string {
  // Parse as a plain date, not a UTC instant, so it doesn't slip a day.
  const [y, m, d] = iso.split(ISO_DATE_SEPARATOR).map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(DATE_LOCALE, format);
}

export function formatDate(iso: string): string {
  return formatPlainDate(iso, LONG_DATE_FORMAT);
}

export function formatShortDate(iso: string): string {
  return formatPlainDate(iso, SHORT_DATE_FORMAT);
}

export function formatMonth(iso: string): string {
  return formatPlainDate(iso, MONTH_FORMAT);
}

export interface MonthGroup<T> {
  /** "YYYY-MM" */
  key: string;
  label: string;
  entries: T[];
}

/** Group consecutive entries whose id (an ISO date) falls in the same month. */
export function groupByMonth<T extends { id: string }>(
  entries: T[],
): MonthGroup<T>[] {
  const groups: MonthGroup<T>[] = [];
  for (const entry of entries) {
    const key = entry.id.slice(0, MONTH_KEY_LENGTH);
    const current = groups[groups.length - 1];
    if (current?.key === key) current.entries.push(entry);
    else groups.push({ key, label: formatMonth(entry.id), entries: [entry] });
  }
  return groups;
}

export function relativeAge(iso: string, now = Date.now()): string {
  const hours = Math.max(0, (now - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
