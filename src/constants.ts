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
export const ALL_BRIEFS_LABEL = "All briefs";
export const PREV_ARROW = "←";
export const NEXT_ARROW = "→";
export const ROUTE_ARCHIVE = "archive";
export const PATH_SEPARATOR = "/";
export const DATE_LOCALE = "en-US";
export const ISO_DATE_SEPARATOR = "-";
export const LONG_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
};
export const SHORT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  weekday: "short",
  month: "short",
  day: "numeric",
};
export const MONTH_FORMAT: Intl.DateTimeFormatOptions = {
  month: "long",
  year: "numeric",
};

// Archive
export const HEADING_ARCHIVE = "Archive";
export const TITLE_ARCHIVE = `${HEADING_ARCHIVE}: ${SITE_NAME}`;
export const BRIEF_COUNT_SINGULAR = "brief";
export const BRIEF_COUNT_PLURAL = "briefs";
export const LED_WITH_LABEL = "Led with:";
export const STORIES_LABEL = "stories";
export const NO_BRIEFS_MESSAGE = "No briefs archived yet.";
// Length of the "YYYY-MM" prefix of an ISO date.
export const MONTH_KEY_LENGTH = 7;

// Pipeline
// A version number anywhere in a title: "0.31", the "0.9.1" of "v0.9.1", the
// "6" of "GPT-6", the "4" of "Llama4". Global, for String.prototype.match;
// never call .test() or .exec() on it (they keep lastIndex between calls).
export const VERSION_TOKEN_PATTERN = /\d+(?:\.\d+)*/g;
// What the lineup merge decided: write the brief, leave today's brief alone,
// or refuse because there is nothing to write and no brief to keep.
export const LINEUP_STATUS = {
  PUBLISH: "publish",
  UNCHANGED: "unchanged",
  EMPTY: "empty",
} as const;
export const EMPTY_BRIEF_MESSAGE =
  "Every story was filtered out and no brief exists for today. Refusing to write an empty brief.";
