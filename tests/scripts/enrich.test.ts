import { test, expect } from "vitest";
import { prefilter } from "../../scripts/enrich.ts";
import type { Story } from "../../scripts/types.ts";

function story(title: string, domain = "example.com"): Story {
  return {
    id: title,
    title,
    url: `https://${domain}/x`,
    canonicalUrl: `https://${domain}/x`,
    domain,
    createdAt: new Date().toISOString(),
    appearances: [],
    normalized: 0.5,
    score: 1,
    aiScore: 5,
    why: "",
  };
}

test("prefilter keeps only AI-flavoured titles, with or without an API key", () => {
  const out = prefilter(
    [
      story("Splash-free urinals"),
      story("DeepSeek launches v4.1 flash"),
      story("bzip3"),
      story("Serving LLMs on Tenstorrent hardware"),
    ],
    10,
  );
  expect(out.map((s) => s.title)).toEqual([
    "DeepSeek launches v4.1 flash",
    "Serving LLMs on Tenstorrent hardware",
  ]);
});

test("prefilter matches on domain as well as title", () => {
  const out = prefilter([story("Introducing our new model", "openai.com")], 10);
  expect(out.length).toBe(1);
});

test("prefilter respects the pool limit after filtering", () => {
  const out = prefilter(
    [story("AI one"), story("AI two"), story("AI three")],
    2,
  );
  expect(out.length).toBe(2);
});
