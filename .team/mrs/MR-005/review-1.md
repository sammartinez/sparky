---
mr: MR-005
round: 1
reviewer: sr-engineer
verdict: changes-requested
blocking: 1
nits: 0
red_before_green: confirmed
---

## Summary
The product code meets AC9–AC12 and the T5 interface, and I have no comments on `scripts/lineup.ts`, `scripts/build-digest.ts` or `src/constants.ts`. The one blocking item is for QA: the new test file re-declares an hour constant that `tests/support/` already holds.

Red-before-green, the 223-pass green run and "QA test files unchanged since 58d9a0e" are taken from `gates.md`; I had no git access or test runner to check them myself. The `build-digest.ts` half of AC9 was checked by reading only.

**AC9 wiring (`scripts/build-digest.ts:123-140`), by reading:**
- On `LINEUP_STATUS.EMPTY` it calls `console.error(chalk.red(EMPTY_BRIEF_MESSAGE))` then `process.exit(1)`, ahead of the `mkdir`/`writeFile` at lines 151-155. This matches the existing refusal at lines 88-91.
- Both early returns (lines 79-92 and 111-118) are untouched.
- The "nothing fresh, no brief" path reaches the merge with zero candidates and is refused, as the task notes require.
- The unchanged path still logs the same string and returns before any write.
- The publish path, the digest shape and the per-story log loop are unchanged.
- Carried stories are re-decayed only inside `mergeLineup`, through the imported `redecay`; the decay is not re-implemented.

**Author's flagged items:**
1. **Length check plus id-by-id `every` (`scripts/lineup.ts:44-46`): accepted.** It is equivalent to the old `join()` comparison for real ids. The length check keeps `existing.stories[i]` in bounds.
2. **"No change to today's lineup" string left inline (`scripts/build-digest.ts:137`): accepted.** The `console.log` call is unchanged, the task forbids moving existing log strings, and the plan puts untouched literals out of scope.
3. **`lineup.ts` imports `rank.ts`, which reads `GRAVITY` at load: accepted.** The plan requires reusing `redecay` from `rank.ts`, and `lineup.ts` has no `process.env`, `Date.now()` or I/O of its own.

**Tests:** the first test is the reported C3 case, and AC10–AC12, the tie-break, the `keep` cut and non-mutation are each asserted through `mergeLineup` with no mocks. The `tests/support/stories.ts` change keeps `digestEntry` output identical.

**Ponytail pass:** lean already, nothing to cut.

## Comments

### B1 · blocking · [S17] · tests/scripts/lineup.test.ts:10 (for QA)
`const HOUR_MS = 3_600_000;` is a second declaration of the same constant, under the same name, as `tests/support/rawItems.ts:4`, where it is private.
**Suggestion:** export `HOUR_MS` once from `tests/support/` (export the existing one in `rawItems.ts`, or move it to a small shared time module that `rawItems.ts` also imports) and import it in `lineup.test.ts`. No pre-existing test file needs to change. `hoursBefore` may stay local: its only lookalike is `hoursAgo` in the untouched `tests/components/DawnRule.test.ts`.
