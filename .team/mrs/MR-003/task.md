# MR-003 · T3

Plan: .team/plans/PLAN-001.md

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

## Acceptance criteria this task covers

- AC21 (B2): Prev/next links show a human-readable date: the older link reads "← Wed, Nov 4" and the newer link reads "Thu, Nov 5 →" for ids `2026-11-04` and `2026-11-05`. No ISO date appears as link text.
- AC22 (B2): Every link in the brief navigation is at least 44px tall (`min-h-11`), on `/` and on `/archive/<date>`. A missing older or newer brief renders no link on that side, and the "All briefs" link is always present.
- AC23 (B4): The archive list groups days under one `<h2>` per month ("November 2026"), newest month first, and each month's days are `<li>` items in an `<ol>`, newest first, each linking to `/archive/<date>`.
- AC24 (B4): The "Led with:" headline wraps to at most two lines (`line-clamp-2`) and is no longer truncated to one (`truncate` is gone). A day with no stories shows no "Led with" line. An empty archive shows "No briefs archived yet." and no list.
- AC25: `npm test`, `npm run check` and `npm run build` are green after every task; all tests that exist today still pass unmodified; no new runtime dependency is added.
