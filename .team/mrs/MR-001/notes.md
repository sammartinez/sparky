# MR-001 notes

**What changed.** New `src/constants.ts`. `Base.astro` takes a required `heading` prop and renders it as the page's only `<h1>`, under the wordmark; the wordmark is now a `<span>` inside the home link (same classes as the old `<h1>`, so it looks the same). `standfirst` renders only when passed; the default tagline is gone. The three pages pass `heading`; `BriefGrid` renders "Also today" as an `<h2>`.

**Pattern: one flat constants file.** `src/constants.ts` holds plain exported consts under five section comments (`Site`, `Story card`, `Navigation`, `Archive`, `Pipeline`); each later task appends under its own section, so parallel branches touch different hunks. It uses erasable syntax only, because `scripts/*.ts` will import it under Node's type stripping. Rejected: per-feature constants files, which would scatter the values and make "is this literal already defined?" a search across files.

**Decisions for the reviewer.**
- `.eyebrow` now sits in `@layer components` in `global.css`, so utilities on the same element win. The `<h1>` is `eyebrow text-ink mt-3 text-xs`: one eyebrow definition, raised to 12px and ink colour for the heading. The other three `.eyebrow` uses carry no conflicting utility and render as before.
- Two constants beyond the plan's list: `BRIEF_COUNT_SINGULAR` / `BRIEF_COUNT_PLURAL` and `TITLE_ARCHIVE`, because the archive `<Base>` tag was rewritten and carried those literals ([S14]). The RSS `<link title>` in `Base.astro` now uses `SITE_NAME` too.
- `HEADING_ARCHIVE` sits under `Archive`, the rest under `Site`.
- Left inline, per the plan's out-of-scope list (lines this MR does not change): the `<title>` strings in `index.astro` and `archive/[date].astro`, the skip link, footer copy, the default description, `rss.xml.ts`.

**Unsure of.** Nothing open.
