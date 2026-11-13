# MR-005 · T5

Plan: .team/plans/PLAN-001.md

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

## Acceptance criteria this task covers

- AC9 (C3, reported case): With no existing brief for today and no candidates left after filtering, `mergeLineup(null, [], now, keep)` returns status `"empty"` with zero stories, and `scripts/build-digest.ts` treats that status as a refusal: it logs an error, exits non-zero, and writes no file.
- AC10 (C3): Carried stories are re-decayed: for an existing digest generated at time T, each carried story in the result has the score `redecay(story, T, now)` returns, and stories are ordered by that score.
- AC11 (C3): New candidates are merged with the carried stories in descending score order, and only the top `keep` stories are returned.
- AC12 (C3): When the resulting ids are the same, in the same order, as the existing brief's, the status is `"unchanged"`; when a candidate enters the lineup or the order changes, the status is `"publish"`. With no existing brief and at least one candidate, the status is `"publish"`. With an existing brief that has zero stories and no candidates, the status is `"unchanged"` (never `"empty"`: an existing file is left alone).
- AC25: `npm test`, `npm run check` and `npm run build` are green after every task; all tests that exist today still pass unmodified; no new runtime dependency is added.
