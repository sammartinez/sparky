---
mr: MR-002
round: 1
reviewer: sr-engineer
verdict: changes-requested
blocking: 2
nits: 1
red_before_green: confirmed
---

## Summary
The implementation (`StoryCard.astro`, `StoryMeta.astro`, `constants.ts`) meets AC16–AC20 and the T2 interface, and the six screenshots show them rendered correctly in light, dark and phone; I have no blocking comment on the implementer's code. Both blocking comments are [S17] duplication in the test code this MR adds, so they are for QA to fix, not the implementer (TDD rule 4). Red-before-green and "QA test files changed since a5781fb: none" are taken from `gates.md`; I had no git access to re-check the commits myself.

## Comments

### B1 · blocking · [S17] · tests/support/html.ts:68-107
The new helpers re-implement three that already sit in the same file:
- `anchorsTo` (78-82) is `linksTo` (42-48) returning an `Element` instead of the inner HTML.
- `elements` (68-75) is the all-matches form of `innerOf` (32-35), using the same regex.
- `readText` (102-107) is `textOf` (11-16) with `""` instead of `" "` as the tag replacement.

**Suggestion:** QA keeps one implementation of each. `linksTo` becomes `anchorsTo(html, target).map((a) => a.inner)`, `innerOf` becomes `elements(html, tag)[0]?.inner ?? ""`, and `textOf`/`readText` share one strip function that takes the replacement string. Exported names and behaviour stay the same, so the existing T1 tests pass unmodified.

### B2 · blocking · [S17] · tests/components/StoryCard.layout.test.ts:6-27, tests/components/StoryCard.title.test.ts:6-31
The `NOW` constant and the `baseProps` fixture (rank 3, "A very good story", `https://example.com/story`, the same `createdAt` and `normalized`, an HN appearance) are copied into both new files. A third copy already exists in `tests/components/StoryCard.test.ts:5-19`. `engineering.md` TDD rule 6 puts shared fixtures in `tests/support/`.

**Suggestion:** QA moves one StoryCard props fixture (with `NOW`) into `tests/support/`, next to `story()` in `stories.ts` or in its own module, and imports it in both new files; the title test passes its `discussionUrl` appearance as an override. `StoryCard.test.ts` stays untouched under AC25 and can adopt the fixture in a later task.

### N1 · nit · [UI] · src/components/StoryMeta.astro:19,47
At 12px the row wraps sooner. In `archive-2026-11-09-light.png` card 03, "6h ago" drops alone onto a second line under `simonwillison.net [Simon Willison]`. In `home-light.png` card 02, the last wrapped line has no badge, so its text sits about 3px lower than card 03's age. The bottom edges do line up, so AC18 holds, and the wrapping follows from AC16's size increase; noted for the UX backlog only.
