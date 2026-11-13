import { test, expect } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import ArchiveList from "../../src/components/ArchiveList.astro";
import { href } from "../../src/lib/brief";
import { anchorsTo, elements, headingsAt, textOf } from "../support/html";
import { digestEntry } from "../support/stories";

const LONG_TITLE =
  "A headline long enough that it cannot fit on a single line of the archive list at any width";

/** Newest first, across two months; the last November day has no stories. */
const DIGESTS = [
  digestEntry("2026-11-05", [LONG_TITLE, "Second story"]),
  digestEntry("2026-11-04", ["Wednesday lead"]),
  digestEntry("2026-11-01", []),
  digestEntry("2026-10-31", ["Halloween lead", "Another", "A third"]),
];

async function render(digests: unknown[] = DIGESTS) {
  const container = await AstroContainer.create();
  return container.renderToString(ArchiveList, { props: { digests } });
}

/** The single row link for a day. */
function row(html: string, id: string) {
  const rows = anchorsTo(html, href(`archive/${id}`));
  expect(rows).toHaveLength(1);
  return rows[0];
}

test("renders one h2 per month, newest month first", async () => {
  const html = await render();
  expect(headingsAt(html, 2).map((h) => h.text)).toEqual([
    "November 2026",
    "October 2026",
  ]);
});

test("each month is a section holding its heading and one ordered list", async () => {
  const html = await render();
  const sections = elements(html, "section");
  expect(sections).toHaveLength(2);
  for (const section of sections) {
    expect(headingsAt(section.inner, 2)).toHaveLength(1);
    expect(elements(section.inner, "ol")).toHaveLength(1);
  }
});

test("a month's days are list items in its ordered list, newest first, each linking to its brief", async () => {
  const html = await render();
  const [november, october] = elements(html, "section");

  const novemberDays = elements(november.inner, "ol").flatMap((ol) =>
    elements(ol.inner, "li"),
  );
  expect(novemberDays).toHaveLength(3);
  ["2026-11-05", "2026-11-04", "2026-11-01"].forEach((id, i) => {
    expect(
      anchorsTo(novemberDays[i].inner, href(`archive/${id}`)),
    ).toHaveLength(1);
  });

  const octoberDays = elements(october.inner, "ol").flatMap((ol) =>
    elements(ol.inner, "li"),
  );
  expect(octoberDays).toHaveLength(1);
  expect(
    anchorsTo(octoberDays[0].inner, href("archive/2026-10-31")),
  ).toHaveLength(1);
});

test("each list item wraps exactly one link", async () => {
  const html = await render();
  const items = elements(html, "li");
  expect(items).toHaveLength(DIGESTS.length);
  for (const item of items) {
    expect(elements(item.inner, "a")).toHaveLength(1);
    expect(item.inner.trim()).toMatch(/^<a\b[\s\S]*<\/a>$/);
  }
});

test("a day's row shows its long date", async () => {
  const html = await render();
  expect(textOf(row(html, "2026-11-04").inner)).toContain(
    "Wednesday, November 4, 2026",
  );
});

test("a day's row shows how many stories it had", async () => {
  const html = await render();
  expect(textOf(row(html, "2026-10-31").inner)).toContain("3 stories");
});

test("a day's row shows its first story after Led with:", async () => {
  const html = await render();
  const led = elements(row(html, "2026-10-31").inner, "p");
  expect(led.map((p) => textOf(p.inner))).toEqual(["Led with: Halloween lead"]);
});

test("the Led with line wraps to two lines instead of truncating to one", async () => {
  const html = await render();
  const [led] = elements(row(html, "2026-11-05").inner, "p");
  expect(textOf(led.inner)).toBe(`Led with: ${LONG_TITLE}`);
  expect(led.classes).toContain("line-clamp-2");
  expect(led.classes).not.toContain("truncate");
});

test("no element in the list is truncated to one line", async () => {
  const html = await render();
  expect(html).not.toMatch(/\bclass="[^"]*\btruncate\b/);
});

test("a day with no stories shows no Led with line", async () => {
  const html = await render();
  const empty = row(html, "2026-11-01");
  expect(elements(empty.inner, "p")).toEqual([]);
  expect(textOf(empty.inner)).not.toContain("Led with");
});

test("a day with no stories still shows its date and a zero count", async () => {
  const html = await render();
  const text = textOf(row(html, "2026-11-01").inner);
  expect(text).toContain("Sunday, November 1, 2026");
  expect(text).toContain("0 stories");
});

test("a single month renders one heading and one list", async () => {
  const html = await render([
    digestEntry("2026-11-05", ["Lead"]),
    digestEntry("2026-11-04", ["Lead"]),
  ]);
  expect(headingsAt(html, 2).map((h) => h.text)).toEqual(["November 2026"]);
  expect(elements(html, "ol")).toHaveLength(1);
  expect(elements(html, "li")).toHaveLength(2);
});

test("the same month of two different years gets two headings", async () => {
  const html = await render([
    digestEntry("2026-01-01", ["Lead"]),
    digestEntry("2025-12-31", ["Lead"]),
    digestEntry("2025-01-15", ["Lead"]),
  ]);
  expect(headingsAt(html, 2).map((h) => h.text)).toEqual([
    "January 2026",
    "December 2025",
    "January 2025",
  ]);
});

test("an empty archive shows the no-briefs message in a paragraph", async () => {
  const html = await render([]);
  expect(elements(html, "p").map((p) => textOf(p.inner))).toEqual([
    "No briefs archived yet.",
  ]);
});

test("an empty archive renders no list and no month heading", async () => {
  const html = await render([]);
  expect(html).not.toMatch(/<ol\b/);
  expect(html).not.toMatch(/<li\b/);
  expect(headingsAt(html, 2)).toEqual([]);
});

test("a populated archive does not show the no-briefs message", async () => {
  const html = await render();
  expect(html).not.toContain("No briefs archived yet.");
});
