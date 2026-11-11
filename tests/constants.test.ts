import { test, expect } from "vitest";

// Loaded per test so a missing export fails that test alone.
const constants = (): Promise<Record<string, unknown>> =>
  import("../src/constants");

test("SITE_NAME is the wordmark text", async () => {
  expect((await constants()).SITE_NAME).toBe("Sparky News");
});

test("HEADING_ARCHIVE is the archive page heading", async () => {
  expect((await constants()).HEADING_ARCHIVE).toBe("Archive");
});

test("HEADING_NO_BRIEF is the home page heading when no brief exists", async () => {
  expect((await constants()).HEADING_NO_BRIEF).toBe("No brief yet");
});

test("ALSO_TODAY_HEADING is the compact list heading", async () => {
  expect((await constants()).ALSO_TODAY_HEADING).toBe("Also today");
});
