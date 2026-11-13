# MR-001 · T1

Plan: .team/plans/PLAN-001.md

### T1 · Constants file, page headings and wordmark (B3)
- complexity: medium
- sets_pattern: true
- assignee: principal
- depends_on: []
- covers: [AC13, AC14, AC15, AC25]
- preview: ["/", "/archive", "/archive/2026-11-09"]
- interface:
  - `src/constants.ts` (new): plain exported `const` values only, grouped under section comments (`Site`, `Story card`, `Navigation`, `Archive`, `Pipeline`). This task adds `SITE_NAME = "Sparky News"`, `HEADING_ARCHIVE = "Archive"`, `HEADING_NO_BRIEF = "No brief yet"`, `ALSO_TODAY_HEADING = "Also today"`.
  - `src/layouts/Base.astro` props: `{ title: string; description?: string; heading: string; standfirst?: string }`. Renders exactly one `<h1>` whose text is `heading`. The wordmark is `<a href={href("/")}>` containing `SparkMark` and the text `SITE_NAME` in a non-heading element (`<span>`), visually unchanged. `standfirst`, when given, renders as the existing eyebrow `<p>` after the `<h1>`; when omitted, nothing renders (the old default tagline is removed; no page ever showed it).
  - Pages: `src/pages/index.astro` passes `heading={formatDate(today.data.date)}` or `HEADING_NO_BRIEF`, no standfirst. `src/pages/archive/[date].astro` passes `heading={formatDate(entry.data.date)}`, no standfirst. `src/pages/archive/index.astro` passes `heading={HEADING_ARCHIVE}` and keeps its "N briefs" standfirst.
  - `src/components/BriefGrid.astro`: the "Also today" label is `<h2 class="eyebrow ...">` with text `ALSO_TODAY_HEADING`.
  - Test surface for QA: render `Base.astro` through the Container API with `props` and a `default` slot (`tests/layouts/Base.test.ts`); render `src/pages/index.astro` and `src/pages/archive/index.astro` with no props (the content collection is empty under Vitest, so these exercise the "No brief yet" and "Archive" headings); render `src/pages/archive/[date].astro` with hand-built props `{ entry: { id, data: { date, generatedAt, windowHours, stories } }, newer: null, older: null }` (`tests/pages/...`). Compute expected hrefs with `href()` from `src/lib/brief`, never a hardcoded base.
- notes:
  - `src/constants.ts` is imported by Astro code and, from T4/T5, by `scripts/*.ts` running under Node's native type stripping. Keep it to erasable syntax: no enums, no namespaces, no `import.meta.env`, no `process.env`, no imports from `astro:*`. Say so in a comment at the top of the file. Environment-variable reads stay in the scripts.
  - This is the pattern the other four tasks copy: one flat file, named sections, each task appends under its own section so parallel branches merge cleanly. Record the decision in `notes.md` (alternative rejected: per-feature constants files).
  - Style the `<h1>` at 12px or larger with `text-ink` or `text-muted` (both pass 4.5:1 on paper in light and dark). The wordmark stays the visually dominant element.
  - Existing `BriefGrid` tests look for the text "Also today"; they keep passing. Reuse `formatDate` and `href` from `src/lib/brief.ts`. Do not touch `DawnRule.astro`.
  - Astro 7 rejects unclosed tags: `npm run build` is the markup check.

## Acceptance criteria this task covers

- AC13 (B3): Every page rendered through `Base.astro` has exactly one `<h1>`, and its text is the `heading` prop. The "Sparky News" wordmark is a link to the home page and is not inside any heading element.
- AC14 (B3): The `<h1>` is the brief's long date (the `formatDate` output, e.g. "Monday, November 9, 2026") on `/archive/<date>` and on `/` when a brief exists; "No brief yet" on `/` when none exists; "Archive" on `/archive`.
- AC15 (B3): In `BriefGrid`, "Also today" is rendered as an `<h2>`; compact story titles under it stay `<h3>`.
- AC25: `npm test`, `npm run check` and `npm run build` are green after every task; all tests that exist today still pass unmodified; no new runtime dependency is added.
