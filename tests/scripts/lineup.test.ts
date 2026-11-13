// C3: when the keyword filter removed every story and no brief existed for
// today, the build wrote a brief with zero stories. The lineup merge now
// reports that case as "empty" so the build can refuse to write it.
import { test, expect } from "vitest";
import { mergeLineup, type Lineup } from "../../scripts/lineup.ts";
import { redecay } from "../../scripts/rank.ts";
import type { Story } from "../../scripts/types.ts";
import { HOUR_MS } from "../support/rawItems.ts";
import { digest, story } from "../support/stories.ts";

/** When this morning's brief was generated, and so when its stories were scored. */
const GENERATED_AT = "2026-11-13T08:00:00.000Z";
const SCORED_AT = Date.parse(GENERATED_AT);
/** The afternoon run that merges new candidates into the morning brief. */
const NOW = SCORED_AT + 6 * HOUR_MS;
/** The build's default brief size. */
const KEEP = 15;

function hoursBefore(time: number, hours: number): string {
  return new Date(time - hours * HOUR_MS).toISOString();
}

/** A story in this morning's brief, two hours old when it was scored. */
function carriedStory(i: number, score: number): Story {
  return story(i, hoursBefore(SCORED_AT, 2), { score });
}

/**
 * A story in this morning's brief that was already a day old when scored, so
 * six more hours cost it far less of its score than they cost a fresh one.
 */
function oldCarriedStory(i: number, score: number): Story {
  return story(i, hoursBefore(SCORED_AT, 24), { score });
}

/** A story ranked on this run's clock. */
function candidate(i: number, score: number): Story {
  return story(i, hoursBefore(NOW, 1), { score });
}

/** This morning's brief holding `stories`. */
function morningBrief(stories: Story[] = []) {
  return digest(GENERATED_AT, stories);
}

/** A carried story as it should come out of the merge. */
function aged(carried: Story): Story {
  return redecay(carried, SCORED_AT, NOW);
}

function ids(lineup: Lineup): string[] {
  return lineup.stories.map((s) => s.id);
}

test("reports an empty lineup when no brief exists and every story was filtered out", () => {
  expect(mergeLineup(null, [], NOW, KEEP)).toEqual({
    status: "empty",
    stories: [],
  });
});

test("gives each carried story the score redecay returns for the brief's generatedAt", () => {
  const carried = [carriedStory(1, 10), carriedStory(2, 8)];

  const lineup = mergeLineup(morningBrief(carried), [], NOW, KEEP);

  expect(lineup.stories).toEqual(carried.map(aged));
});

test("orders carried stories by their re-decayed score, not the score they were saved with", () => {
  const fresh = carriedStory(1, 10);
  const old = oldCarriedStory(2, 8);

  const lineup = mergeLineup(morningBrief([fresh, old]), [], NOW, KEEP);

  expect(lineup.stories).toEqual([aged(old), aged(fresh)]);
});

test("leaves candidate scores as ranked", () => {
  const candidates = [candidate(1, 7), candidate(2, 3)];

  const lineup = mergeLineup(null, candidates, NOW, KEEP);

  expect(lineup.stories).toEqual(candidates);
});

test("orders candidates by score, highest first", () => {
  const candidates = [candidate(1, 3), candidate(2, 9), candidate(3, 6)];

  expect(ids(mergeLineup(null, candidates, NOW, KEEP))).toEqual([
    "s2",
    "s3",
    "s1",
  ]);
});

test("slots a candidate between carried stories by score", () => {
  const top = carriedStory(1, 10);
  const bottom = carriedStory(2, 8);
  const between = (aged(top).score + aged(bottom).score) / 2;

  const lineup = mergeLineup(
    morningBrief([top, bottom]),
    [candidate(3, between)],
    NOW,
    KEEP,
  );

  expect(ids(lineup)).toEqual(["s1", "s3", "s2"]);
});

test("places a carried story ahead of a candidate with the same score", () => {
  const carried = carriedStory(2, 10);

  const lineup = mergeLineup(
    morningBrief([carried]),
    [candidate(1, aged(carried).score)],
    NOW,
    KEEP,
  );

  expect(ids(lineup)).toEqual(["s2", "s1"]);
});

test("returns only the top `keep` stories", () => {
  const carried = [carriedStory(1, 10), carriedStory(2, 8)];
  const candidates = [candidate(3, 50), candidate(4, 40), candidate(5, 0.1)];

  const lineup = mergeLineup(morningBrief(carried), candidates, NOW, 3);

  expect(ids(lineup)).toEqual(["s3", "s4", "s1"]);
});

test("returns every story when there are exactly `keep` of them", () => {
  const candidates = [candidate(1, 9), candidate(2, 6), candidate(3, 3)];

  expect(ids(mergeLineup(null, candidates, NOW, 3))).toEqual([
    "s1",
    "s2",
    "s3",
  ]);
});

test("is unchanged when the brief's stories keep their order and nothing new arrives", () => {
  const brief = morningBrief([carriedStory(1, 10), carriedStory(2, 8)]);

  expect(mergeLineup(brief, [], NOW, KEEP).status).toBe("unchanged");
});

test("is unchanged when every candidate scores below a full brief's last story", () => {
  const brief = morningBrief([carriedStory(1, 10), carriedStory(2, 8)]);

  const lineup = mergeLineup(brief, [candidate(3, 0.1)], NOW, 2);

  expect(lineup.status).toBe("unchanged");
  expect(ids(lineup)).toEqual(["s1", "s2"]);
});

test("is unchanged, never empty, when today's brief has no stories and nothing new arrives", () => {
  expect(mergeLineup(morningBrief(), [], NOW, KEEP)).toEqual({
    status: "unchanged",
    stories: [],
  });
});

test("publishes when a candidate enters the lineup", () => {
  const brief = morningBrief([carriedStory(1, 10), carriedStory(2, 8)]);

  const lineup = mergeLineup(brief, [candidate(3, 0.1)], NOW, KEEP);

  expect(lineup.status).toBe("publish");
  expect(ids(lineup)).toEqual(["s1", "s2", "s3"]);
});

test("publishes when a candidate pushes a carried story out of a full brief", () => {
  const brief = morningBrief([carriedStory(1, 10), carriedStory(2, 8)]);

  const lineup = mergeLineup(brief, [candidate(3, 50)], NOW, 2);

  expect(lineup.status).toBe("publish");
  expect(ids(lineup)).toEqual(["s3", "s1"]);
});

test("publishes when re-decay changes the order of the brief's own stories", () => {
  const brief = morningBrief([carriedStory(1, 10), oldCarriedStory(2, 8)]);

  expect(mergeLineup(brief, [], NOW, KEEP).status).toBe("publish");
});

test("publishes when no brief exists and at least one candidate survives", () => {
  expect(mergeLineup(null, [candidate(1, 5)], NOW, KEEP).status).toBe(
    "publish",
  );
});

test("publishes when today's brief has no stories and a candidate arrives", () => {
  const lineup = mergeLineup(morningBrief(), [candidate(1, 5)], NOW, KEEP);

  expect(lineup.status).toBe("publish");
  expect(ids(lineup)).toEqual(["s1"]);
});

test("does not mutate the existing brief or the candidates", () => {
  const brief = morningBrief([carriedStory(1, 10), oldCarriedStory(2, 8)]);
  const candidates = [candidate(3, 0.1), candidate(4, 50)];
  const briefBefore = structuredClone(brief);
  const candidatesBefore = structuredClone(candidates);

  mergeLineup(brief, candidates, NOW, KEEP);

  expect(brief).toEqual(briefBefore);
  expect(candidates).toEqual(candidatesBefore);
});
