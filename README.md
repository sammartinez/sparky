# Sparky News

A personal daily AI brief. A GitHub Action wakes up twice a day, pulls from
Hacker News, Lobsters, Hugging Face and a short list of feeds, ranks what's
actually getting traction, and commits the result as JSON. Astro builds a
static site from those files and GitHub Pages serves it.

No server, no database, no host beyond GitHub. The backend is a cron job.

```
Actions cron ──▶ fetch ──▶ dedupe ──▶ rank ──▶ keyword filter ──▶ data/digests/YYYY-MM-DD.json
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
   `https://<your-username>.github.io` and `BASE` to `/<your-repo-name>`, and
   set the same two values in the `env` block of `.github/workflows/deploy.yml`.
   The config file is what local builds use; the workflow's `env` is what
   production uses.
2. **Enable Pages.** Repo Settings → Pages → Source: **GitHub Actions**.
3. **Run it once by hand.** Actions tab → Daily brief → Run workflow.

## How the ranking works

**Normalize within source first.** 400 HN points and 40 Lobsters upvotes mean
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

**Finally, a keyword pass.** A deliberately loose regex (`ai`, `llm`, `model`,
`gpu`, vendor names, and so on) against title and domain keeps only stories
that are plausibly about AI. It errs toward letting a stray "model railway"
story through rather than missing a release; the regex lives at the top of
`scripts/filter.ts` if you want to tighten it. There is no LLM in the loop, so
the whole pipeline runs with no keys and no spend.

**Repeats are suppressed** for five days. Every run re-reads the last five
digest files and stamps their story ids into `data/seen.json`, so a skipped run
can't let a story from two days ago resurface.

**Second runs age the morning forward.** The evening run re-applies gravity to
the stories already in today's brief before merging in new candidates, so the
morning lineup doesn't hold its seats on a stale score.

## Tuning

Everything is an environment variable, so you can experiment without editing
code:

| Variable          | Default         | What it does                                |
| ----------------- | --------------- | ------------------------------------------- |
| `BRIEF_SIZE`      | `15`            | Stories in the published brief              |
| `GRAVITY`         | `1.8`           | Higher decays old stories faster            |
| `WINDOW_HOURS`    | `36`            | How far back sources are pulled             |
| `HN_MIN_POINTS`   | `25`            | Points bar for the broad HN sweep           |
| `TITLE_THRESHOLD` | `0.6`           | Title similarity that counts as a duplicate |
| `SEEN_DAYS`       | `5`             | Days a featured story stays suppressed      |
| `BRIEF_TZ`        | `America/Boise` | Which day the brief is filed under          |

Sources live at the top of `scripts/sources.ts` — `FEEDS` is a plain array,
edit freely.

```bash
BRIEF_SIZE=25 WINDOW_HOURS=48 npm run digest
```

`WINDOW_HOURS` is recorded in each digest, so the timeline on the page spans
whatever window that brief was actually pulled with.

## Things that will bite you eventually

- **Cron is UTC and ignores DST.** `0 12 * * *` is 6am Mountain in summer, 5am
  in winter. Scheduled runs can also be delayed 5–15 minutes when the runner
  pool is busy. `workflow_dispatch` is enabled so you can always kick it by hand.
- **Scheduled workflows auto-disable after ~60 days of repo inactivity.** The
  Action's own commits count as activity, so this only bites if the workflow is
  already broken. Worth knowing before you wonder why it went quiet in October.
- **Pushes made with `GITHUB_TOKEN` don't trigger other workflows.** That's why
  the digest workflow dispatches `deploy.yml` explicitly with `gh workflow run`
  after it commits, rather than relying on deploy's `push` trigger.
- **Reddit is not a source.** Its public `.json` endpoints return 403 to
  unauthenticated requests from cloud IPs, GitHub runners included. Adding it
  back means an OAuth app and the official API.
- **Algolia has no `OR` operator.** Every word in an HN search query is ANDed,
  so the low-bar AI sweep runs one request per term.
- **Hugging Face `publishedAt` is the arXiv date**, usually days old. The
  fetcher keys on `submittedOnDailyAt`, the day a paper hit the daily list.
- **A dead source doesn't kill the run.** Each fetcher is wrapped; failures log
  and return empty. The run only aborts if _every_ source fails, which prevents
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
  filter.ts         keyword pass: is this plausibly about AI
  build-digest.ts   orchestrator; writes the day's JSON
data/
  digests/          one JSON file per morning — this is the archive
  seen.json         rolling repeat-suppression memory
src/
  content.config.ts collection over data/digests
  pages/            index, archive, [date], rss.xml
  components/       SparkMark, BriefGrid, StoryCard, DawnRule
tests/
  scripts/          rank.test.ts — canonicalization, dedupe, scoring, redecay
                    filter.test.ts — keyword filter
  components/       SparkMark, BriefGrid, StoryCard, DawnRule
```

`npm test` runs the whole suite through Vitest (`vitest.config.ts`, wired to
Astro's own Vite config via `getViteConfig` so it can render real `.astro`
output through Astro's Container API — `astro/container`). The rank tests are
the part most likely to drift as you tune thresholds; the component tests
render real markup rather than asserting on logic in isolation.

## Validating a change

```bash
npm test                  # rank tests + component tests
npm run check             # astro check: types across scripts and .astro frontmatter
npm run build             # Astro build; fails loudly on invalid markup in v7
```

The build is also the markup check: Astro 7's Rust compiler rejects unclosed
tags outright, so a green build means the templates are well-formed.
