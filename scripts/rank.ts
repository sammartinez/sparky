import { createHash } from "node:crypto";
import type { Appearance, RawItem, SourceId, Story } from "./types.ts";

const GRAVITY = Number(process.env.GRAVITY ?? 1.8);
/** Title similarity above this counts as the same story from a different outlet. */
const TITLE_THRESHOLD = Number(process.env.TITLE_THRESHOLD ?? 0.6);

const TRACKING_PARAMS = [
  /^utm_/i, /^fbclid$/i, /^gclid$/i, /^mc_(cid|eid)$/i, /^igshid$/i,
  /^ref$/i, /^ref_src$/i, /^referrer$/i, /^source$/i, /^_hs(enc|mi)$/i,
  /^spm$/i, /^cmpid$/i, /^ncid$/i, /^at_medium$/i, /^at_campaign$/i,
];

// ---------------------------------------------------------------------------
// Canonicalization — the cheap half of dedupe.
// ---------------------------------------------------------------------------

export function canonicalize(raw: string): string {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return raw.trim().toLowerCase();
  }

  u.protocol = "https:";
  u.hash = "";
  u.hostname = u.hostname.toLowerCase().replace(/^(www|m|amp|mobile)\./, "");

  for (const key of [...u.searchParams.keys()]) {
    if (TRACKING_PARAMS.some((re) => re.test(key))) u.searchParams.delete(key);
  }
  u.searchParams.sort();

  // arXiv: /pdf/2501.12345v2 and /abs/2501.12345 are the same paper.
  if (u.hostname === "arxiv.org") {
    const m = u.pathname.match(/\/(?:abs|pdf)\/([0-9.]+?)(?:v\d+)?(?:\.pdf)?$/);
    if (m) u.pathname = `/abs/${m[1]}`;
  }

  // Google's AMP proxy wraps the real URL in the path.
  if (u.hostname.endsWith("cdn.ampproject.org")) {
    const m = u.pathname.match(/\/v\/s\/(.+)$/);
    if (m) return canonicalize(`https://${m[1]}`);
  }

  u.pathname = u.pathname.replace(/\/+$/, "") || "/";
  u.pathname = u.pathname.replace(/\/amp$/, "");

  return u.toString().replace(/\?$/, "");
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Title similarity — the expensive half. Catches the same story covered by
// TechCrunch and The Verge under different URLs.
// ---------------------------------------------------------------------------

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for",
  "with", "is", "are", "how", "why", "what", "new", "show", "hn", "ask",
]);

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[\u2018\u2019\u201c\u201d]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w))
    .join(" ");
}

function trigrams(s: string): Set<string> {
  const padded = `  ${s} `;
  const out = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) out.add(padded.slice(i, i + 3));
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let shared = 0;
  for (const t of a) if (b.has(t)) shared++;
  return shared / (a.size + b.size - shared);
}

// ---------------------------------------------------------------------------
// Per-source normalization. 400 HN points and 400 Reddit upvotes are not the
// same thing, so score each item against its own source's distribution in
// this batch rather than against a global scale.
// ---------------------------------------------------------------------------

function percentileTable(items: RawItem[]): Map<SourceId, number[]> {
  const table = new Map<SourceId, number[]>();
  for (const item of items) {
    if (item.points === null) continue;
    const list = table.get(item.source) ?? [];
    list.push(item.points);
    table.set(item.source, list);
  }
  for (const list of table.values()) list.sort((a, b) => a - b);
  return table;
}

function percentile(sorted: number[] | undefined, value: number): number {
  // Too few peers to say anything meaningful — give it a neutral prior.
  if (!sorted || sorted.length < 5) return 0.5;
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < value) lo = mid + 1;
    else hi = mid;
  }
  return lo / sorted.length;
}

// ---------------------------------------------------------------------------
// Merge + rank.
// ---------------------------------------------------------------------------

function idFor(canonicalUrl: string): string {
  return createHash("sha1").update(canonicalUrl).digest("hex").slice(0, 12);
}

/** Prefer the shortest title: usually the cleanest, least editorialized version. */
function bestTitle(a: string, b: string): string {
  return b.length < a.length ? b : a;
}

export function rank(items: RawItem[]): Story[] {
  const table = percentileTable(items);

  // Pass 1: merge on canonical URL.
  const byUrl = new Map<string, { title: string; url: string; canonicalUrl: string; createdAt: number; appearances: Appearance[]; norms: number[] }>();

  for (const item of items) {
    if (!item.url) continue;
    const canonicalUrl = canonicalize(item.url);
    const norm = percentile(table.get(item.source), item.points ?? 0);
    const existing = byUrl.get(canonicalUrl);
    const appearance: Appearance = {
      source: item.source,
      label: item.label,
      points: item.points,
      comments: item.comments,
      discussionUrl: item.discussionUrl,
    };

    if (existing) {
      existing.title = bestTitle(existing.title, item.title);
      existing.createdAt = Math.min(existing.createdAt, item.createdAt);
      // Same source twice (e.g. two subreddits) counts once for corroboration
      // but keeps the higher-traction appearance.
      const dupe = existing.appearances.find((a) => a.label === item.label);
      if (dupe) {
        if ((item.points ?? 0) > (dupe.points ?? 0)) Object.assign(dupe, appearance);
      } else {
        existing.appearances.push(appearance);
        existing.norms.push(norm);
      }
    } else {
      byUrl.set(canonicalUrl, {
        title: item.title,
        url: item.url,
        canonicalUrl,
        createdAt: item.createdAt,
        appearances: [appearance],
        norms: [norm],
      });
    }
  }

  // Pass 2: merge near-identical titles across different URLs.
  const merged = [...byUrl.values()].map((e) => ({ ...e, tri: trigrams(normalizeTitle(e.title)) }));
  merged.sort((a, b) => b.appearances.length - a.appearances.length);

  const kept: typeof merged = [];
  for (const entry of merged) {
    const twin = kept.find((k) => jaccard(k.tri, entry.tri) >= TITLE_THRESHOLD);
    if (!twin) {
      kept.push(entry);
      continue;
    }
    twin.createdAt = Math.min(twin.createdAt, entry.createdAt);
    for (const [i, appearance] of entry.appearances.entries()) {
      if (twin.appearances.some((a) => a.label === appearance.label)) continue;
      twin.appearances.push(appearance);
      twin.norms.push(entry.norms[i]);
    }
  }

  // Pass 3: score.
  const now = Date.now();
  return kept
    .map((entry): Story => {
      const normalized = Math.max(...entry.norms);
      const ageHours = Math.max(0, (now - entry.createdAt) / 3_600_000);
      // Appearing in more than one place is the best available proxy for
      // "getting traction on the wider web", so it multiplies rather than adds.
      const corroboration = 1 + 0.5 * (entry.appearances.length - 1);
      const score =
        (normalized * 100 * corroboration) / Math.pow(ageHours + 2, GRAVITY);

      return {
        id: idFor(entry.canonicalUrl),
        title: entry.title,
        url: entry.url,
        canonicalUrl: entry.canonicalUrl,
        domain: domainOf(entry.url),
        createdAt: new Date(entry.createdAt).toISOString(),
        appearances: entry.appearances,
        normalized: Number(normalized.toFixed(3)),
        score: Number(score.toFixed(3)),
        aiScore: 5,
        why: "",
      };
    })
    .sort((a, b) => b.score - a.score);
}
