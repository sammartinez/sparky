import chalk from "chalk";
import { XMLParser } from "fast-xml-parser";
import type { RawItem } from "./types.ts";

const WINDOW_HOURS = Number(process.env.WINDOW_HOURS ?? 36);
const SINCE_MS = Date.now() - WINDOW_HOURS * 3_600_000;
const SINCE_SEC = Math.floor(SINCE_MS / 1000);

// Hugging Face rejects requests with a default or empty UA.
const UA = "sparky/1.0 (personal daily digest; +https://github.com)";

/** High-precision feeds with no traction signal of their own. */
const FEEDS: { label: string; url: string }[] = [
  {
    label: "Simon Willison",
    url: "https://simonwillison.net/atom/everything/",
  },
  { label: "Import AI", url: "https://importai.substack.com/feed" },
  // anthropic.com publishes no RSS feed (every /news/rss.xml-style path 404s);
  // its announcements reach the brief via HN and Simon Willison instead.
  { label: "OpenAI", url: "https://openai.com/news/rss.xml" },
  { label: "Google DeepMind", url: "https://deepmind.google/blog/rss.xml" },
  { label: "Hugging Face", url: "https://huggingface.co/blog/feed.xml" },
];

/** Run a fetcher, log and swallow failures. One dead source must not kill the run. */
async function safe(
  name: string,
  fn: () => Promise<RawItem[]>,
): Promise<RawItem[]> {
  try {
    const items = await fn();
    console.log(`  ${name}: ${chalk.green(items.length)}`);
    return items;
  } catch (err) {
    console.warn(
      `  ${chalk.yellow(`${name}: FAILED — ${(err as Error).message}`)}`,
    );
    return [];
  }
}

async function getJSON(url: string): Promise<any> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

// ---------------------------------------------------------------------------
// Hacker News, via the Algolia index. No key, no auth, filterable by points.
// This is the backbone: HN has already done the traction detection.
// ---------------------------------------------------------------------------

