# MR-004 notes

## What changed
`scripts/rank.ts`: `percentileTable` now keeps one entry per (source, `canonicalize(url)`) at its highest points, so a story returned by several queries is one peer (C1). Pass 2 merges a title into a kept twin only when similarity meets the threshold and the two titles do not conflict on version; `kept.find` carries both conditions, so a conflicting twin is skipped and the search continues (C2). `src/constants.ts` gains `VERSION_TOKEN_PATTERN` under `Pipeline`. `percentile()`, pass 1 and the existing tunables are untouched.

## Decisions
- Version tokens are compared as a key: the unique tokens, sorted, joined (`versionKey`); `""` means the title names no version. Two titles conflict when both keys are non-empty and differ. This is the plan's set-equality rule.
- The rule errs toward two cards rather than hiding a release: "X 5 launches" and "X 5 launches, 2 years after X 4" do not merge by title ({5} vs {5, 2, 4}). Any number counts, including years and counts ("raises $40M" vs "raises $40 million" still agree; "in 2026" on one title only does not).
- One addition beyond the plan's wording, one line (`twin.versions ||= entry.versions`): a twin kept under an unnumbered title takes on the first version it absorbs. Without it, "Claude Opus model" would absorb both "Claude Opus 5 model" and "Claude Opus 6 model", which is the C2 bug by another route. No QA test covers this; say so if you want it removed or tested.
- A kept twin's trigrams and version key still come from the title it was kept under, not from the shorter title `bestTitle` may pick later. That is how trigrams already behaved; not changed.
- The single one-entry Pipeline constant did not warrant its own section.

## Existing tests
`tests/scripts/rank.test.ts` passes unmodified. Its `filler()` titles ("filler 0", "filler 1", ...) no longer merge with each other, as QA predicted; no assertion depended on that.

## Checked against archived data
Live sources are unreachable here, so a throwaway script (not committed) took the 1228 distinct story titles in `data/digests/*.json` (82 digests), and ran every pair of different titles through the old `rank()` (from HEAD) and the new one as two items on two sources at two URLs.
- 5 pairs merged under the old rule. 3 still merge: "Redesigning source control at Anthropic" (anthropic.com / simonwillison.net), the Microsoft "largest theft of labor" story (TechCrunch / Tom's Hardware), and two "Elevated errors for multiple models" status incidents. None carries a number.
- 2 are now split: "Gemini Omni 1.1 Flash" / "Gemini Omni 1.2 Flash" (two different blog.google posts: the intended fix) and "DeepSeek v4.1 Flash" / "DeepSeek-v4.1-Flash-1017" ({4.1} vs {4.1, 1017}; a tweet on 2026-09-10 and an OpenRouter listing on 2026-10-17, five weeks apart, so never in one batch). The second is the documented cost of set equality: a dated build suffix reads as a different version.
- No pair that the new rule splits shares a canonical URL.
- Limit of this check: digests store titles after merging, so the per-outlet titles of stories that merged in production are not in the archive. Same-version-on-two-outlets is covered by QA's AC6 tests, not by archived pairs with numbers (there were none).

## Unsure
- Non-web URLs (dropped in pass 1) still count in the percentile table, as before. Out of scope here.
- `rank()` now calls `canonicalize` twice per item (table, then pass 1). Batches are a few hundred items; not worth threading the value through.

## Gates
`npm test` 204 passed; `npm run check` 0 errors; `npm run build` complete; `node -e "import('./scripts/rank.ts')"` loads.
