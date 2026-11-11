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

export interface Element {
  /** Raw attribute text of the opening tag. */
  attrs: string;
  /** The class attribute split into utilities; [] when there is none. */
  classes: string[];
  /** Raw inner HTML. */
  inner: string;
}

function classesIn(attrs: string): string[] {
  const match = attrs.match(/\bclass="([^"]*)"/);
  return match ? match[1].split(/\s+/).filter(Boolean) : [];
}

/**
 * Every <tag>…</tag> in document order. Matches up to the first closing tag,
 * so use it on elements that do not nest inside themselves.
 */
export function elements(html: string, tag: string): Element[] {
  const pattern = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, "g");
  return [...html.matchAll(pattern)].map((m) => ({
    attrs: m[1],
    classes: classesIn(m[1]),
    inner: m[2],
  }));
}

/** Every <a> whose href is exactly `target`, in document order. */
export function anchorsTo(html: string, target: string): Element[] {
  return elements(html, "a").filter((a) =>
    new RegExp(`\\bhref="${escapeRegExp(target)}"`).test(a.attrs),
  );
}

/** Classes of the first <tag> whose first child is a <span> with exactly `text`. */
export function classesOfParentOf(
  html: string,
  tag: string,
  text: string,
): string[] {
  const match = html.match(
    new RegExp(
      `<${tag}\\b([^>]*)>\\s*<span\\b[^>]*>${escapeRegExp(text)}</span>`,
    ),
  );
  return match ? classesIn(match[1]) : [];
}

/**
 * Text as it is read out: tags removed without adding anything in their
 * place, so two inline elements with no whitespace between them run together.
 */
export function readText(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
