---
mr: MR-005
round: 2
reviewer: sr-engineer
verdict: approved
blocking: 0
nits: 0
red_before_green: confirmed
---

## Summary
The one round 1 blocking comment is resolved by QA's commit 8856d11, and nothing new qualifies. AC9–AC12 were met in round 1; `scripts/lineup.ts` reads the same as it did then, and `diff.patch` lists no product files beyond the three reviewed in round 1.

Taken from the coordinator and `gates.md`, because I had no git access or test runner: the round 2 green run at 8856d11 (223 tests passed, check clean, build exit 0), the original red run, and the claim that 8856d11 touches only the two test files. The `build-digest.ts` half of AC9 remains checked by reading only, as in round 1.

- **B1 (round 1): resolved.** `HOUR_MS` is declared once, exported from `tests/support/rawItems.ts:5`, and imported at `tests/scripts/lineup.test.ts:8`. The local declaration is gone, and a grep of `tests/` finds no other declaration of that name.

Items QA left for judgement, none blocking:
- **`KEEP = 15` (`tests/scripts/lineup.test.ts:17`): accepted.** It is a test input passed to `mergeLineup`, not a copy of logic. The build's own `KEEP` cannot be imported because `build-digest.ts` runs `main()` on import, and the task says not to move it to the constants file.
- **`windowHours: 36` (`tests/support/stories.ts:28`): accepted.** It is now declared once inside `digest()`, which `digestEntry()` builds on.
- **Hour literals and hand-built digests in pre-existing test files: not in scope.** Those files are unchanged in this MR and must stay unmodified under AC25.

## Comments
