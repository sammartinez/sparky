# MR-004 · T4

Plan: .team/plans/PLAN-001.md

### T4 · Rank: unique percentile table and version-aware title merge (C1, C2)
- complexity: medium
- sets_pattern: false
- assignee: sr-engineer
- depends_on: [T1]
- covers: [AC1, AC2, AC3, AC4, AC5, AC6, AC7, AC8, AC25]
- interface:
  - `rank(items: RawItem[]): Story[]` in `scripts/rank.ts` — signature and return shape unchanged. All criteria are tested through `rank()` only (`tests/scripts/rank.test.ts`), using the existing `item()` and `filler()` fixture style; no network.
  - C1: `percentileTable` holds one entry per unique (`source`, `canonicalize(url)`) with non-null points; when copies disagree on points, the highest is used. `percentile()` is unchanged.
  - C2: a title's version tokens are every match of `VERSION_TOKEN_PATTERN` (`/\d+(?:\.\d+)*/g`: a run of digits with optional dot-separated parts, anywhere in the title, so "0.31", "v0.9.1", "GPT-6" and "Llama4" all yield a token), taken from the original title before `normalizeTitle` strips punctuation. In pass 2, an entry may merge into a kept twin only if title similarity meets `TITLE_THRESHOLD` and the two titles do not conflict on version. They conflict when both have at least one version token and their token sets are not equal. If only one title has tokens, or neither does, similarity alone decides as today.
  - `src/constants.ts`, `Pipeline` section: `VERSION_TOKEN_PATTERN`. Import it as `../src/constants.ts` (scripts import with the `.ts` extension).
- notes:
  - Pass 1 (canonical-URL merge) is unchanged: two items with the same canonical URL still merge whatever their titles say.
  - The pass-2 lookup must skip a version-conflicting twin and keep searching, not stop at the first similar title.
  - The pattern carries the `g` flag for `matchAll`/`match`; never use it with `.test()` or `.exec()` (shared `lastIndex` state).
  - "llm 0.30" vs "llm 0.31" scores 0.64 trigram Jaccard today, above the 0.6 threshold; that is the reported merge. Keep the helper in `rank.ts`: it is dedupe logic, not a general utility.
  - Chosen rule errs toward showing two cards rather than hiding a release: "X 5 launches" and "X 5 launches, 2 years after X 4" will not merge by title. Say so in `notes.md`.
  - Existing rank tests (including "merges near-identical titles across outlets" and "sources with no points get a neutral prior") must pass unmodified. Do not move the existing tunables or regexes in `rank.ts` to the constants file.

## Acceptance criteria this task covers

- AC1 (C1, reported case): Given an HN batch in which one story is returned three times (same `source: "hn"`, same URL, same points, as three Algolia queries return it), `rank()` gives every story the same `normalized` value as it gets from the same batch with that story present once.
- AC2 (C1): Duplicates are recognised by (source, canonical URL), not raw URL: copies that differ only by tracking parameters, `www.`, or a trailing slash count once. With 4 unique HN stories plus any number of such copies, every story's `normalized` is the neutral `0.5` (fewer than 5 unique peers).
- AC3 (C1): When copies of one (source, canonical URL) carry different points, the item counts once in the table, at its highest points value. With 4 unique HN stories plus copies carrying different points, every `normalized` is still `0.5`.
- AC4 (C1): The same canonical URL on two different sources still counts once in each source's table, and the story still merges into one story with two appearances (existing behaviour unchanged).
- AC5 (C2, reported case): `rank()` given "llm 0.30" and "llm 0.31" at two different URLs returns two stories, each with its own title, URL and a single appearance. This holds whether the two items come from the same source or from different sources.
- AC6 (C2): Titles that are similar and carry the same version numbers still merge: the existing "OpenAI releases GPT-6 to all users" / "OpenAI Releases GPT-6 to All Users Today" case returns one story.
- AC7 (C2): Titles that are similar where only one of them carries a number still merge (for example "Anthropic releases Claude Opus 5 model" and "Anthropic releases Claude Opus model" at different URLs return one story with two appearances).
- AC8 (C2): Version detection covers numbers glued to a word or prefixed with "v": "Llama4 released for everyone" vs "Llama5 released for everyone", and "Ollama v0.9.1 is out now" vs "Ollama v0.9.2 is out now", each return two stories.
- AC25: `npm test`, `npm run check` and `npm run build` are green after every task; all tests that exist today still pass unmodified; no new runtime dependency is added.
