---
mr: MR-003
round: 1
reviewer: sr-engineer
verdict: changes-requested
blocking: 2
nits: 2
red_before_green: confirmed
---

## Summary
The implementation meets AC21–AC24 and the T3 interface: the screenshots show short-date prev/next links, month headings and a two-line "Led with" in light, dark and phone, and gates.md records 31 red tests (plus two files that could not load) before implementation and 184 green after, with check and build passing. Two things block: one inline literal on a new line in `src/lib/brief.ts`, and one assertion block that QA's tests carry three times. The ponytail-review pass found nothing to cut.

## Comments

### B1 · blocking · [S14] · src/lib/brief.ts:23
`briefHref` builds its path with an inline `"/"` in the template literal `${ROUTE_ARCHIVE}/${id}`. This is a new line, and the same MR moved the equivalent `"-"` to `ISO_DATE_SEPARATOR`. notes.md justifies it by pointing at `href()`, but that line is untouched and this one is not.
**Suggestion:** add a path-separator constant under `Navigation` in `src/constants.ts` and use it here.

### B2 · blocking · [S17] · tests/components/BriefNav.test.ts:47-53, tests/pages/archive/[date].test.ts:119-123, tests/pages/index.with-brief.test.ts:88-92 (for QA)
The same "every nav link is a 44px tap target" check appears three times: a loop over the links asserting `expect.arrayContaining(["inline-flex", "min-h-11", "items-center"])`. If the class contract changes, three files need editing.
**Suggestion:** add one helper to `tests/support/html.ts` next to `mainNavLinks` (for example `expectTapTargets(links: Element[])`, holding the class list once) and call it from all three tests. Only the lines QA appended in this MR change; no pre-existing assertion is touched.

### N1 · nit · [UI] · src/components/BriefNav.astro:22 (screens/home-light.png, screens/home-phone.png)
On `/`, "All briefs" sits visibly right of centre, most obviously on the phone screenshot. `justify-between` with a wide older link on one side and an empty `<span>` on the other does not centre the middle slot. The task note describes it as the centre slot; no AC requires it. A three-column grid would centre it if wanted.

### N2 · nit · [S17] · src/pages/rss.xml.ts:25, src/layouts/Base.astro:89
These untouched lines still build ``href(`archive/${d.id}`)`` and `href("archive")` by hand now that `briefHref` and `ROUTE_ARCHIVE` exist. They are out of scope here, as notes.md says; worth a follow-up task.
