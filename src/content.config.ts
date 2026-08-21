import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Each morning's run commits one JSON file here, so the archive is just the
// git history made browsable. Entry ids come from the filename: "2026-08-20".
const appearance = z.object({
  source: z.enum(["hn", "reddit", "lobsters", "hf", "rss"]),
  label: z.string(),
  points: z.number().nullable(),
  comments: z.number().nullable(),
  discussionUrl: z.string().optional(),
});

const story = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  canonicalUrl: z.string(),
  domain: z.string(),
  createdAt: z.string(),
  appearances: z.array(appearance),
  normalized: z.number(),
  score: z.number(),
  aiScore: z.number(),
  why: z.string(),
});

const digests = defineCollection({
  loader: glob({ pattern: "*.json", base: "./data/digests" }),
  schema: z.object({
    date: z.string(),
    generatedAt: z.string(),
    stories: z.array(story),
  }),
});

export const collections = { digests };
