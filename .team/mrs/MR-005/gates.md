# Gates — MR-005

qa_commit: 8856d11 (round 1 baseline 58d9a0e; QA added 8856d11 after review B1)

## Red (after QA)

- command: `npm test` — exit 1
- Test Files 1 failed | 21 passed (22) Tests 205 passed (205)
- Files in QA commit outside testPaths: none
- Failing test files not in QA's commit (pre-existing tests broken): none

Failing tests:
- tests/scripts/lineup.test.ts [ tests/scripts/lineup.test.ts ]
- tests/scripts/lineup.test.ts fails to load: `scripts/lineup.ts` does not exist yet (the planned red state for a new module); its 18 tests are not in the count. QA ran them against a throwaway reference implementation outside the repo: 18 passed.

## Green (round 1) — HEAD 8e98c40

- `npm test` exit 0 — Tests 223 passed (223)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- `npm run build` exit 0 — [build] 84 page(s) built in 1.24s
- lint: skipped (null)
- QA test files changed since 58d9a0e: none
- `node -e "import('./scripts/lineup.ts')"` loads under Node type stripping.
- data/digests/ untouched by the author's wiring checks (git status clean there).

## Preview

- None: pipeline task, no `preview` paths.

## Green (round 2) — HEAD 8856d11

- `npm test` exit 0 — Tests 223 passed (223)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- `npm run build` exit 0 — [build] 84 page(s) built in 1.34s
- lint: skipped (null)
- QA test files changed since 8856d11: none
