### B1 · fixed · 162cf90
Added `PATH_SEPARATOR = "/"` under `Navigation` in `src/constants.ts`; `briefHref` in `src/lib/brief.ts` now builds its path with `[ROUTE_ARCHIVE, id].join(PATH_SEPARATOR)`.

### B2 · not mine
QA's, resolved in eed9cc1 (`expectTapTargets` in `tests/support/html.ts`). I did not touch the test files.

### N1 · fixed · bef352b
`BriefNav.astro`: the `<nav>` is now `grid grid-cols-[1fr_auto_1fr] items-center gap-x-4` instead of `flex justify-between`, so the middle slot is centred whatever the side slots hold. The older link adds `justify-self-start` and the newer link `justify-self-end`. `1fr_auto_1fr` rather than three equal columns so a long short-date cannot wrap at 320px. Slot order, the empty `<span>` in a missing slot, and `inline-flex min-h-11 items-center` on every link are unchanged; QA's tests pass unmodified. Checked in the built HTML and CSS only, not in a browser: new screenshots would confirm it.

### N2 · acknowledged, not changed
`src/pages/rss.xml.ts:25` and `src/layouts/Base.astro:89` are untouched lines outside T3; changing them here would be [S13]. They should move to `briefHref` / `ROUTE_ARCHIVE` in a follow-up task.
