# Spec: Sparky News — UX review follow-ups and open pipeline issues

Sparky News is a static Astro 7 + Tailwind 4 site (see README.md). A UX review
and a code review left the items below open. Implement them. Each item names
the files involved; line numbers are approximate.

Base branch: `claude/grab-skills-owned-repos-0dnrwu` (not `main`).

Out of scope for this run: the freshness/update-time display, the rank bar, and the DawnRule timeline (colours, tick links). Do not change those.

## B. Reader-facing (UX review, Medium)

B1. Source badges and metadata (`StoryMeta.astro`): text at least 12px, badge
tap target at least 24px tall, and the points number must meet 4.5:1 contrast
(drop `opacity-70`).

B2. Prev/next navigation (`index.astro`, `archive/[date].astro`): tap targets
at least 44px tall on phones, and human-readable labels ("← Wed, Nov 4")
instead of raw ISO dates.

B3. Headings: the `<h1>` on each page should describe the page (the brief's
date, or "Archive"), not the site name; the wordmark becomes a non-heading
link (`Base.astro`). "Also today" becomes an `<h2>` (`BriefGrid.astro`).

B4. Archive index (`archive/index.astro`): group days under month headings
(`<h2>`), render as a list (`<ol>`/`<li>`), and let the "Led with" headline
wrap to two lines instead of truncating to one.

B5. Grid cards (`StoryCard.astro` / `BriefGrid.astro`): in the 2×2 grid, pin
the metadata row to the bottom of each card so short cards don't leave a blank
block under the title.

B6. Story title links: make them look like links at rest (underline with
sufficient contrast) and change text colour on hover.

B7. Screen-reader text: "(opens in new tab)" is currently joined to the title
with no space; add one.

## C. Pipeline (code review, open)

C1. **HN items are counted up to three times in the percentile table**
(`rank.ts` `percentileTable`), because the same story returns from several
Algolia queries. Build the table from unique (source, canonical URL) items.

C2. **Version releases merge as duplicates.** Title similarity in `rank.ts`
pass 2 treats "llm 0.30" and "llm 0.31" as the same story. Titles that differ
in a version number must not be merged by title similarity.

C3. **Empty brief guard.** `build-digest.ts` refuses to write an empty brief
only when no source returned anything. If every story is filtered out and no
brief exists for today, it writes an empty one. Refuse in that case too. To
make this testable, extract the lineup merge into a pure function and cover it
with tests (carried stories re-decayed, new candidates merged, top N kept,
unchanged lineup detected).

## Constraints

- No new runtime dependencies.
- Existing tests keep passing; `npm test`, `npm run check`, `npm run build`
  stay green.
- Rendered markup must remain valid (Astro 7 rejects unclosed tags).
- Light and dark themes both keep text contrast at or above 4.5:1.
