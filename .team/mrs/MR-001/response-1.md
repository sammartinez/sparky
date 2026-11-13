# MR-001 · response to review round 1

Gates at HEAD: `npm test` 75 passed (12 files), `npm run check` 0 errors, `npm run build` 84 pages, complete.

### B2 · fixed
`src/constants.ts` (Archive section) adds `TITLE_ARCHIVE`, built from `HEADING_ARCHIVE` and `SITE_NAME`. `src/pages/archive/index.astro` passes `title={TITLE_ARCHIVE}`. The built page still has `<title>Archive: Sparky News</title>`. The `<title>` lines in `index.astro` and `archive/[date].astro` are not changed by this MR and stay as they are, per the plan's out-of-scope rule.

### B3 · fixed
`src/styles/global.css`: `.eyebrow` moved into `@layer components`, unchanged otherwise. `src/layouts/Base.astro`: the `<h1>` is now `class="eyebrow text-ink mt-3 text-xs"`; the duplicated utilities and the inline `0.14em` are gone. Checked in the built CSS that `.eyebrow` is emitted in the components layer, ahead of `@layer utilities`. The other three call sites (`DawnRule` figcaption `eyebrow mt-2 flex justify-between`, `BriefGrid` h2 `eyebrow mt-1 mb-2.5`, the standfirst `eyebrow mt-1`) carry only margin and flex utilities, none of which `.eyebrow` sets, so their computed styles are the same. I did not re-screenshot them.

### N1 · addressed
The `<h1>` now carries `text-ink`, so it is 12px ink over an 11px muted standfirst.

### N2 · addressed
`notes.md` updated: the stale screenshot line is gone, and the styling and left-inline notes match the code.
