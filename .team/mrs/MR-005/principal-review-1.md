---
mr: MR-005
round: 1
reviewer: principal
pass: second
verdict: approved
blocking: 0
nits: 2
red_before_green: confirmed
---

## Summary
Nothing blocking: the boundary is right and AC9–AC12 are met. `scripts/lineup.ts` is a pure decision module (no I/O, clock or env of its own), and `build-digest.ts` keeps the side effects and acts on the returned status. `LINEUP_STATUS` and `EMPTY_BRIEF_MESSAGE` sit in the `Pipeline` section of `src/constants.ts`, `LineupStatus` derives from the constant, and no bare status string or new inline literal appears in product code.

I ran nothing. Red-before-green and the 223-pass green run at 8856d11 are taken from `gates.md`; the red state is the planned one (`scripts/lineup.ts` did not exist). The `build-digest.ts` half of AC9 is checked by reading, plus the author's stubbed-network run recorded in `notes.md`.

**AC9 wiring (`/home/user/sparky/scripts/build-digest.ts:123-140`), by reading:**
- **Empty:** on `LINEUP_STATUS.EMPTY` it calls `console.error(chalk.red(EMPTY_BRIEF_MESSAGE))` then `process.exit(1)`. That is ahead of the only `mkdir`/`writeFile` (lines 151-155) and has the same shape as the existing refusal at lines 88-91.
- **Early returns:** both are untouched (lines 79-92 and 111-118). "Nothing fresh, no brief" falls through to the merge with zero candidates and is refused.
- **Unchanged:** logs the same string as before and returns before any write.
- **Publish:** the digest shape, the write and the per-story log are unchanged.
- **Workflow:** `.github/workflows/daily-brief.yml` runs `npm run digest` as its own step, so a refusal fails the run before the commit step, the same as the existing refusal.

**Skill passes:** ponytail-review found nothing to cut. The pragmatic-programmer lens found no duplicated knowledge: the decay stays in `redecay` and the status values have one source.

## Comments

### N1 · nit · [ARCH] · tests/support/rawItems.ts:4-5
`HOUR_MS` is now the shared time constant for fixtures, but it is exported from the RawItem fixtures module, so `tests/scripts/lineup.test.ts:8` imports a time unit from a file about rank inputs. The next time-based test will copy that import. A small `tests/support/time.ts` that `rawItems.ts` also imports would be the pattern to copy. Follow-up, not this MR.

### N2 · nit · [MISSED] · scripts/lineup.ts:32-34
With an existing non-empty brief and `keep` of `0` or `NaN` (`BRIEF_SIZE=0` or non-numeric at `scripts/build-digest.ts:14`), `slice(0, keep)` returns no stories and the status is `"publish"`, so the build overwrites today's brief with zero stories. This is reasoned from reading, not run. It predates this MR and is outside AC9–AC12, which only cover the no-brief case, so it does not block. Record it as a follow-up: validate `BRIEF_SIZE` at the env read in `build-digest.ts`, not inside `mergeLineup`.
