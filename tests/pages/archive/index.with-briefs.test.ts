import { test, expect, vi } from "vitest";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { href } from "../../../src/lib/brief";
import { anchorsTo, elements, headingsAt, innerOf } from "../../support/html";
import { digestEntry } from "../../support/stories";

// Stand in for the content store only, so the page, ArchiveList and
// src/lib/brief run for real. Oldest first: the page sorts newest first.
vi.mock("astro:content", () => ({
  getCollection: async () => [
    digestEntry("2026-10-31", ["Halloween lead"]),
    digestEntry("2026-11-04", ["Wednesday lead"]),
    digestEntry("2026-11-05", ["Thursday lead"]),
  ],
}));

async function render() {
  const { default: ArchivePage } =
    await import("../../../src/pages/archive/index.astro");
  const container = await AstroContainer.create();
  return innerOf(await container.renderToString(ArchivePage), "main");
}

test("the archive page groups its briefs under one h2 per month, newest month first", async () => {
  const main = await render();
  expect(headingsAt(main, 2).map((h) => h.text)).toEqual([
    "November 2026",
    "October 2026",
  ]);
});

test("the archive page lists each month's days in an ordered list, newest first", async () => {
  const main = await render();
  const lists = elements(main, "ol");
  expect(lists).toHaveLength(2);

  const november = elements(lists[0].inner, "li");
  expect(november).toHaveLength(2);
  expect(anchorsTo(november[0].inner, href("archive/2026-11-05"))).toHaveLength(
    1,
  );
  expect(anchorsTo(november[1].inner, href("archive/2026-11-04"))).toHaveLength(
    1,
  );

  const october = elements(lists[1].inner, "li");
  expect(october).toHaveLength(1);
  expect(anchorsTo(october[0].inner, href("archive/2026-10-31"))).toHaveLength(
    1,
  );
});

test("the archive page links to each brief exactly once", async () => {
  const main = await render();
  for (const id of ["2026-11-05", "2026-11-04", "2026-10-31"]) {
    expect(anchorsTo(main, href(`archive/${id}`))).toHaveLength(1);
  }
});

test("the archive page with briefs does not show the no-briefs message", async () => {
  const main = await render();
  expect(main).not.toContain("No briefs archived yet.");
});
