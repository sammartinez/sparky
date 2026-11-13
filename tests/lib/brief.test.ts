import { describe, test, expect } from "vitest";
import {
  formatMonth,
  formatShortDate,
  groupByMonth,
} from "../../src/lib/brief";

/** Entries carrying only what groupByMonth reads, plus a marker field. */
function entries(...ids: string[]) {
  return ids.map((id) => ({ id, marker: `entry ${id}` }));
}

describe("formatShortDate", () => {
  test("formats an ISO date as short weekday, short month and day", () => {
    expect(formatShortDate("2026-11-04")).toBe("Wed, Nov 4");
  });

  test("follows the date it is given", () => {
    expect(formatShortDate("2026-11-05")).toBe("Thu, Nov 5");
  });

  test("does not slip to the previous day on the first of a month", () => {
    expect(formatShortDate("2026-11-01")).toBe("Sun, Nov 1");
  });

  test("does not slip to the previous year on January 1", () => {
    expect(formatShortDate("2026-01-01")).toBe("Thu, Jan 1");
  });

  test("keeps a two-digit day on the last day of a month", () => {
    expect(formatShortDate("2026-10-31")).toBe("Sat, Oct 31");
  });
});

describe("formatMonth", () => {
  test("formats an ISO date as the full month name and year", () => {
    expect(formatMonth("2026-11-04")).toBe("November 2026");
  });

  test("does not slip to the previous month on the first of a month", () => {
    expect(formatMonth("2026-11-01")).toBe("November 2026");
  });

  test("does not slip to the previous year on January 1", () => {
    expect(formatMonth("2026-01-01")).toBe("January 2026");
  });

  test("stays in the month on its last day", () => {
    expect(formatMonth("2026-12-31")).toBe("December 2026");
  });
});

describe("groupByMonth", () => {
  test("returns no groups for no entries", () => {
    expect(groupByMonth([])).toEqual([]);
  });

  test("puts a single entry in one group keyed by its year and month", () => {
    const [only] = entries("2026-11-04");
    expect(groupByMonth([only])).toEqual([
      { key: "2026-11", label: "November 2026", entries: [only] },
    ]);
  });

  test("groups entries of the same month together", () => {
    const groups = groupByMonth(
      entries("2026-11-05", "2026-11-04", "2026-11-01"),
    );
    expect(groups.map((g) => g.key)).toEqual(["2026-11"]);
    expect(groups[0].entries.map((e) => e.id)).toEqual([
      "2026-11-05",
      "2026-11-04",
      "2026-11-01",
    ]);
  });

  test("starts a new group at each month boundary, keeping the input order", () => {
    const groups = groupByMonth(
      entries("2026-11-02", "2026-11-01", "2026-10-31", "2026-09-15"),
    );
    expect(groups.map((g) => g.key)).toEqual(["2026-11", "2026-10", "2026-09"]);
    expect(groups.map((g) => g.entries.map((e) => e.id))).toEqual([
      ["2026-11-02", "2026-11-01"],
      ["2026-10-31"],
      ["2026-09-15"],
    ]);
  });

  test("labels each group with its month name and year", () => {
    const groups = groupByMonth(entries("2026-11-01", "2026-10-31"));
    expect(groups.map((g) => g.label)).toEqual([
      "November 2026",
      "October 2026",
    ]);
  });

  test("keeps the same month of different years apart", () => {
    const groups = groupByMonth(entries("2026-11-04", "2025-11-04"));
    expect(groups.map((g) => g.key)).toEqual(["2026-11", "2025-11"]);
    expect(groups.map((g) => g.label)).toEqual([
      "November 2026",
      "November 2025",
    ]);
  });

  test("separates December from the January that follows it", () => {
    const groups = groupByMonth(entries("2026-01-01", "2025-12-31"));
    expect(groups.map((g) => g.label)).toEqual([
      "January 2026",
      "December 2025",
    ]);
  });

  test("preserves ascending input order rather than re-sorting", () => {
    const groups = groupByMonth(
      entries("2026-10-30", "2026-10-31", "2026-11-01"),
    );
    expect(groups.map((g) => g.entries.map((e) => e.id))).toEqual([
      ["2026-10-30", "2026-10-31"],
      ["2026-11-01"],
    ]);
  });

  test("groups only consecutive entries, so a month that recurs later gets its own group", () => {
    const groups = groupByMonth(
      entries("2026-11-05", "2026-10-31", "2026-11-01"),
    );
    expect(groups.map((g) => g.key)).toEqual(["2026-11", "2026-10", "2026-11"]);
  });

  test("returns the entries themselves, with their other fields intact", () => {
    const input = entries("2026-11-05", "2026-11-04");
    const [group] = groupByMonth(input);
    expect(group.entries[0]).toBe(input[0]);
    expect(group.entries[1].marker).toBe("entry 2026-11-04");
  });
});
