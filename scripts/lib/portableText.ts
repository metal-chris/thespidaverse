/**
 * Portable Text block builder for seed scripts, with emphasis.
 *
 * Every backfill seed script carried its own `makeBody` that emitted exactly one
 * span per block with `marks: []`. Bold was therefore not merely unused, it was
 * inexpressible — which is why 14 drafted articles run 0% bold against a
 * published corpus that carries emphasis on roughly 15–19% of prose words.
 *
 * Emphasis is not decoration here. The house convention puts bold on the payload
 * clause of a paragraph, so a reader skimming the bolded text alone still gets
 * the argument. Flat prose loses that layer entirely.
 *
 * Authors write `**bold**` and `_em_` inline, the same syntax the markdown
 * archive uses, and this splits them into marked spans. Keeping the author-facing
 * syntax identical to the archive's means prose can move between the two without
 * translation.
 */

export interface Span {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

export interface Block {
  _type: "block";
  _key: string;
  style: string;
  children: Span[];
  markDefs: never[];
}

export interface BodyItem {
  style: "normal" | "h2" | "h3" | "h4" | "blockquote";
  text: string;
}

export const p = (text: string): BodyItem => ({ style: "normal", text });
export const h2 = (text: string): BodyItem => ({ style: "h2", text });
export const h3 = (text: string): BodyItem => ({ style: "h3", text });
export const quote = (text: string): BodyItem => ({ style: "blockquote", text });

/**
 * Split `**bold**` / `_em_` runs into spans.
 *
 * Deliberately not a markdown parser. It handles the two marks the schema uses
 * and leaves everything else as literal text, so an apostrophe or a stray
 * asterisk in prose cannot silently restructure a paragraph.
 */
export function toSpans(text: string, keyPrefix: string): Span[] {
  const spans: Span[] = [];
  const re = /\*\*(.+?)\*\*|_(.+?)_/g;
  let last = 0;
  let i = 0;
  const push = (t: string, marks: string[]) => {
    if (!t) return;
    spans.push({ _type: "span", _key: `${keyPrefix}s${i++}`, text: t, marks });
  };
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    push(text.slice(last, m.index), []);
    push(m[1] ?? m[2], [m[1] !== undefined ? "strong" : "em"]);
    last = m.index + m[0].length;
  }
  push(text.slice(last), []);
  // A block must always have at least one span, even when the text is empty.
  return spans.length ? spans : [{ _type: "span", _key: `${keyPrefix}s0`, text, marks: [] }];
}

export function makeBody(items: BodyItem[]): Block[] {
  return items.map((item, idx) => {
    const key = `k${idx.toString().padStart(3, "0")}`;
    return {
      _type: "block" as const,
      _key: key,
      style: item.style,
      children: toSpans(item.text, key),
      markDefs: [] as never[],
    };
  });
}

/** Share of prose words carrying `strong`, across `normal` blocks only. */
export function boldShare(items: BodyItem[]): number {
  let bold = 0;
  let total = 0;
  for (const item of items) {
    if (item.style !== "normal") continue;
    for (const span of toSpans(item.text, "x")) {
      const n = span.text.split(/\s+/).filter(Boolean).length;
      total += n;
      if (span.marks.includes("strong")) bold += n;
    }
  }
  return total ? (bold * 100) / total : 0;
}
