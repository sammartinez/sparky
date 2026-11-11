---
id: PLAN-001
title: UX review follow-ups and open pipeline issues
status: awaiting-approval
---

## Goal
Close the open UX-review items (B1–B7) on the reader-facing pages and the three open pipeline defects (C1–C3) in the digest scripts, without touching the freshness display, the rank bar, or the DawnRule timeline.

## Acceptance criteria

Pipeline (bug fixes; the first criterion of each reproduces the reported case)

- AC1 (C1, reported case): Given an HN batch in which one story is returned three times (same `source: "hn"`, same URL, same points, as three Algolia queries return it), `rank()` gives every story the same `normalized` value as it gets from the same batch with that story present once.
- AC2 (C1): Duplicates are recognised by (source, canonical URL), not raw URL: copies that differ only by tracking parameters, `www.`, or a trailing slash count once. With 4 unique HN stories plus any number of such copies, every story's `normalized` is the neutral `0.5` (fewer than 5 unique peers).
- AC3 (C1): When copies of one (source, canonical URL) carry different points, the item counts once in the table, at its highest points value. With 4 unique HN stories plus copies carrying different points, every `normalized` is still `0.5`.
- AC4 (C1): The same canonical URL on two different sources still counts once in each source's table, and the story still merges into one story with two appearances (existing behaviour unchanged).
- AC5 (C2, reported case): `rank()` given "llm 0.30" and "llm 0.31" at two different URLs returns two stories, each with its own title, URL and a single appearance. This holds whether the two items come from the same source or from different sources.
- AC6 (C2): Titles that are similar and carry the same version numbers still merge: the existing "OpenAI releases GPT-6 to all users" / "OpenAI Releases GPT-6 to All Users Today" case returns one story.
- AC7 (C2): Titles that are similar where only one of them carries a number still merge (for example "Anthropic releases Claude Opus 5 model" and "Anthropic releases Claude Opus model" at different URLs return one story with two appearances).
- AC8 (C2): Version detection covers numbers glued to a word or prefixed with "v": "Llama4 released for everyone" vs "Llama5 released for everyone", and "Ollama v0.9.1 is out now" vs "Ollama v0.9.2 is out now", each return two stories.
- AC9 (C3, reported case): With no existing brief for today and no candidates left after filtering, `mergeLineup(null, [], now, keep)` returns status `"empty"` with zero stories, and `scripts/build-digest.ts` treats that status as a refusal: it logs an error, exits non-zero, and writes no file.
- AC10 (C3): Carried stories are re-decayed: for an existing digest generated at time T, each carried story in the result has the score `redecay(story, T, now)` returns, and stories are ordered by that score.
- AC11 (C3): New candidates are merged with the carried stories in descending score order, and only the top `keep` stories are returned.
- AC12 (C3): When the resulting ids are the same, in the same order, as the existing brief's, the status is `"unchanged"`; when a candidate enters the lineup or the order changes, the status is `"publish"`. With no existing brief and at least one candidate, the status is `"publish"`. With an existing brief that has zero stories and no candidates, the status is `"unchanged"` (never `"empty"`: an existing file is left alone).

Reader-facing

