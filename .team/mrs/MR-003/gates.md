# Gates — MR-003

qa_commit: eed9cc1 (round 1 baseline e872636; QA added eed9cc1 after review B2)

## Red (after QA)

- command: `npm test` — exit 1
- ⎯⎯⎯⎯⎯⎯ Failed Tests 31 ⎯⎯⎯⎯⎯⎯⎯ Test Files 6 failed | 13 passed (19) Tests 31 failed | 107 passed (138)
- Files in QA commit outside testPaths: none
- Failing test files not in QA's commit (pre-existing tests broken): none (pre-existing files were only extended: imports, an optional render() parameter, appended tests)
- tests/components/BriefNav.test.ts and ArchiveList.test.ts fail to load (components do not exist yet); their 46 tests are not in the count.

Failing tests:
- tests/components/ArchiveList.test.ts [ tests/components/ArchiveList.test.ts ]
- tests/components/BriefNav.test.ts [ tests/components/BriefNav.test.ts ]
- tests/lib/brief.test.ts > formatMonth > does not slip to the previous month on the first of a month
- tests/lib/brief.test.ts > formatMonth > does not slip to the previous year on January 1
- tests/lib/brief.test.ts > formatMonth > formats an ISO date as the full month name and year
- tests/lib/brief.test.ts > formatMonth > stays in the month on its last day
- tests/lib/brief.test.ts > formatShortDate > does not slip to the previous day on the first of a month
- tests/lib/brief.test.ts > formatShortDate > does not slip to the previous year on January 1
- tests/lib/brief.test.ts > formatShortDate > follows the date it is given
- tests/lib/brief.test.ts > formatShortDate > formats an ISO date as short weekday, short month and day
- tests/lib/brief.test.ts > formatShortDate > keeps a two-digit day on the last day of a month
- tests/lib/brief.test.ts > groupByMonth > groups entries of the same month together
- tests/lib/brief.test.ts > groupByMonth > groups only consecutive entries, so a month that recurs later gets its own group
- tests/lib/brief.test.ts > groupByMonth > keeps the same month of different years apart
- tests/lib/brief.test.ts > groupByMonth > labels each group with its month name and year
- tests/lib/brief.test.ts > groupByMonth > preserves ascending input order rather than re-sorting
- tests/lib/brief.test.ts > groupByMonth > puts a single entry in one group keyed by its year and month
- tests/lib/brief.test.ts > groupByMonth > returns no groups for no entries
- tests/lib/brief.test.ts > groupByMonth > returns the entries themselves, with their other fields intact
- tests/lib/brief.test.ts > groupByMonth > separates December from the January that follows it
- tests/lib/brief.test.ts > groupByMonth > starts a new group at each month boundary, keeping the input order
- tests/pages/archive/[date].test.ts > an archived brief links to the newer brief by its short date
- tests/pages/archive/[date].test.ts > an archived brief links to the older brief by its short date
- tests/pages/archive/[date].test.ts > an archived brief with no neighbours links only to All briefs, 44px tall
- tests/pages/archive/[date].test.ts > an archived brief's navigation reads older, All briefs, newer
- tests/pages/archive/[date].test.ts > every navigation link on an archived brief is at least 44px tall
- tests/pages/archive/[date].test.ts > the oldest brief has a newer link and no older link
- tests/pages/archive/index.with-briefs.test.ts > the archive page groups its briefs under one h2 per month, newest month first
- tests/pages/archive/index.with-briefs.test.ts > the archive page lists each month's days in an ordered list, newest first
- tests/pages/index.with-brief.test.ts > every navigation link on the home page is at least 44px tall
- tests/pages/index.with-brief.test.ts > the home page All briefs link goes to the archive
- tests/pages/index.with-brief.test.ts > the home page links to the previous brief by its short date
- tests/pages/index.with-brief.test.ts > the home page navigation reads older then All briefs, with no newer link

## Green (round 1) — HEAD 9947a80

- `npm test` exit 0 — Tests 184 passed (184)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- `npm run build` exit 0 — [build] 84 page(s) built in 1.51s
- lint: skipped (null)
- QA test files changed since e872636: none

## Preview (round 1)

- 9 screenshots at 9947a80 in screens/: full page for / and /archive/2026-11-09 (the nav is at the bottom), first screen for /archive (the page is 82 rows long); light, dark, phone. Dev server up in 5s, no page errors, stopped and confirmed down.

## Green (round 2) — HEAD bef352b

- `npm test` exit 0 — Tests 184 passed (184)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- `npm run build` exit 0 — [build] 84 page(s) built in 1.48s
- lint: skipped (null)
- QA test files changed since eed9cc1: none

## Preview (round 2)

- Re-captured the 6 full-page screenshots for / and /archive/2026-11-09 at bef352b (nav layout changed). /archive screenshots kept from round 1: ArchiveList is unchanged since 9947a80.
