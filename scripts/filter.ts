import type { Story } from "./types.ts";

/**
 * Keyword filter for "is this plausibly about AI". Loose on purpose: a stray
 * "model railway" story costs one slot, a missed model release costs the lead.
 * Matches title and domain, so vendor blogs pass even with a bland headline.
 */
const HINTS =
  /\b(?:ai|llms?|gpts?|claude|gemini|grok|llama|mistral|deepseek|qwen|openai|anthropic|deepmind|hugging ?face|nvidia|transformers?|diffusion|neural|machine learning|deep learning|inference|fine.?tun(?:e|ed|es|ing)|embeddings?|rag|agents?|agentic|prompt(?:s|ed|ing)?|tokens?|benchmarks?|datasets?|models?|chatbots?|copilots?|autonomous|robotics|gpus?|tpus?|cuda|alignment|superintelligence|agi)\b|\ba\.i\./i;

export function prefilter(stories: Story[]): Story[] {
  return stories.filter((s) => HINTS.test(s.title) || HINTS.test(s.domain));
}
