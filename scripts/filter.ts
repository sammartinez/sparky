import type { Story } from "./types.ts";

/**
 * Keyword filter for "is this plausibly about AI". Loose on purpose: a stray
 * "model railway" story costs one slot, a missed model release costs the lead.
 * Matches title and domain, so vendor blogs pass even with a bland headline.
 */
const HINTS =
  /\b(ai|a\.i\.|llm|llms|gpt|claude|gemini|grok|llama|mistral|deepseek|qwen|openai|anthropic|deepmind|hugging ?face|nvidia|transformer|diffusion|neural|machine learning|deep learning|inference|fine.?tun|embedding|rag|agent|agentic|prompt|token|benchmark|dataset|model|chatbot|copilot|autonomous|robotics|gpu|tpu|cuda|alignment|superintelligence|agi)\b/i;

export function prefilter(stories: Story[]): Story[] {
  return stories.filter((s) => HINTS.test(s.title) || HINTS.test(s.domain));
}
