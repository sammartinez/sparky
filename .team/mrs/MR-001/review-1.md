---
mr: MR-001
round: 1
reviewer: sr-engineer
verdict: changes-requested
blocking: 4
nits: 2
red_before_green: confirmed
---

## Summary
AC13, AC14 and AC15 are met in the code and in all nine screenshots: one `<h1>` per page carrying the `heading` prop, the wordmark a `<span>` inside the home link, and "Also today" an `<h2>`. AC25 is only partly evidenced, because `gates.md` records `npm test` and `npm run check` but no `npm run build`. The other blockers are one inline literal on a line this MR rewrote, the eyebrow style re-implemented in utilities on the new `<h1>`, and a QA test file that only restates the constants.

## Comments

### B1 · blocking · [AC25] · .team/mrs/MR-001/gates.md:40-44
AC25 requires `npm run build` to be green, and the task names it as the markup check. The Green section records only `npm test` and `npm run check`; the dev-server preview is not a build.
**Suggestion:** run `npm run build` at HEAD and record the command and exit code in `gates.md`.

### B2 · blocking · [S14] · src/pages/archive/index.astro:14
`title="Archive: Sparky News"` is an added line in this diff (the `<Base ...>` tag was rewritten) and still carries an inline user-facing literal that also repeats `SITE_NAME`. The plan's exemption covers only lines the work does not touch, and `notes.md` calls this line "not otherwise changed", which the diff contradicts. The `brief`/`briefs` literals from the same original line were moved.
**Suggestion:** build the title from constants in `src/constants.ts` (for example `` `${HEADING_ARCHIVE}: ${SITE_NAME}` ``, or a dedicated title constant) and import it.

### B3 · blocking · [S17] · src/layouts/Base.astro:69
`text-muted font-mono text-xs tracking-[0.14em] uppercase` re-implements `.eyebrow` (`src/styles/global.css:62-68`) property for property, differing only in font size, and repeats the `0.14em` value inline. The eyebrow look now has two definitions that will drift, and the `<p class="eyebrow">` directly below uses the other one.
**Suggestion:** keep one definition. Either move `.eyebrow` into `@layer components` so the `<h1>` can be `class="eyebrow mt-3 text-xs"`, or give `.eyebrow` a size hook (a custom property or a modifier class) and use it here. No existing `.eyebrow` use sets a conflicting utility, so layering it should not change the other three call sites.

### B4 · blocking · [S8] · tests/constants.test.ts:1-21
All four tests assert that a constant equals the string it is declared as, which restates `src/constants.ts` and tests no behaviour. The rendered text is already asserted through the layout, page and `BriefGrid` tests with literal strings. This is QA's file, so the implementer must not edit it.
**Suggestion:** QA deletes `tests/constants.test.ts`, or replaces it with a behavioural check not already covered.

### N1 · nit · [UI] · src/layouts/Base.astro:69-72
On `/archive` (`archive-light.png`, `archive-dark.png`, `archive-phone.png`) the `<h1>` "ARCHIVE" at 12px and the standfirst "82 BRIEFS" at 11px render as two near-identical mono lines, so the heading is not visibly distinguishable from the eyebrow beneath it. It meets the plan's 12px/`text-muted` floor; `text-ink` on the `<h1>` would separate them.

### N2 · nit · [S15] · .team/mrs/MR-001/notes.md:13
"No screenshots were taken" is stale: nine exist in `screens/`.

Not verified by me: I could not run commands, so "QA test files changed since 54dd505: none" and the red/green results are taken from `gates.md`. ponytail-review pass on the non-test diff found nothing to cut beyond B3.