- AC13 (B3): Every page rendered through `Base.astro` has exactly one `<h1>`, and its text is the `heading` prop. The "Sparky News" wordmark is a link to the home page and is not inside any heading element.
- AC14 (B3): The `<h1>` is the brief's long date (the `formatDate` output, e.g. "Monday, November 9, 2026") on `/archive/<date>` and on `/` when a brief exists; "No brief yet" on `/` when none exists; "Archive" on `/archive`.
- AC15 (B3): In `BriefGrid`, "Also today" is rendered as an `<h2>`; compact story titles under it stay `<h3>`.
- AC16 (B1): In `StoryMeta`, all text is at least 12px in both the default and compact variants (root carries `text-xs`; the `text-[0.64rem]` and `text-[0.66rem]` sizes are gone).
- AC17 (B1): Each source badge link is at least 24px tall (`min-h-6`), and the points number has no opacity utility, so it renders in the same muted colour as the badge label (at least 4.5:1 on the card in light and dark).
- AC18 (B5): In the grid variant of `StoryCard`, the card is a column flex container and the metadata row carries `mt-auto`, so in a 2×2 row the metadata of a short-titled card sits on the same bottom line as its taller neighbour. The rank number and rank bar render exactly as before.
- AC19 (B6): Story title links in all three variants are underlined at rest with the muted colour (`decoration-muted`, not `decoration-rule`), and on hover both the text and the underline turn the accent colour (`hover:text-accent`, `hover:decoration-accent`).
- AC20 (B7): In all three `StoryCard` variants, the title text and the screen-reader note are separated by a space: the rendered link reads "A very good story (opens in new tab)", not "A very good story(opens in new tab)".
- AC21 (B2): Prev/next links show a human-readable date: the older link reads "← Wed, Nov 4" and the newer link reads "Thu, Nov 5 →" for ids `2026-11-04` and `2026-11-05`. No ISO date appears as link text.
- AC22 (B2): Every link in the brief navigation is at least 44px tall (`min-h-11`), on `/` and on `/archive/<date>`. A missing older or newer brief renders no link on that side, and the "All briefs" link is always present.
- AC23 (B4): The archive list groups days under one `<h2>` per month ("November 2026"), newest month first, and each month's days are `<li>` items in an `<ol>`, newest first, each linking to `/archive/<date>`.
- AC24 (B4): The "Led with:" headline wraps to at most two lines (`line-clamp-2`) and is no longer truncated to one (`truncate` is gone). A day with no stories shows no "Led with" line. An empty archive shows "No briefs archived yet." and no list.

Whole run

- AC25: `npm test`, `npm run check` and `npm run build` are green after every task; all tests that exist today still pass unmodified; no new runtime dependency is added.

## Out of scope
- The freshness/update-time display, the rank bar, and the DawnRule timeline (colours, tick links). Not touched.
- The "(opens in new tab)" note inside source badges (`StoryMeta`). B7 names the title link only.
- Moving literals that this work does not touch into the constants file (pipeline tunables in `scripts/`, RSS text, footer copy, the index empty-state paragraph). Only literals on lines this plan adds or changes move.
- Tailwind utility classes. They are markup and stay in the templates, as the repo does today; they are not constants-file material.
- The "1 stories" plural on the archive list, and any README rewrite.
- Refreshing a kept appearance's `normalized` when a later duplicate has higher points (`rank.ts` pass 1). C1 changes the percentile table only.
- Any change to title-similarity thresholds, stopwords, or the keyword filter.
- An end-to-end test of `build-digest.ts` (it needs the live sources). The guard is tested through `mergeLineup`.

## Tasks

### T1 · Constants file, page headings and wordmark (B3)
- complexity: medium
- sets_pattern: true
- assignee: principal
- depends_on: []
- covers: [AC13, AC14, AC15, AC25]
- preview: ["/", "/archive", "/archive/2026-11-09"]
- interface:
  - `src/constants.ts` (new): plain exported `const` values only, grouped under section comments (`Site`, `Story card`, `Navigation`, `Archive`, `Pipeline`). This task adds `SITE_NAME = "Sparky News"`, `HEADING_ARCHIVE = "Archive"`, `HEADING_NO_BRIEF = "No brief yet"`, `ALSO_TODAY_HEADING = "Also today"`.
  - `src/layouts/Base.astro` props: `{ title: string; description?: string; heading: string; standfirst?: string }`. Renders exactly one `<h1>` whose text is `heading`. The wordmark is `<a href={href("/")}>` containing `SparkMark` and the text `SITE_NAME` in a non-heading element (`<span>`), visually unchanged. `standfirst`, when given, renders as the existing eyebrow `<p>` after the `<h1>`; when omitted, nothing renders (the old default tagline is removed; no page ever showed it).
  - Pages: `src/pages/index.astro` passes `heading={formatDate(today.data.date)}` or `HEADING_NO_BRIEF`, no standfirst. `src/pages/archive/[date].astro` passes `heading={formatDate(entry.data.date)}`, no standfirst. `src/pages/archive/index.astro` passes `heading={HEADING_ARCHIVE}` and keeps its "N briefs" standfirst.
  - `src/components/BriefGrid.astro`: the "Also today" label is `<h2 class="eyebrow ...">` with text `ALSO_TODAY_HEADING`.
  - Test surface for QA: render `Base.astro` through the Container API with `props` and a `default` slot (`tests/layouts/Base.test.ts`); render `src/pages/index.astro` and `src/pages/archive/index.astro` with no props (the content collection is empty under Vitest, so these exercise the "No brief yet" and "Archive" headings); render `src/pages/archive/[date].astro` with hand-built props `{ entry: { id, data: { date, generatedAt, windowHours, stories } }, newer: null, older: null }` (`tests/pages/...`). Compute expected hrefs with `href()` from `src/lib/brief`, never a hardcoded base.
