---
mr: MR-004
round: 1
reviewer: principal
verdict: changes-requested
blocking: 2
nits: 2
red_before_green: confirmed
---

## Summary
The implementation meets AC1–AC8 and the T4 interface, and `rank()`'s signature and `redecay` are untouched, so T5 fits on top. Two things block, both for QA and neither needing a change to `scripts/rank.ts`: the `twin.versions ||= entry.versions` line is kept but has no test, and the Lobsters fixture is defined twice across the two new test files. gates.md records 15 red tests at 07a369a, all assertion failures in QA's two files, and 204 green at c3f0815 with check and build passing and QA's files unchanged.

Rulings on the flagged items:
1. **`twin.versions ||= entry.versions`: keep, and QA adds a test (B1).** Without it an unnumbered twin absorbs two different releases, which is C2 by another route.
2. **Dated suffix split ("DeepSeek v4.1 Flash" / "DeepSeek-v4.1-Flash-1017"): accepted, no change.** It is the set-equality rule the user approved, and thresholds and rule changes are out of scope.
3. **Non-web URLs in the percentile table: leave.** The plan defines the table as one entry per (source, canonical URL) with non-null points, and this MR does not change that behaviour. Open a follow-up task if it matters.

The ponytail-review pass found nothing to cut.

## Comments

### B1 · blocking · [TEST] · scripts/rank.ts:272-274 (for QA)
The line changes behaviour beyond the plan's wording and no test covers it. Deleting it leaves all 204 tests green and brings back the merge of two releases into one story.
**Suggestion:** QA adds a case to `tests/scripts/rank.versions.test.ts`:
- Input, in this order, at three URLs with three distinct labels: "Anthropic releases Claude Opus model", "Anthropic releases Claude Opus 5 model", "Anthropic releases Claude Opus 6 model".
- Expected: two stories. One carries the unnumbered and "5" appearances; the "6" story has a single appearance and its own URL.
- QA confirms it fails with line 274 removed. No implementation change is needed.

### B2 · blocking · [S17] · tests/scripts/rank.percentile.test.ts:192, tests/scripts/rank.versions.test.ts:36-38 (for QA)
The Lobsters fixture (`source: "lobsters", label: "Lobsters"`) is defined twice in this MR under the same name: a const in one file and a function in the other. `tests/support/rawItems.ts` was created in this MR for exactly this.
**Suggestion:** export one Lobsters helper from `tests/support/rawItems.ts` (for example `lobstersItem(overrides)` next to `hnHit`) and use it in both files; `distinctStories` can take its source/label from the same place. `tests/scripts/rank.test.ts` stays untouched (AC25).

### N1 · nit · [S16] · scripts/rank.ts:162-165
The `table.set(source, [...byUrl.values()].sort((a, b) => a - b));` call fits on one line; Prettier (`npm run format`) would collapse the four-line form.

### N2 · nit · [TEST] · tests/scripts/rank.percentile.test.ts:219
`bySource` sorts numbers with the default `.sort()`, which compares as strings. It works for 0, 0.2, 0.4, 0.6, but would misorder other values; `(a, b) => a - b` is safe.
