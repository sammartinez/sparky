/** Small helpers for asserting on rendered HTML strings. */

export interface Heading {
  level: number;
  /** Text content with tags stripped and whitespace collapsed. */
  text: string;
  /** Raw inner HTML of the heading element. */
  inner: string;
}

export function textOf(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Every h1–h6 in document order. */
export function headings(html: string): Heading[] {
  return [...html.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/g)].map((m) => ({
    level: Number(m[1]),
    text: textOf(m[2]),
    inner: m[2],
  }));
}

export function headingsAt(html: string, level: number): Heading[] {
  return headings(html).filter((h) => h.level === level);
}

/** Inner HTML of the first <tag>…</tag>, or "" when the tag is absent. */
export function innerOf(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1] : "";
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Inner HTML of every <a> whose href is exactly `target`. */
export function linksTo(html: string, target: string): string[] {
  const pattern = new RegExp(
    `<a\\b[^>]*\\bhref="${escapeRegExp(target)}"[^>]*>([\\s\\S]*?)</a>`,
    "g",
  );
  return [...html.matchAll(pattern)].map((m) => m[1]);
}
