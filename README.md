# Sparky News

A personal daily AI brief. A GitHub Action wakes up each morning, pulls from
Hacker News, Reddit, Lobsters, Hugging Face and a short list of feeds, ranks
what's actually getting traction, and commits the result as JSON. Astro builds
a static site from those files and GitHub Pages serves it.

No server, no database, no host beyond GitHub. The backend is a cron job.

```
Actions cron ──▶ fetch ──▶ dedupe ──▶ rank ──▶ Claude filter ──▶ data/digests/YYYY-MM-DD.json
                                                                          │
                                                                          ▼
                                                          Astro build ──▶ Pages
```

Committing the JSON rather than fetching at build time means the archive comes
free — every past brief is a file in git.

## Setup

Runs on Astro 7.2.4 (Vite 8 / Rolldown, Rust compiler). Requires Node 22.18 or newer. The
pipeline scripts are `.ts` files run directly by Node's native type stripping,
so there's no build step and no `tsx`.

```bash
npm install
npm run digest    # builds today's brief into data/digests/
npm run dev       # http://localhost:4321
```

Then, to put it online:

1. **Set your URLs.** In `astro.config.mjs`, change `SITE` to
   `https://<your-username>.github.io` and `BASE` to `/<your-repo-name>`. The
   workflow overrides both from the Pages config at deploy time, so this only
   matters for local builds.
2. **Enable Pages.** Repo Settings → Pages → Source: **GitHub Actions**.
3. **Add the API key.** Settings → Secrets and variables → Actions → New
   repository secret, named `ANTHROPIC_API_KEY`. Without it the pipeline still
   runs, it just skips the relevance filter and the one-line summaries.
4. **Run it once by hand.** Actions tab → Daily brief → Run workflow.

## How the ranking works

**Normalize within source first.** 400 HN points and 400 Reddit upvotes mean
completely different things, so each item is scored as a percentile against
other items from the same source in the same batch. Feeds with no vote signal
get a neutral 0.5 — they're on the list for precision, not traction.

**Dedupe in two passes.** Canonical URL first (strip `utm_*`, `fbclid`, `www.`,
`m.`, AMP wrappers; normalize arXiv `/pdf/…v2` to `/abs/…`). Then trigram
Jaccard on titles at 0.6, which catches the same story covered by two outlets
under different URLs.

**Corroboration multiplies.** A story appearing in three places gets 2×; two
places, 1.5×. Cross-source pickup is the best cheap proxy for "getting traction
on the wider web", so it multiplies rather than adds.

**Then HN-style gravity.**

```
score = (normalized × 100 × corroboration) / (ageHours + 2)^1.8
```

**Finally, relevance.** The top candidates go to Claude Haiku in one batched
call, which scores each 0–10 on whether it's actually about AI and writes a
one-sentence "why this matters". The AI score folds back in squared, so a 6/10
keeps about a third of its traction score and a 3/10 keeps under a tenth. This
is what kills the false positives keyword matching drags in — "Apple
Intelligence" versus "apple orchard startup adds AI". Costs pennies a day and
it's the whole difference between a brief and an RSS dump.

**Repeats are suppressed** for five days via `data/seen.json`, so yesterday's
top story doesn't lead again this morning.

## Tuning

Everything is an environment variable, so you can experiment without editing
code:

| Variable | Default | What it does |
|---|---|---|
| `BRIEF_SIZE` | `15` | Stories in the published brief |
| `AI_FLOOR` | `5` | Minimum AI score to make the cut |
| `GRAVITY` | `1.8` | Higher decays old stories faster |
| `WINDOW_HOURS` | `36` | How far back sources are pulled |
| `HN_MIN_POINTS` | `25` | Points bar for the broad HN sweep |
| `TITLE_THRESHOLD` | `0.6` | Title similarity that counts as a duplicate |
| `SEEN_DAYS` | `5` | Days a featured story stays suppressed |
| `CANDIDATE_POOL` | `45` | Candidates sent to the model pass |
| `BRIEF_TZ` | `America/Boise` | Which day the brief is filed under |
| `BRIEF_MODEL` | `claude-haiku-4-5-20251001` | Model for the relevance pass |

Sources live at the top of `scripts/sources.ts` — `SUBREDDITS` and `FEEDS` are
plain arrays, edit freely.

```bash
BRIEF_SIZE=25 AI_FLOOR=7 npm run digest
```

## Things that will bite you eventually

- **Cron is UTC and ignores DST.** `0 12 * * *` is 6am Mountain in summer, 5am
  in winter. Scheduled runs can also be delayed 5–15 minutes when the runner
  pool is busy. `workflow_dispatch` is enabled so you can always kick it by hand.
- **Scheduled workflows auto-disable after ~60 days of repo inactivity.** The
  Action's own commits count as activity, so this only bites if the workflow is
  already broken. Worth knowing before you wonder why it went quiet in October.
- **Pushes made with `GITHUB_TOKEN` don't trigger other workflows.** That's why
  deploy is a dependent job in the same workflow rather than a separate
  push-triggered one.
- **Reddit 403s** requests with a default User-Agent, and rate-limits
  unauthenticated bursts. There's a deliberate 1.2s pause between subreddits.
- **A dead source doesn't kill the run.** Each fetcher is wrapped; failures log
  and return empty. The run only aborts if *every* source fails, which prevents
  committing an empty brief over a good one.
- **Astro's content layer caches deleted entries** in `node_modules/.astro`. If
  you delete a digest file locally and it still shows up, `rm -rf
  node_modules/.astro` and rebuild. CI is unaffected — `npm ci` starts clean.
- **Astro 7 uses a Rust compiler that no longer fixes invalid HTML for you.**
  Unclosed tags are now hard errors, and bad nesting (a `<div>` inside a `<p>`)
  is passed through instead of silently restructured — which can change layout
  with nothing failing. Worth knowing when editing templates.
- **`compressHTML` defaults to `'jsx'` in Astro 7**, so whitespace between
  inline elements is stripped. Every gap in this design comes from a Tailwind
  `gap-*` utility rather than markup whitespace, so it's unaffected. If you add
  prose that relies on a space between two inline tags, either use `{" "}` or
  set `compressHTML: true` in the config.

## Layout

```
scripts/
  sources.ts        fetchers, one per source, each independently failable
  rank.ts           canonicalize, dedupe, normalize, score
  enrich.ts         Claude relevance pass + one-line rationale
  build-digest.ts   orchestrator; writes the day's JSON
  rank.test.ts      node --test
data/
  digests/          one JSON file per morning — this is the archive
  seen.json         rolling repeat-suppression memory
src/
  content.config.ts collection over data/digests
  pages/            index, archive, [date], rss.xml
  components/       Story, DawnRule
```

`npm test` runs the ranking tests. That's the part most likely to drift as you
tune thresholds.

## Validating a change

```bash
npm test                  # ranking: canonicalization, dedupe, scoring
npx tsc --noEmit          # types across scripts and .astro frontmatter
npm run build             # Astro build; fails loudly on invalid markup in v7
```

The build is also the markup check: Astro 7's Rust compiler rejects unclosed
tags outright, so a green build means the templates are well-formed.
