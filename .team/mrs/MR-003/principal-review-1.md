---
mr: MR-003
round: 1
pass: second
reviewer: principal
verdict: approved
blocking: 0
nits: 3
red_before_green: confirmed
---

## Summary
Nothing blocking: the boundaries are the ones the plan asked for, and T4/T5 will fit on top without rework. Date formatting and `briefHref` sit in `src/lib/brief.ts` behind one private `formatPlainDate`, the two components take plain props, and the pages only wire. `src/constants.ts` stays erasable (type annotations on the global `Intl` only), so `scripts/*.ts` can still import it under type stripping. gates.md records 31 red tests plus two unloadable files before implementation and 184 green at bef352b, with check and build passing and QA's files unchanged. I looked at four of the nine screenshots (home-phone, archive-phone, archive-dark, archive-2026-11-09-light): they match AC21–AC24 and "All briefs" is centred. The first pass missed nothing, and the ponytail-review pass found nothing to cut.

## Comments

### N1 · nit · [ARCH] · src/constants.ts:28-42
The three `*_DATE_FORMAT` objects are exported as mutable `Intl.DateTimeFormatOptions`, so any importer can mutate a shared constant. T5's `LINEUP_STATUS` is specified `as const`, which gives the file two shapes for object constants. `{ ... } as const satisfies Intl.DateTimeFormatOptions` keeps the literal types, is read-only, and is still erasable syntax. Worth aligning here or when T5 lands.

### N2 · nit · [ARCH] · src/constants.ts:25
`PATH_SEPARATOR` is a URL path separator, but T4/T5 scripts that deal in filesystem paths will import this file. A name like `URL_PATH_SEPARATOR` would stop it being read as `path.sep`.

### N3 · nit · [ARCH] · src/constants.ts:26-27, 53
`DATE_LOCALE`, `ISO_DATE_SEPARATOR` and the format objects sit under `Navigation`, and `MONTH_KEY_LENGTH` under `Archive`, yet all describe date handling in `brief.ts` that every page uses. The plan placed them there, so this is not the author's doing. If a later task adds more date values, give them a `Dates` section instead of growing `Navigation`.