- notes:
  - `src/constants.ts` is imported by Astro code and, from T4/T5, by `scripts/*.ts` running under Node's native type stripping. Keep it to erasable syntax: no enums, no namespaces, no `import.meta.env`, no `process.env`, no imports from `astro:*`. Say so in a comment at the top of the file. Environment-variable reads stay in the scripts.
  - This is the pattern the other four tasks copy: one flat file, named sections, each task appends under its own section so parallel branches merge cleanly. Record the decision in `notes.md` (alternative rejected: per-feature constants files).
  - Style the `<h1>` at 12px or larger with `text-ink` or `text-muted` (both pass 4.5:1 on paper in light and dark). The wordmark stays the visually dominant element.
  - Existing `BriefGrid` tests look for the text "Also today"; they keep passing. Reuse `formatDate` and `href` from `src/lib/brief.ts`. Do not touch `DawnRule.astro`.
  - Astro 7 rejects unclosed tags: `npm run build` is the markup check.

### T2 · Story card and metadata row (B1, B5, B6, B7)
- complexity: low
- sets_pattern: false
- assignee: engineer
- depends_on: [T1]
- covers: [AC16, AC17, AC18, AC19, AC20, AC25]
- preview: ["/", "/archive/2026-11-09"]
- interface:
  - `src/components/StoryMeta.astro` (props unchanged): root `<div>` carries `text-xs` in both variants. Each badge `<a>` carries `min-h-6` alongside the existing `inline-flex items-center`. The points `<span>` keeps `tabular-nums` and has no `opacity-*` class.
  - `src/components/StoryCard.astro` (props unchanged):
    - grid variant `<article>` class includes `flex flex-col`; the `StoryMeta` it renders receives `mt-auto` through the existing `class` prop while keeping the visible gap, top border and padding above the row.
    - Title `<a>` in all three variants: classes include `underline decoration-muted hover:text-accent hover:decoration-accent` and do not include `decoration-rule`. The link's children are the title text, a single space, then `<span class="sr-only">{OPENS_IN_NEW_TAB}</span>`, so the HTML matches `/A very good story\s<span class="sr-only">\(opens in new tab\)<\/span>/`.
  - `src/constants.ts`, `Story card` section: `OPENS_IN_NEW_TAB = "(opens in new tab)"`, used by `StoryCard.astro` and `StoryMeta.astro` (same string, one source).
- notes:
  - Astro 7's `compressHTML` strips whitespace between inline elements; write the space as `{" "}` (see README, "Things that will bite you eventually").
  - The title-link class string is used by the compact and the article branch: declare it once in the `StoryCard` frontmatter and use it in both, rather than editing two copies.
  - B5 is required for the grid variant. The feature card may share the same `<article>` classes (a single full-width card is unaffected) if that keeps one code path.
  - Do not change the rank label, the rank bar spans, or their classes. The existing tests assert `col-span-6 px-7 py-8`, `sm:col-span-3`, `grid-cols-[2.5rem_1fr]`, `×2 sources`, and the badge regex `href="…"[^>]*>\s*<span>HN</span>`; keep those substrings intact.
  - Contrast check for the reviewer: `muted` on `panel` is about 4.9:1 light and above 7:1 dark; `accent` on `panel` is about 6:1 in both themes.
  - Badge "(opens in new tab)" spacing is out of scope; only swap its string for the constant.

