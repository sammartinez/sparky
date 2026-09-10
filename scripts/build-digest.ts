import chalk from "chalk";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchAll } from "./sources.ts";
import { rank, redecay } from "./rank.ts";
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

async function loadDigest(date: string): Promise<Digest | null> {
  try {
    return JSON.parse(
      await readFile(join(DIGEST_DIR, `${date}.json`), "utf8"),
    ) as Digest;
  } catch {
    return null;
  }
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

/**
 * Stamp every story from the last SEEN_DAYS of published briefs, keyed by the
 * date it ran. Reading the digest files rather than just yesterday's means a
 * skipped or failed run can't let a story from two days ago resurface.
 */
async function markRecentlyFeatured(seen: Seen, today: string): Promise<void> {
  const cutoff = Date.now() - SEEN_DAYS * 86_400_000;
  let files: string[];
  try {
    files = await readdir(DIGEST_DIR);
  } catch {
    return;
  }
  for (const file of files) {
    const date = file.match(/^(\d{4}-\d{2}-\d{2})\.json$/)?.[1];
    if (!date || date >= today) continue;
    const ranAt = `${date}T00:00:00.000Z`;
    if (new Date(ranAt).getTime() < cutoff) continue;
    const digest = await loadDigest(date);
    for (const story of digest?.stories ?? []) seen[story.id] = ranAt;
  }
}

/** Fold AI relevance into the score. Squaring makes the penalty steep: a 6/10
 * keeps about a third of its traction score, a 3/10 keeps under a tenth. */
function scoreStories(candidates: Story[]): Story[] {
  return candidates
    .filter((s) => s.aiScore >= AI_FLOOR)
    .map((s) => ({
      ...s,
      score: Number((s.score * (s.aiScore / 10) ** 2).toFixed(3)),
    }));
}

async function main() {
  const date = briefDate();
  console.log(chalk.bold.cyan(`Building brief for ${date}`) + "\n");

  const existing = await loadDigest(date);
  if (existing) {
    console.log(
      chalk.yellow(
        `A brief for ${date} already exists with ${existing.stories.length} stories; checking for updates.`,
      ),
    );
  }

  const raw = await fetchAll();
  console.log(chalk.dim(`\n${raw.length} raw items`));
  if (raw.length === 0) {
    if (existing) {
      console.log(
        chalk.yellow(
          "No items from any source this run; leaving today's brief as is.",
        ),
      );
      return;
    }
    console.error(
      chalk.red("No items from any source. Refusing to write an empty brief."),
    );
    process.exit(1);
  }

  const ranked = rank(raw);
  console.log(chalk.dim(`${ranked.length} after dedupe`));

  const seen = pruneSeen(await loadSeen());
  await markRecentlyFeatured(seen, date);

  // Exclude stories already sitting in today's brief so a second run only
  // brings in what's genuinely new, not a re-scored copy of the same story.
  const alreadyToday = new Set((existing?.stories ?? []).map((s) => s.id));
  const fresh = ranked.filter((s) => !seen[s.id] && !alreadyToday.has(s.id));
  console.log(
    chalk.dim(
      `${fresh.length} new since the last run, not featured in the last ${SEEN_DAYS} days`,
    ),
  );

  if (fresh.length === 0 && existing) {
    console.log(
      chalk.yellow(
        "Nothing new since the last run; leaving today's brief as is.",
      ),
    );
    return;
  }

  const candidates = prefilter(fresh, CANDIDATES);
  console.log(chalk.dim(`${candidates.length} candidates to the model pass`));

  await enrich(candidates);

  // Stories carried over from an earlier run today were scored on that run's
  // clock. Age them forward so they compete fairly with the new candidates.
  const now = Date.now();
  const carried = existing
    ? existing.stories.map((s) =>
        redecay(s, new Date(existing.generatedAt).getTime(), now),
      )
    : [];

  const stories = [...carried, ...scoreStories(candidates)]
    .sort((a, b) => b.score - a.score)
    .slice(0, KEEP);

  if (
    existing &&
    stories.map((s) => s.id).join() === existing.stories.map((s) => s.id).join()
  ) {
    console.log(
      chalk.yellow("\nNo change to today's lineup; nothing to publish."),
    );
    return;
  }

  console.log(chalk.bold.green(`\n${stories.length} stories in the brief`));

  const digest: Digest = {
    date,
    generatedAt: new Date().toISOString(),
    stories,
  };

  await mkdir(DIGEST_DIR, { recursive: true });
  await writeFile(
    join(DIGEST_DIR, `${date}.json`),
    JSON.stringify(digest, null, 2) + "\n",
  );
  await writeFile(SEEN_PATH, JSON.stringify(seen, null, 2) + "\n");

  for (const [i, s] of stories.entries()) {
    const where = s.appearances.map((a) => a.label).join(", ");
    console.log(
      `  ${chalk.dim(String(i + 1).padStart(2) + ".")} ` +
        `${chalk.green(`[${s.score.toFixed(1)}]`)} ${s.title}  ${chalk.dim(`(${where})`)}`,
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
