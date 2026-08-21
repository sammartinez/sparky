// Shared shapes for the fetch -> rank -> enrich pipeline.
// Kept to interfaces and type aliases only: these files run under Node's
// native type stripping, which does not support enums or namespaces.

export type SourceId = "hn" | "reddit" | "lobsters" | "hf" | "rss";

/** One story as it came back from a single source, before any merging. */
export interface RawItem {
  source: SourceId;
  /** Human label for the badge: "HN", "r/LocalLLaMA", "Lobsters", "HF Papers", or the feed name. */
  label: string;
  title: string;
  url: string;
  /** Where the conversation lives, when that differs from the article. */
  discussionUrl?: string;
  /** Upvotes / points. null for sources with no traction signal (RSS). */
  points: number | null;
  comments: number | null;
  /** Epoch milliseconds. */
  createdAt: number;
}

/** Where a merged story was seen. */
export interface Appearance {
  source: SourceId;
  label: string;
  points: number | null;
  comments: number | null;
  discussionUrl?: string;
}

/** A story after dedupe, normalization, ranking, and enrichment. */
export interface Story {
  id: string;
  title: string;
  url: string;
  canonicalUrl: string;
  domain: string;
  createdAt: string;
  appearances: Appearance[];
  /** 0..1 traction relative to peers on the same source. */
  normalized: number;
  /** Final rank score. Higher is hotter. */
  score: number;
  /** 0..10 from the enrichment pass. 5 when enrichment is skipped. */
  aiScore: number;
  /** One sentence on why it matters. Empty when enrichment is skipped. */
  why: string;
}

export interface Digest {
  date: string;
  generatedAt: string;
  stories: Story[];
}
