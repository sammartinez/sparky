# MR-002 · T2

Plan: .team/plans/PLAN-001.md

### T2 · Story card and metadata row (B1, B5, B6, B7)
- complexity: low
- sets_pattern: false
- assignee: engineer
- depends_on: [T1]
- covers: [AC16, AC17, AC18, AC19, AC20, AC25]
- preview: ["/", "/archive/2026-11-09"]
- interface:
  - `src/components/StoryMeta.astro` (props unchanged): root `<div>` carries `text-xs` in both variants. Each badge `<a>` carries `min-h-6` alongside the existing `inline-flex items-center`. The points `<span>` keeps `tabular-nums` and has no `opacity-*` class.
  - `src/components/StoryCard.astro` (props unchanged):
    - grid variant `<article>` class includes `flex flex-col`; the `StoryMeta` it renders receives `mt-auto` through the existing `class` prop while keeping the visible gap, top border and padding above the row.
    - Title `<a>` in all three variants: classes include `underline decoration-muted hover:text-accent hover:decoration-accent` and do not include `decoration-rule`. The link's children are the title text, a single space, then `<span class="sr-only">{OPENS_IN_NEW_TAB}</span>`, so the HTML matches `/A very good story\s<span class="sr-only">\(opens in new tab\)<\/span>/`.
  - `src/constants.ts`, `Story card` section: `OPENS_IN_NEW_TAB = "(opens in new tab)"`, used by `StoryCard.astro` and `StoryMeta.astro` (same string, one source).
- notes:
  - Astro 7's `compressHTML` strips whitespace between inline elements; write the space as `{" "}` (see README, "Things that will bite you eventually").
  - The title-link class string is used by the compact and the article branch: declare it once in the `StoryCard` frontmatter and use it in both, rather than editing two copies.
  - B5 is required for the grid variant. The feature card may share the same `<article>` classes (a single full-width card is unaffected) if that keeps one code path.
  - Do not change the rank label, the rank bar spans, or their classes. The existing tests assert `col-span-6 px-7 py-8`, `sm:col-span-3`, `grid-cols-[2.5rem_1fr]`, `×2 sources`, and the badge regex `href="…"[^>]*>\s*<span>HN</span>`; keep those substrings intact.
  - Contrast check for the reviewer: `muted` on `panel` is about 4.9:1 light and above 7:1 dark; `accent` on `panel` is about 6:1 in both themes.
  - Badge "(opens in new tab)" spacing is out of scope; only swap its string for the constant.

## Acceptance criteria this task covers

- AC16 (B1): In `StoryMeta`, all text is at least 12px in both the default and compact variants (root carries `text-xs`; the `text-[0.64rem]` and `text-[0.66rem]` sizes are gone).
- AC17 (B1): Each source badge link is at least 24px tall (`min-h-6`), and the points number has no opacity utility, so it renders in the same muted colour as the badge label (at least 4.5:1 on the card in light and dark).
- AC18 (B5): In the grid variant of `StoryCard`, the card is a column flex container and the metadata row carries `mt-auto`, so in a 2×2 row the metadata of a short-titled card sits on the same bottom line as its taller neighbour. The rank number and rank bar render exactly as before.
- AC19 (B6): Story title links in all three variants are underlined at rest with the muted colour (`decoration-muted`, not `decoration-rule`), and on hover both the text and the underline turn the accent colour (`hover:text-accent`, `hover:decoration-accent`).
- AC20 (B7): In all three `StoryCard` variants, the title text and the screen-reader note are separated by a space: the rendered link reads "A very good story (opens in new tab)", not "A very good story(opens in new tab)".
- AC25: `npm test`, `npm run check` and `npm run build` are green after every task; all tests that exist today still pass unmodified; no new runtime dependency is added.
