### N1 · not changed · no commit
Ran `npx prettier --write scripts/rank.ts src/constants.ts` at 2cce170: both files report `unchanged`. I then collapsed the call by hand to `table.set(source, [...byUrl.values()].sort((a, b) => a - b));` (65 columns): `npx prettier --check scripts/rank.ts` fails on that form, and `--write` restores the four-line form byte for byte (`git diff` clean). The repo's Prettier (3.9.6, default config, the same binary `npm run format` runs) breaks this call's arguments even though it fits in 80 columns, so the four-line form is the formatter's output and the one-line form would be the [S16] finding. Nothing to commit.

### Ruling · `twin.versions ||= entry.versions` · acknowledged
Kept; covered by QA's test in 42cf9a1.

### Ruling · dated-suffix split ("DeepSeek v4.1 Flash" / "DeepSeek-v4.1-Flash-1017") · acknowledged
Accepted as the approved set-equality rule; no change.

### Ruling · non-web URLs in the percentile table · acknowledged
Left as is for a follow-up task; not touched here.
