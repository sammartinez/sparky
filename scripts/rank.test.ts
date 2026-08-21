import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalize, rank } from "./rank.ts";
import type { RawItem } from "./types.ts";

test("canonicalize strips decoration", () => {
  assert.equal(
    canonicalize("https://www.Example.com/post/?utm_source=x&b=2#top"),
    "https://example.com/post?b=2",
  );
  assert.equal(canonicalize("http://m.example.com/a/b/"), "https://example.com/a/b");
});

test("canonicalize normalizes arxiv", () => {
  assert.equal(
    canonicalize("https://arxiv.org/pdf/2501.12345v3.pdf"),
    "https://arxiv.org/abs/2501.12345",
  );
  assert.equal(
    canonicalize("https://arxiv.org/abs/2501.12345"),
    "https://arxiv.org/abs/2501.12345",
  );
});

const NOW = Date.now();

function item(overrides: Partial<RawItem> = {}): RawItem {
  return {
    source: "hn",
    label: "HN",
    title: "t",
    url: "https://a.com/1",
    points: 100,
    comments: 10,
    createdAt: NOW - 3_600_000,
    ...overrides,
  };
}

/** Enough peers per source that percentile() stops returning its neutral prior. */
function filler(domain: string, n = 8): RawItem[] {
  return Array.from({ length: n }, (_, i) =>
    item({ url: `https://${domain}/${i}`, title: `filler ${i}`, points: i * 20 }),
  );
}

test("merges the same URL seen on different sources", () => {
  const out = rank([
    item({ url: "https://a.com/1?utm_source=hn" }),
    item({ source: "reddit", label: "r/LocalLLaMA", url: "https://www.a.com/1" }),
    item({ url: "https://b.com/2", title: "unrelated story" }),
  ]);
  assert.equal(out.length, 2);
  assert.equal(out.find((s) => s.domain === "a.com")!.appearances.length, 2);
});

test("merges near-identical titles across outlets", () => {
  const out = rank([
    item({ title: "OpenAI releases GPT-6 to all users", url: "https://verge.com/a" }),
    item({
      source: "reddit",
      label: "r/OpenAI",
      title: "OpenAI Releases GPT-6 to All Users",
      url: "https://techcrunch.com/b",
    }),
  ]);
  assert.equal(out.length, 1);
});

test("cross-source corroboration beats a lone higher score", () => {
  const out = rank([
    ...filler("filler.com"),
    item({ url: "https://solo.com/x", title: "solo story", points: 200 }),
    item({ url: "https://both.com/y", title: "corroborated story", points: 140 }),
    item({
      source: "reddit",
      label: "r/ML",
      url: "https://both.com/y",
      title: "corroborated story",
      points: 140,
    }),
  ]);
  const solo = out.find((s) => s.domain === "solo.com")!;
  const both = out.find((s) => s.domain === "both.com")!;
  assert.ok(both.score > solo.score, `${both.score} should beat ${solo.score}`);
});

test("age decays score", () => {
  const out = rank([
    ...filler("filler.com"),
    item({ url: "https://fresh.com/x", title: "fresh", points: 150 }),
    item({
      url: "https://old.com/x",
      title: "old",
      points: 150,
      createdAt: NOW - 30 * 3_600_000,
    }),
  ]);
  assert.ok(
    out.find((s) => s.domain === "fresh.com")!.score >
      out.find((s) => s.domain === "old.com")!.score,
  );
});

test("sources with no points get a neutral prior, not a zero", () => {
  const out = rank([item({ source: "rss", label: "Simon Willison", points: null })]);
  assert.equal(out[0].normalized, 0.5);
});
