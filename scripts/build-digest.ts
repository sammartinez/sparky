import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchAll } from "./sources.ts";
import { rank } from "./rank.ts";
import { enrich, prefilter } from "./enrich.ts";
import type { Digest, Story } from "./types.ts";

const DATA_DIR = "data";
const DIGEST_DIR = join(DATA_DIR, "digests");
const SEEN_PATH = join(DATA_DIR, "seen.json");

/** Stories to keep in the published brief. */
const KEEP = Number(process.env.BRIEF_SIZE ?? 15);
/** How many candidates get the model pass. Costs pennies; keep it generous. */
const CANDIDATES = Number(process.env.CANDIDATE_POOL ?? 45);
/** Below this AI score, a story is not about AI. */
const AI_FLOOR = Number(process.env.AI_FLOOR ?? 5);
/** Days a story stays suppressed after it has been featured. */
const SEEN_DAYS = Number(process.env.SEEN_DAYS ?? 5);

type Seen = Record<string, string>; // story id -> ISO date it ran

/** Today in the brief's own timezone, not the runner's UTC. */
function briefDate(): string {
  const tz = process.env.BRIEF_TZ ?? "America/Boise";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function loadSeen(): Promise<Seen> {
  try {
    return JSON.parse(await readFile(SEEN_PATH, "utf8")) as Seen;
  } catch {
    return {};
  }
}

function pruneSeen(seen: Seen): Seen {
  const cutoff = Date.now() - SEEN_DAYS * 86_400_000;
  return Object.fromEntries(
    Object.entries(seen).filter(([, iso]) => new Date(iso).getTime() >= cutoff),
  );
}

async function main() {
  const date = briefDate();
  console.log(`Building brief for ${date}\n`);

  const raw = await fetchAll();
  console.log(`\n${raw.length} raw items`);
  if (raw.length === 0) {
    console.error("No items from any source. Refusing to write an empty brief.");
    process.exit(1);
  }

  const ranked = rank(raw);
  console.log(`${ranked.length} after dedupe`);

  const seen = pruneSeen(await loadSeen());
  const fresh = ranked.filter((s) => !seen[s.id]);
  console.log(`${fresh.length} not featured in the last ${SEEN_DAYS} days`);

  const candidates = prefilter(fresh, CANDIDATES);
  console.log(`${candidates.length} candidates to the model pass`);

  await enrich(candidates);

  // Fold AI relevance into the score. Squaring makes the penalty steep: a 6/10
  // keeps about a third of its traction score, a 3/10 keeps under a tenth.
  const stories: Story[] = candidates
    .filter((s) => s.aiScore >= AI_FLOOR)
    .map((s) => ({ ...s, score: Number((s.score * (s.aiScore / 10) ** 2).toFixed(3)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, KEEP);

  console.log(`\n${stories.length} stories in the brief`);

  const digest: Digest = {
    date,
    generatedAt: new Date().toISOString(),
    stories,
  };

  await mkdir(DIGEST_DIR, { recursive: true });
  await writeFile(join(DIGEST_DIR, `${date}.json`), JSON.stringify(digest, null, 2) + "\n");

  for (const s of stories) seen[s.id] = new Date().toISOString();
  await writeFile(SEEN_PATH, JSON.stringify(seen, null, 2) + "\n");

  for (const [i, s] of stories.entries()) {
    const where = s.appearances.map((a) => a.label).join(", ");
    console.log(`  ${String(i + 1).padStart(2)}. [${s.score.toFixed(1)}] ${s.title}  (${where})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
