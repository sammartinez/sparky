import type { Story } from "./types.ts";

const MODEL = process.env.BRIEF_MODEL ?? "claude-haiku-4-5-20251001";
const API_KEY = process.env.ANTHROPIC_API_KEY;

/**
 * Cheap keyword prefilter. Deliberately loose: its job is to cut the candidate
 * pool before the model pass, not to decide anything. The model handles the
 * false positives this drags in ("apple orchard AI startup").
 */
const HINTS =
  /\b(ai|a\.i\.|llm|llms|gpt|claude|gemini|grok|llama|mistral|deepseek|qwen|openai|anthropic|deepmind|hugging ?face|nvidia|transformer|diffusion|neural|machine learning|deep learning|inference|fine.?tun|embedding|rag|agent|agentic|prompt|token|benchmark|dataset|model|chatbot|copilot|autonomous|robotics|gpu|tpu|cuda|alignment|superintelligence|agi)\b/i;

export function prefilter(stories: Story[], limit: number): Story[] {
  if (!API_KEY) return stories.slice(0, limit);
  const hits = stories.filter((s) => HINTS.test(s.title) || HINTS.test(s.domain));
  return hits.slice(0, limit);
}

interface Verdict {
  i: number;
  ai: number;
  why: string;
}

const SYSTEM = `You screen candidate stories for a personal daily AI news brief.

For each numbered story, return:
- "ai": 0-10, how much this is genuinely about artificial intelligence, machine learning, or the industry, research, policy, and infrastructure around it. A story that merely contains the word "AI" in passing, or is about an unrelated company that happens to also sell AI products, scores low. Core AI research, model releases, AI policy, AI infrastructure, and AI industry moves score high.
- "why": one sentence, max 20 words, on why this matters to a technically literate reader. Plain and specific. No hype, no "this could revolutionize". If the story is not about AI, leave it empty.

Respond with ONLY a JSON array of objects with keys "i", "ai", "why". No prose, no markdown fences.`;

async function callModel(batch: Story[], offset: number): Promise<Verdict[]> {
  const listing = batch
    .map((s, i) => `${offset + i}. ${s.title} — ${s.domain}`)
    .join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: "user", content: listing }],
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const text = (data.content ?? [])
    .filter((b: any) => b.type === "text")
    .map((b: any) => b.text)
    .join("")
    .replace(/```json|```/g, "")
    .trim();

  return JSON.parse(text) as Verdict[];
}

/**
 * Score AI relevance and write the one-line rationale. Degrades to a no-op
 * (everything keeps its neutral 5) when no API key is configured, so the
 * pipeline still produces a usable brief.
 */
export async function enrich(candidates: Story[]): Promise<Story[]> {
  if (!API_KEY) {
    console.warn("  ANTHROPIC_API_KEY not set — skipping enrichment");
    return candidates;
  }

  const BATCH = 20;
  for (let i = 0; i < candidates.length; i += BATCH) {
    const batch = candidates.slice(i, i + BATCH);
    try {
      const verdicts = await callModel(batch, i);
      for (const v of verdicts) {
        const story = candidates[v.i];
        if (!story) continue;
        story.aiScore = Math.max(0, Math.min(10, Number(v.ai) || 0));
        story.why = String(v.why ?? "").trim();
      }
    } catch (err) {
      console.warn(`  enrichment batch ${i} failed: ${(err as Error).message}`);
      // Leave the batch at its neutral prior rather than dropping it.
    }
  }
  return candidates;
}
