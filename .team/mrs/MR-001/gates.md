# Gates — MR-001

qa_commit: f1e1858 (round 1 baseline 54dd505; QA added df32838 and f1e1858 after review B4)

## Red (after QA)

- command: `npm test` — exit 1
- Test Files 7 failed | 6 passed (13); Tests 26 failed | 53 passed (79)
- All files in QA commit are under `tests/` (match testPaths).
- All 26 failures are new tests; all pre-existing tests pass.

Failing tests:
- tests/components/BriefGrid.headings.test.ts > Also today is no longer an h3
- tests/components/BriefGrid.headings.test.ts > renders Also today as an h2
- tests/components/BriefGrid.headings.test.ts > the Also today h2 keeps the eyebrow style
- tests/constants.test.ts > ALSO_TODAY_HEADING is the compact list heading
- tests/constants.test.ts > HEADING_ARCHIVE is the archive page heading
- tests/constants.test.ts > HEADING_NO_BRIEF is the home page heading when no brief exists
- tests/constants.test.ts > SITE_NAME is the wordmark text
- tests/layouts/Base.test.ts > renders no standfirst paragraph when standfirst is omitted
- tests/layouts/Base.test.ts > the h1 sits in the page header, before the main content
- tests/layouts/Base.test.ts > the h1 text is the heading prop
- tests/layouts/Base.test.ts > the old default tagline is gone
- tests/layouts/Base.test.ts > the site name is not inside any heading element
- tests/layouts/Base.test.ts > the wordmark link contains no heading element
- tests/pages/archive/[date].test.ts > a full brief keeps one h1 with Also today as an h2 beneath it
- tests/pages/archive/[date].test.ts > an archived brief has exactly one h1 reading the brief's long date
- tests/pages/archive/[date].test.ts > an archived brief passes no standfirst
- tests/pages/archive/[date].test.ts > an archived brief with no stories still has exactly one h1
- tests/pages/archive/[date].test.ts > the archived brief wordmark is not inside a heading
- tests/pages/archive/[date].test.ts > the h1 follows the entry's date, not a fixed day
- tests/pages/archive/index.test.ts > the archive page has exactly one h1 reading Archive
- tests/pages/archive/index.test.ts > the archive page wordmark is not inside a heading
- tests/pages/index.test.ts > the home page with no brief has exactly one h1 reading No brief yet
- tests/pages/index.test.ts > the home page with no brief passes no standfirst
- tests/pages/index.test.ts > the home page wordmark links home and is not inside a heading
- tests/pages/index.with-brief.test.ts > the home page with a brief has exactly one h1 reading the newest brief's long date
- tests/pages/index.with-brief.test.ts > the home page with a brief passes no standfirst

## Green (round 1) — HEAD 001313f

- `npm test` exit 0 — Tests 79 passed (79)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- lint: skipped (null)
- QA test files changed since 54dd505: none

## Preview (round 1)

- dev server up in 6s at http://localhost:4321/sparky; 9 screenshots in screens/ (light, dark, phone × /, /archive, /archive/2026-11-09); no page errors; server stopped and confirmed down.

## Green (round 2) — HEAD c507e44

- `npm test` exit 0 — Tests 75 passed (75)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- `npm run build` exit 0 — [build] 84 page(s) built in 1.93s
- lint: skipped (null)
- QA test files changed since f1e1858: none

## Preview (round 2)

- Re-captured all 9 screenshots at c507e44 (dev server up in 5s, no page errors, stopped and confirmed down).
