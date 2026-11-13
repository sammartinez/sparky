---
mr: MR-004
round: 3
reviewer: principal
verdict: approved
blocking: 0
nits: 0
red_before_green: confirmed
---

## Summary
MR-004 meets AC1–AC8 and AC25, and the one blocking comment from round 2 is resolved, so this is approved. gates.md records 15 red tests at 07a369a and 205 green at 2cce170 with check and build passing; `scripts/rank.ts` and `src/constants.ts` are unchanged since c3f0815. I read the three test files as they stand at 2cce170 and re-derived the expected values of the rewritten tests against `scripts/rank.ts`; no assertion got weaker.

Previous comments:
- **B1 (round 2): resolved.** `tests/scripts/rank.versions.test.ts:126-129` builds the third input with `fromFeed(item({...}), url)`; the feed shape now lives only in `fromFeed`.
- **N1 (rounds 1 and 2): withdrawn.** My nit was wrong: the author shows the four-line `table.set(...)` at `scripts/rank.ts:162-165` is Prettier's own output, and gates.md records `prettier --check` passing at HEAD.

QA's additional de-duplication in 2cce170 is in scope for the round 2 finding and correct:
- `LLM_030`/`LLM_031` and `labelsOf` are exported once from `tests/support/rawItems.ts`.
- One local `summarize` feeds three tests in the versions file.
- The AC3 "highest value" test (`tests/scripts/rank.percentile.test.ts:136-163`) now uses `distinctStories`. Its expected `[0, 0.2, 0.4, 0.8]` follows from unique points 0, 20, 60, 70, 80.

The three rulings from round 1 stand as acknowledged in response-2.md: `twin.versions ||= entry.versions` is kept and tested, the dated-suffix split is accepted, and non-web URLs in the percentile table are left for a follow-up task.

## Comments