### T3 · Brief navigation and grouped archive list (B2, B4)
- complexity: medium
- sets_pattern: false
- assignee: engineer
- depends_on: [T1]
- covers: [AC21, AC22, AC23, AC24, AC25]
- preview: ["/", "/archive", "/archive/2026-11-09"]
- interface:
  - `src/lib/brief.ts` (additions, next to `formatDate`):
    - `formatShortDate(iso: string): string` — `"2026-11-04"` → `"Wed, Nov 4"`.
    - `formatMonth(iso: string): string` — `"2026-11-04"` → `"November 2026"`.
    - `groupByMonth<T extends { id: string }>(entries: T[]): { key: string; label: string; entries: T[] }[]` — groups consecutive entries whose `id` (an ISO date) shares a `YYYY-MM` prefix; `key` is `"2026-11"`, `label` is `formatMonth` of the first entry; input order is preserved within and across groups; `[]` returns `[]`.
  - `src/components/BriefNav.astro` (new): props `{ older?: string | null; newer?: string | null }`, both ISO dates. Renders one `<nav>` with, in order: the older link `← {formatShortDate(older)}` to `href("archive/" + older)` when `older` is set; the "All briefs" link to `href("archive")`, always; the newer link `{formatShortDate(newer)} →` to `href("archive/" + newer)` when `newer` is set. Every `<a>` carries `inline-flex min-h-11 items-center`. A missing side renders an empty `<span>` so the three slots keep their positions.
  - `src/components/ArchiveList.astro` (new): props `{ digests: { id: string; data: { date: string; stories: { title: string }[] } }[] }`, newest first. Empty array: a `<p>` with `NO_BRIEFS_MESSAGE` and no `<ol>`. Otherwise one `<section>` per `groupByMonth` group containing `<h2>{label}</h2>` and an `<ol>`; each day is an `<li>` wrapping one `<a href={href("archive/" + id)}>` that shows `formatDate(date)`, `"{n} stories"`, and, when the day has a first story, a `<p>` reading `Led with: {title}` with class `line-clamp-2` and no `truncate`.
  - Pages: `index.astro` renders `<BriefNav older={previous?.id} />`; `archive/[date].astro` renders `<BriefNav older={older?.id} newer={newer?.id} />`; `archive/index.astro` renders `<ArchiveList digests={digests} />` and no longer carries its own list or empty-state markup.
  - `src/constants.ts`: `Navigation` section — `ALL_BRIEFS_LABEL = "All briefs"`, `PREV_ARROW = "←"`, `NEXT_ARROW = "→"`, `ROUTE_ARCHIVE = "archive"`, `DATE_LOCALE = "en-US"`, `SHORT_DATE_FORMAT = { weekday: "short", month: "short", day: "numeric" }`, `MONTH_FORMAT = { month: "long", year: "numeric" }`. `Archive` section — `LED_WITH_LABEL = "Led with:"`, `STORIES_LABEL = "stories"`, `NO_BRIEFS_MESSAGE = "No briefs archived yet."`.
  - Test surface for QA: `tests/lib/brief.test.ts` for the three functions; `tests/components/BriefNav.test.ts` and `tests/components/ArchiveList.test.ts` through the Container API with plain props. Compute expected hrefs with `href()`.
- notes:
  - `formatDate` already parses an ISO date as a plain local date so it cannot slip a day. The two new formatters need the same parse: extract it once inside `brief.ts` (for example `parsePlainDate`) and have all three use it. Two copies of that parse is a blocking [S17] finding.
  - The two pages carry near-identical `<nav>` markup today; `BriefNav` replaces both. On `/` this moves "All briefs" from the right edge to the centre slot and drops its arrow, so both pages share one layout.
  - Keep the row's existing whole-row link, hover background and bottom rule in `ArchiveList`. `<a>` inside `<li>` wrapping a `<div>` and a `<p>` is valid; `<p>` inside `<p>` is not.
  - Month `<h2>` uses the existing `.eyebrow` look or larger; nav and list text stay at 12px or above with `text-ink`/`text-muted`.
  - T1 has already changed the `<Base>` props on these three pages; build on that, and leave the `heading`/`standfirst` wiring as T1 left it.
  - Do not touch `BriefGrid.astro` or `DawnRule.astro`.

### T4 · Rank: unique percentile table and version-aware title merge (C1, C2)
- complexity: medium
- sets_pattern: false
- assignee: sr-engineer
- depends_on: [T1]
- covers: [AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC25]
- interface:
  - `rank(items: RawItem[]): Story[]` in `scripts/rank.ts` — signature and return shape unchanged. All criteria are tested through `rank()` only (`tests/scripts/rank.test.ts`), using the existing `item()` and `filler()` fixture style; no network.
  - C1: `percentileTable` holds one entry per unique (`source`, `canonicalize(url)`) with non-null points; when copies disagree on points, the highest is used. `percentile()` is unchanged.
  - C2: a title's version tokens are every match of `VERSION_TOKEN_PATTERN` (`/\d+(?:\.\d+)*/g`: a run of digits with optional dot-separated parts, anywhere in the title, so "0.31", "v0.9.1", "GPT-6" and "Llama4" all yield a token), taken from the original title before `normalizeTitle` strips punctuation. In pass 2, an entry may merge into a kept twin only if title similarity meets `TITLE_THRESHOLD` and the two titles do not conflict on version. They conflict when both have at least one version token and their token sets are not equal. If only one title has tokens, or neither does, similarity alone decides as today.
  - `src/constants.ts`, `Pipeline` section: `VERSION_TOKEN_PATTERN`. Import it as `../src/constants.ts` (scripts import with the `.ts` extension).
