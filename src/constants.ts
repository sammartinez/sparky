/*
  Every literal the site and the digest scripts share lives here: one flat
  file of plain exported consts, grouped by section. Add a value under the
  section it belongs to.

  Astro code imports this file, and so do scripts/*.ts, which Node runs with
  native type stripping. Keep it to erasable syntax: no enums, no namespaces,
  no import.meta.env, no process.env, no imports from astro:*.
  Environment-variable reads stay in the scripts.
*/

// Site
export const SITE_NAME = "Sparky News";
export const HEADING_NO_BRIEF = "No brief yet";
export const ALSO_TODAY_HEADING = "Also today";

// Story card
export const OPENS_IN_NEW_TAB = "(opens in new tab)";

// Navigation

// Archive
export const HEADING_ARCHIVE = "Archive";
export const TITLE_ARCHIVE = `${HEADING_ARCHIVE}: ${SITE_NAME}`;
export const BRIEF_COUNT_SINGULAR = "brief";
export const BRIEF_COUNT_PLURAL = "briefs";

// Pipeline