async function hn(): Promise<RawItem[]> {
  const minPoints = Number(process.env.HN_MIN_POINTS ?? 25);
  const endpoints = [
    // Everything that cleared the points bar in the window, regardless of topic.
    `https://hn.algolia.com/api/v1/search_by_date?tags=story&hitsPerPage=200` +
      `&numericFilters=created_at_i>${SINCE_SEC},points>${minPoints}`,
    // Plus a lower bar for explicitly AI discussion, which often lags. Algolia
    // ANDs every word in a query (there is no OR operator), so each term is
    // its own request; a single "AI OR LLM" query returns nothing.
    ...["AI", "LLM"].map(
      (term) =>
        `https://hn.algolia.com/api/v1/search?query=${term}&tags=story&hitsPerPage=100` +
        `&numericFilters=created_at_i>${SINCE_SEC},points>10`,
    ),
  ];

  const items: RawItem[] = [];
  for (const endpoint of endpoints) {
    const data = await getJSON(endpoint);
    for (const hit of data.hits ?? []) {
      const discussionUrl = `https://news.ycombinator.com/item?id=${hit.objectID}`;
      // Ask HN / Show HN text posts have no external URL; point at the thread.
      const url = hit.url || discussionUrl;
      if (!hit.title) continue;
      items.push({
        source: "hn",
        label: "HN",
        title: hit.title,
        url,
        discussionUrl,
        points: hit.points ?? 0,
        comments: hit.num_comments ?? 0,
        createdAt: hit.created_at_i * 1000,
      });
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Lobste.rs — smaller, but a good early signal on engineering-side AI stories.
// ---------------------------------------------------------------------------

async function lobsters(): Promise<RawItem[]> {
  const tags = ["ai", "ml"];
  const items: RawItem[] = [];
  for (const tag of tags) {
    const data = await getJSON(`https://lobste.rs/t/${tag}.json`);
    for (const story of data ?? []) {
      const createdAt = new Date(story.created_at).getTime();
      if (createdAt < SINCE_MS) continue;
      items.push({
        source: "lobsters",
        label: "Lobsters",
        title: story.title,
        url: story.url || story.comments_url,
        discussionUrl: story.comments_url,
        points: story.score ?? 0,
        comments: story.comment_count ?? 0,
        createdAt,
      });
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// Hugging Face daily papers — research breaking out before it hits the news.
// Undocumented endpoint, so treat failure as normal.
// ---------------------------------------------------------------------------

async function huggingface(): Promise<RawItem[]> {
  const data = await getJSON(
    "https://huggingface.co/api/daily_papers?limit=40",
  );
  const items: RawItem[] = [];
  for (const entry of data ?? []) {
    const paper = entry.paper ?? entry;
    const id = paper.id;
    if (!id) continue;
    // `publishedAt` is the arXiv date, which is usually days old by the time a
    // paper is featured. `submittedOnDailyAt` is when it hit the daily list,
    // which is the event we actually care about.
    const createdAt = new Date(
      paper.submittedOnDailyAt ??
        entry.publishedAt ??
        paper.publishedAt ??
        Date.now(),
    ).getTime();
    if (createdAt < SINCE_MS) continue;
    items.push({
      source: "hf",
      label: "HF Papers",
      title: paper.title?.trim(),
      url: `https://arxiv.org/abs/${id}`,
      discussionUrl: `https://huggingface.co/papers/${id}`,
      points: paper.upvotes ?? 0,
      comments: paper.numComments ?? 0,
      createdAt,
    });
  }
  return items.filter((i) => i.title);
}

// ---------------------------------------------------------------------------
// Hand-picked feeds. No traction signal — these earn their place on precision,
// and get a neutral prior in the ranker.
// ---------------------------------------------------------------------------

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

async function feeds(): Promise<RawItem[]> {
  const items: RawItem[] = [];
  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) throw new Error(`${res.status} for ${feed.url}`);
      const xml = parser.parse(await res.text());

      // RSS 2.0
      for (const item of asArray(xml?.rss?.channel?.item)) {
        const createdAt = new Date(
          item.pubDate ?? item["dc:date"] ?? 0,
        ).getTime();
        if (!createdAt || createdAt < SINCE_MS) continue;
        items.push({
          source: "rss",
          label: feed.label,
          title: String(item.title ?? "").trim(),
          url: String(item.link ?? "").trim(),
          points: null,
          comments: null,
          createdAt,
        });
      }

      // Atom
      for (const entry of asArray(xml?.feed?.entry)) {
        const createdAt = new Date(
          entry.updated ?? entry.published ?? 0,
        ).getTime();
        if (!createdAt || createdAt < SINCE_MS) continue;
        const link = asArray(entry.link).find(
          (l: any) => !l["@_rel"] || l["@_rel"] === "alternate",
        );
        items.push({
          source: "rss",
          label: feed.label,
          title: String(entry.title?.["#text"] ?? entry.title ?? "").trim(),
          url: String(link?.["@_href"] ?? "").trim(),
          points: null,
          comments: null,
          createdAt,
        });
      }
    }),
  );

  for (const [i, r] of results.entries()) {
    if (r.status === "rejected") {
      console.warn(
        chalk.yellow(
          `    ${FEEDS[i].label} failed: ${r.reason?.message ?? r.reason}`,
        ),
      );
    }
  }
  return items.filter((i) => i.title && i.url);
}

/** Fetch every source in parallel. Returns whatever succeeded. */
export async function fetchAll(): Promise<RawItem[]> {
  console.log(chalk.bold.cyan(`Fetching sources (last ${WINDOW_HOURS}h)…`));
  const batches = await Promise.all([
    safe("hacker news", hn),
    safe("lobsters", lobsters),
    safe("hugging face", huggingface),
    safe("feeds", feeds),
  ]);
  return batches.flat();
}