- notes:
  - Pass 1 (canonical-URL merge) is unchanged: two items with the same canonical URL still merge whatever their titles say.
  - The pass-2 lookup must skip a version-conflicting twin and keep searching, not stop at the first similar title.
  - The pattern carries the `g` flag for `matchAll`/`match`; never use it with `.test()` or `.exec()` (shared `lastIndex` state).
  - "llm 0.30" vs "llm 0.31" scores 0.64 trigram Jaccard today, above the 0.6 threshold; that is the reported merge. Keep the helper in `rank.ts`: it is dedupe logic, not a general utility.
  - Chosen rule errs toward showing two cards rather than hiding a release: "X 5 launches" and "X 5 launches, 2 years after X 4" will not merge by title. Say so in `notes.md`.
  - Existing rank tests (including "merges near-identical titles across outlets" and "sources with no points get a neutral prior") must pass unmodified. Do not move the existing tunables or regexes in `rank.ts` to the constants file.

### T5 · Pure lineup merge and empty-brief guard (C3)
- complexity: medium
- sets_pattern: false
- assignee: engineer
- depends_on: [T1]
- covers: [AC9, AC10, AC11, AC12, AC25]
- interface:
  - `scripts/lineup.ts` (new, no I/O, no `process.env`, no `Date.now()`):
    ```ts
    export type LineupStatus = "publish" | "unchanged" | "empty";
    export interface Lineup { status: LineupStatus; stories: Story[] }
    export function mergeLineup(
      existing: Digest | null,
      candidates: Story[],
      now: number,   // epoch ms
      keep: number,
    ): Lineup
    ```
    - carried = each `existing.stories` entry passed through `redecay(story, Date.parse(existing.generatedAt), now)`; none when `existing` is null.
    - `stories` = carried followed by candidates, sorted by `score` descending (stable, so a carried story wins a tie), cut to the first `keep`.
    - `status`: `"empty"` when `existing` is null and `stories` is empty; `"unchanged"` when `existing` is not null and the ids of `stories` equal the ids of `existing.stories` in the same order; otherwise `"publish"`.
    - Inputs are not mutated.
  - `scripts/build-digest.ts`: replaces its inline carry/merge/compare block with one `mergeLineup(existing, candidates, Date.now(), KEEP)` call. On `"empty"` it prints `EMPTY_BRIEF_MESSAGE` with `console.error` and `process.exit(1)` before any `mkdir`/`writeFile`, matching the existing "No items from any source" refusal. On `"unchanged"` it logs the existing "No change to today's lineup" message and returns. On `"publish"` it writes the digest as today.
  - `src/constants.ts`, `Pipeline` section: `LINEUP_STATUS = { PUBLISH: "publish", UNCHANGED: "unchanged", EMPTY: "empty" } as const` (the type derives from it; code compares against these, not bare strings) and `EMPTY_BRIEF_MESSAGE = "Every story was filtered out and no brief exists for today. Refusing to write an empty brief."`.
  - Test surface for QA: `tests/scripts/lineup.test.ts`, building `Story` and `Digest` fixtures by hand and computing expected carried scores with the exported `redecay`. Pass `now` explicitly; no clock or filesystem mocks are needed.
- notes:
  - `build-digest.ts` runs `main()` on import, which is why the merge moves to its own module rather than being exported from it.
  - The earlier early returns in `main()` stay as they are (no raw items; nothing fresh while a brief exists). The new guard catches the remaining path: fresh stories exist, the keyword filter removes all of them, and there is no brief for today. It also covers "nothing fresh and no brief", which reaches the merge with zero candidates.
  - Reuse `redecay` from `scripts/rank.ts`; do not re-implement the decay.
  - Do not move `KEEP`, `SEEN_DAYS` or the existing log strings to the constants file; only the new message and the status values go there.
  - The `build-digest.ts` wiring cannot run here (source hosts are unreachable); the reviewer checks it by reading, and `npm run check` type-checks it.
