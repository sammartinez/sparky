import { test, expect } from "vitest";
import { prefilter } from "../../scripts/filter.ts";
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
  };
}

test("prefilter keeps only AI-flavoured titles", () => {
  const out = prefilter([
    story("Splash-free urinals"),
    story("DeepSeek launches v4.1 flash"),
    story("bzip3"),
    story("Serving LLMs on Tenstorrent hardware"),
  ]);
  expect(out.map((s) => s.title)).toEqual([
    "DeepSeek launches v4.1 flash",
    "Serving LLMs on Tenstorrent hardware",
  ]);
});

test("prefilter matches on domain as well as title", () => {
  const out = prefilter([story("Introducing our new release", "openai.com")]);
  expect(out.length).toBe(1);
});

test("prefilter preserves the incoming order", () => {
  const out = prefilter([story("AI one"), story("AI two"), story("AI three")]);
  expect(out.map((s) => s.title)).toEqual(["AI one", "AI two", "AI three"]);
});

test("prefilter matches plurals and inflected forms", () => {
  const titles = [
    "Fine-tuning small models",
    "Coding agents in production",
    "Scaling laws for GPUs",
    "Transformers explained",
    "Chatbots and kids",
    "Prompting tricks",
    "The A.I. hype cycle",
    "New embeddings benchmarks",
    "ChatGPT gets a memory upgrade",
    "Robot comment classifier",
  ];
  expect(prefilter(titles.map((t) => story(t))).map((s) => s.title)).toEqual(
    titles,
  );
});

test("prefilter does not match words that merely start with a hint", () => {
  expect(prefilter([story("Raging debate over aid budgets")]).length).toBe(0);
});
