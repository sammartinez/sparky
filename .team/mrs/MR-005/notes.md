# MR-005 notes

## What changed

The carry/merge/compare block in `scripts/build-digest.ts` moved to a new pure module, `scripts/lineup.ts` (`mergeLineup`), which re-decays carried stories with the existing `redecay`, merges them with the candidates, cuts to `keep`, and reports `publish` / `unchanged` / `empty`. `build-digest.ts` now calls it once and, on `empty`, prints `EMPTY_BRIEF_MESSAGE` with `console.error` and exits 1 before `mkdir`/`writeFile`. `LINEUP_STATUS` (`as const`) and `EMPTY_BRIEF_MESSAGE` are in the `Pipeline` section of `src/constants.ts`; `LineupStatus` is derived from `LINEUP_STATUS`.

## Decisions

- "Same lineup" is a length check plus an id-by-id `every`, instead of the old comparison of two `join()`ed strings. Same outcome for every real id; no separator literal.
- The "No change to today's lineup" string stays inline in `build-digest.ts`: the task says not to move existing log strings, and that `console.log` is untouched (only the `if` condition above it changed).
- The "aged forward" comment moved with the code it explains into `lineup.ts`.
- `lineup.ts` has no `process.env` or `Date.now()` of its own; it imports `rank.ts`, which reads `GRAVITY` from the environment at load, as before.

## How the build-digest wiring was verified (not unit-testable: `main()` runs on import)

- `node -e "import('./scripts/lineup.ts')"` loads under type stripping and exports `mergeLineup`.
- Scratch copy outside the working tree (`scripts/`, `src/constants.ts`, `package.json`, empty `data/digests/`, symlinked `node_modules`), run as `node --import stub.mjs scripts/build-digest.ts`. The stub replaces `globalThis.fetch`: Hacker News returns the titles given, every other source throws. Nothing from it is committed and the real `data/digests/` was not written.
  - Two non-AI titles, no brief: "0 pass the keyword filter", stderr `Every story was filtered out and no brief exists for today. Refusing to write an empty brief.`, exit 1, `data/digests/` still empty.
  - One AI title added, no brief: "1 stories in the brief", exit 0, one file with one story.
  - Run again with the same AI title only: "Nothing new since the last run; leaving today's brief as is.", exit 0.
  - Existing brief plus new non-AI titles: "No change to today's lineup; nothing to publish.", exit 0, file byte-identical.
  - No hits at all, no brief: "No items from any source. Refusing to write an empty brief.", exit 1, no file.
- Not exercised end to end: a second run that changes an existing brief (carried stories re-decayed, then rewritten). That path is covered by the `mergeLineup` tests plus the unchanged write code.

## Gates

`npm test` 223 passed; `npm run check` 0 errors; `npm run build` 84 pages; `prettier --check` clean on the three touched files.
