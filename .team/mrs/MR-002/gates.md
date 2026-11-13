# Gates — MR-002

qa_commit: 2043659 (round 1 baseline a5781fb; QA added 2043659 after review B1, B2)

## Red (after QA)

- command: `npm test` — exit 1
- ⎯⎯⎯⎯⎯⎯ Failed Tests 25 ⎯⎯⎯⎯⎯⎯⎯ Test Files 3 failed | 12 passed (15) Tests 25 failed | 79 passed (104)
- Files in QA commit outside testPaths: none
- Failing test files not in QA's commit (pre-existing tests broken): none

Failing tests:
- tests/components/StoryCard.layout.test.ts > the grid card lays its content out as a column
- tests/components/StoryCard.layout.test.ts > the grid card pushes its metadata row to the bottom edge
- tests/components/StoryCard.layout.test.ts > the grid card's metadata row has no second top margin fighting the push to the bottom
- tests/components/StoryCard.title.test.ts > a title that ends in punctuation is still separated from the new-tab note
- tests/components/StoryCard.title.test.ts > compact variant > the new-tab note stays screen-reader only, after a single whitespace character
- tests/components/StoryCard.title.test.ts > compact variant > the title link is underlined at rest in the muted colour
- tests/components/StoryCard.title.test.ts > compact variant > the title link reads as the title, a space, then the new-tab note
- tests/components/StoryCard.title.test.ts > compact variant > the title text and its underline turn the accent colour on hover
- tests/components/StoryCard.title.test.ts > feature variant > the new-tab note stays screen-reader only, after a single whitespace character
- tests/components/StoryCard.title.test.ts > feature variant > the title link is underlined at rest in the muted colour
- tests/components/StoryCard.title.test.ts > feature variant > the title link reads as the title, a space, then the new-tab note
- tests/components/StoryCard.title.test.ts > feature variant > the title text and its underline turn the accent colour on hover
- tests/components/StoryCard.title.test.ts > grid variant > the new-tab note stays screen-reader only, after a single whitespace character
- tests/components/StoryCard.title.test.ts > grid variant > the title link is underlined at rest in the muted colour
- tests/components/StoryCard.title.test.ts > grid variant > the title link reads as the title, a space, then the new-tab note
- tests/components/StoryCard.title.test.ts > grid variant > the title text and its underline turn the accent colour on hover
- tests/components/StoryMeta.test.ts > 'compact' variant > every source badge link is at least 24px tall and centres its content
- tests/components/StoryMeta.test.ts > 'compact' variant > nothing in the row uses a custom font size below 12px
- tests/components/StoryMeta.test.ts > 'compact' variant > the points number is shown in tabular figures and is not dimmed
- tests/components/StoryMeta.test.ts > 'compact' variant > the row sets its text at 12px
- tests/components/StoryMeta.test.ts > 'default' variant > every source badge link is at least 24px tall and centres its content
- tests/components/StoryMeta.test.ts > 'default' variant > nothing in the row uses a custom font size below 12px
- tests/components/StoryMeta.test.ts > 'default' variant > the points number is shown in tabular figures and is not dimmed
- tests/components/StoryMeta.test.ts > 'default' variant > the row sets its text at 12px
- tests/components/StoryMeta.test.ts > a class passed by the parent is added to the row without replacing its 12px size

## Green (round 1) — HEAD fc37c75

- `npm test` exit 0 — Tests 104 passed (104)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- `npm run build` exit 0 — [build] 84 page(s) built in 1.98s
- lint: skipped (null)
- QA test files changed since a5781fb: none

## Preview (round 1)

- 6 full-page screenshots at fc37c75 in screens/ (light, dark, phone × /, /archive/2026-11-09); dev server up in 5s, no page errors, stopped and confirmed down.

## Green (round 2) — HEAD 2043659

- `npm test` exit 0 — Tests 104 passed (104)
- `npm run check` exit 0 — - 0 errors - 0 warnings - 0 hints
- `npm run build` exit 0 — [build] 84 page(s) built in 1.67s
- lint: skipped (null)
- QA test files changed since 2043659: none

## Preview (round 2)

- Not re-captured: round 2 changed test files only (2043659); product code is unchanged since fc37c75.
