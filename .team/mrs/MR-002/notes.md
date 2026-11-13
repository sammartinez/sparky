# MR-002 notes

**What changed.** `StoryMeta` sets `text-xs` on its root in both variants (the two sub-12px sizes are gone), badge links carry `min-h-6`, and the points number lost `opacity-70`. `StoryCard` title links use one `titleLinkClass` from the frontmatter (`decoration-muted`, `hover:text-accent`, `hover:decoration-accent`), with a `{" "}` before the screen-reader note. The `<article>` is `flex flex-col` and passes `mt-auto` to `StoryMeta`. `OPENS_IN_NEW_TAB` is in `src/constants.ts` and is the only source of that string in both components.

**Decisions.**
- Gap above the metadata row: `mt-4` moved off the row and became `mb-4` on the `<h2>`. Same 1rem minimum gap; flex items do not collapse margins and the old layout had no collapsing pair there either.
- Feature and grid share the `<article>`/`<h2>`/`StoryMeta` classes (one code path, as the task allows). A full-width feature card has no neighbour to stretch against, so it renders as before.
- The underline offset still differs by branch (`underline-offset-[3px]` compact, `underline-offset-4` article), so it is appended to `titleLinkClass` at each use rather than changing either offset.

**Unsure of.**
- Badge links still read "150(opens in new tab)" with no space; the task puts that out of scope.
- `npm run format` cannot parse `.astro` files in this checkout (no Astro plugin configured for Prettier), so the two components were formatted by hand to match the surrounding code.
