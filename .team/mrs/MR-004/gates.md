# Gates — MR-004

qa_commit: 2cce170 (baseline 07a369a; QA added 42cf9a1 after round 1 and 2cce170 after round 2)

## Red (after QA)

- command: `npm test` — exit 1
- ⎯⎯⎯⎯⎯⎯ Failed Tests 15 ⎯⎯⎯⎯⎯⎯⎯ Test Files 2 failed | 19 passed (21) Tests 15 failed | 189 passed (204)
- Files in QA commit outside testPaths: none
- Failing test files not in QA's commit (pre-existing tests broken): none

Failing tests:
- tests/scripts/rank.percentile.test.ts > a URL returned three times by HN and once by Lobsters still counts once per source
- tests/scripts/rank.percentile.test.ts > a copy that differs only by a tracking parameter counts once among its source's peers
- tests/scripts/rank.percentile.test.ts > a copy that differs only by a trailing slash counts once among its source's peers
- tests/scripts/rank.percentile.test.ts > a copy that differs only by a www. prefix counts once among its source's peers
- tests/scripts/rank.percentile.test.ts > a story whose copies disagree on points counts once at its highest value (highest first)
- tests/scripts/rank.percentile.test.ts > a story whose copies disagree on points counts once at its highest value (lowest first)
- tests/scripts/rank.percentile.test.ts > an HN story returned by three queries leaves every story's normalized as if it came back once
- tests/scripts/rank.percentile.test.ts > any number of decorated copies of four stories still leaves every story neutral
- tests/scripts/rank.percentile.test.ts > copies carrying different points leave a batch of four at the neutral prior
- tests/scripts/rank.percentile.test.ts > three copies of one story do not lift a batch of four past the neutral prior
- tests/scripts/rank.versions.test.ts > a second outlet's llm 0.31 joins the 0.31 story, not the 0.30 story ranked ahead of it
- tests/scripts/rank.versions.test.ts > llm 0.30 and llm 0.31 on HN are two stories, each with its own title, URL and one appearance
- tests/scripts/rank.versions.test.ts > llm 0.30 on HN and llm 0.31 from a feed are two stories, each with its own title, URL and one appearance
- tests/scripts/rank.versions.test.ts > titles that differ only in a version glued to a word are two stories
- tests/scripts/rank.versions.test.ts > titles that differ only in a version prefixed with v are two stories

## Green (round 1) — HEAD c3f0815

- `npm test` exit 0 — Tests 204 passed (204)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- `npm run build` exit 0 — [build] 84 page(s) built in 1.54s
- lint: skipped (null)
- QA test files changed since 07a369a: none
- `node -e "import('./scripts/rank.ts')"` loads under Node type stripping.

## Preview

- None: pipeline task, no `preview` paths.

## Green (round 2) — HEAD 42cf9a1

- `npm test` exit 0 — Tests 205 passed (205)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- `npm run build` exit 0 — [build] 84 page(s) built in 2.22s
- lint: skipped (null)
- QA test files changed since 42cf9a1: none
- B1 red check (QA): with `twin.versions ||= entry.versions` removed, `npm test` gave 1 failed / 204 passed, the failure being the new test; file restored, scripts/rank.ts unchanged since c3f0815: yes.

## Green (round 3) — HEAD 2cce170

- `npm test` exit 0 — Tests 205 passed (205)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- `npm run build` exit 0 — [build] 84 page(s) built in 1.21s
- lint: skipped (null)
- QA test files changed since 2cce170: none
- scripts/rank.ts unchanged since c3f0815: yes. `npx prettier --check scripts/rank.ts src/constants.ts` passes at HEAD (the four-line `table.set` form is Prettier's own output).
