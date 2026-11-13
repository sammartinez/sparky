import { LINEUP_STATUS } from "../src/constants.ts";
import { redecay } from "./rank.ts";
import type { Digest, Story } from "./types.ts";

export type LineupStatus = (typeof LINEUP_STATUS)[keyof typeof LINEUP_STATUS];

export interface Lineup {
  status: LineupStatus;
  stories: Story[];
}

/**
 * Today's lineup: the stories already in today's brief merged with this run's
 * candidates, and whether that is worth writing. `now` is epoch milliseconds.
 */
export function mergeLineup(
  existing: Digest | null,
  candidates: Story[],
  now: number,
  keep: number,
): Lineup {
  // Stories carried over from an earlier run today were scored on that run's
  // clock. Age them forward so they compete fairly with the new candidates.
  const carried = existing
    ? existing.stories.map((s) =>
        redecay(s, Date.parse(existing.generatedAt), now),
      )
    : [];

  // The sort is stable, so listing carried stories first lets one keep its
  // place over a candidate with the same score.
  const stories = [...carried, ...candidates]
    .sort((a, b) => b.score - a.score)
    .slice(0, keep);

  if (!existing) {
    return {
      status:
        stories.length === 0 ? LINEUP_STATUS.EMPTY : LINEUP_STATUS.PUBLISH,
      stories,
    };
  }

  const sameLineup =
    stories.length === existing.stories.length &&
    stories.every((s, i) => s.id === existing.stories[i].id);
  return {
    status: sameLineup ? LINEUP_STATUS.UNCHANGED : LINEUP_STATUS.PUBLISH,
    stories,
  };
}
