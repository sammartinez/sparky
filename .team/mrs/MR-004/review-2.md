---
mr: MR-004
round: 2
reviewer: principal
verdict: changes-requested
blocking: 1
nits: 1
red_before_green: confirmed
---

## Summary
Both round 1 blocking comments are resolved and AC1–AC8 still hold, but QA's new test introduces one duplication, so this goes back to QA once more. `scripts/rank.ts` needs no change. gates.md records 205 green at 42cf9a1 with check and build passing, and the new test red (1 failed / 204 passed) with `twin.versions ||= entry.versions` removed.

Previous blocking comments:
- **B1 (round 1): resolved.** `tests/scripts/rank.versions.test.ts:138-172` uses the input order asked for and asserts two stories, with the "6" release alone at its own URL.
- **B2 (round 1): resolved.** `LOBSTERS` and `lobstersItem` live once in `tests/support/rawItems.ts:69-75`; both test files import them and the local definitions are gone. `tests/scripts/rank.test.ts` is untouched.
- **N2 (round 1): fixed.** `bySource` now sorts numerically.

## Comments

### B1 · blocking · [S17] · tests/scripts/rank.versions.test.ts:148-155 (for QA)
The new test builds its feed item by hand (`source: "rss"`, `label: "Simon Willison"`, `points: null`, `comments: null`). That is exactly what `fromFeed` at lines 24-34 of the same file already encodes, so the feed shape now lives in two places. These lines were added this round.
**Suggestion:** build the third input with the existing helper, for example `fromFeed(item({ title: "Anthropic releases Claude Opus 6 model" }), "https://simonwillison.net/2026/Nov/12/opus-6/")`. The assertions stay as they are.

### N1 · nit · [S16] · scripts/rank.ts:162-165
Carried over from round 1, unchanged because the author was not re-engaged: the four-line `table.set(...)` fits on one line and Prettier (`npm run format`) would collapse it.
