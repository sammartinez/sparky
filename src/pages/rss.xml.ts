import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { allDigests, formatDate, href } from "../lib/brief";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export const GET: APIRoute = async (context) => {
  const digests = await allDigests();

  return rss({
    title: "Sparky News",
    description: "A daily read on what the AI world is actually talking about.",
    site: context.site ?? "http://localhost:4321",
    // One item per morning: the whole brief arrives as a single entry rather
    // than fifteen separate ones cluttering the reader.
    items: digests.slice(0, 60).map((d) => ({
      title: `Sparky News — ${formatDate(d.data.date)}`,
      // @astrojs/rss joins this onto `site`, which does not include `base`.
      link: href(`archive/${d.id}`),
      pubDate: new Date(d.data.generatedAt),
      description: d.data.stories
        .slice(0, 3)
        .map((s) => s.title)
        .join(" · "),
      content: d.data.stories
        .map((s, i) => {
          const where = s.appearances.map((a) => escape(a.label)).join(", ");
          const why = s.why ? `<br><em>${escape(s.why)}</em>` : "";
          return (
            `<p><strong>${i + 1}. <a href="${escape(s.url)}">${escape(s.title)}</a></strong>` +
            `${why}<br><small>${escape(s.domain)} — ${where}</small></p>`
          );
        })
        .join("\n"),
    })),
  });
};
