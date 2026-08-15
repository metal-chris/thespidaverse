import Fuse, { type FuseResultMatch } from "fuse.js";
import type { SearchDoc } from "@/app/api/search-index/route";

/**
 * Client-side search for the ⌘K dialog.
 *
 * Replaces a `.includes()` over every field joined into one lowercase string.
 * That had three failures worth naming, because they are what this fixes:
 *
 *   - No typo tolerance. "spidr" matched nothing.
 *   - Order-dependent. "web pop" missed "A Pop Culture Web", because a
 *     substring test cannot reorder tokens.
 *   - No ranking. A hit in a mood tag scored exactly as high as a hit in the
 *     title, so the best result was wherever it happened to sit in the array.
 *
 * Fuse is doing the work rather than a hand-rolled scorer: fuzzy matching that
 * is actually correct (Bitap, not "does it contain the letters") is not
 * something to reimplement, and the weights below give us field ranking for
 * free rather than as a second pass.
 */

const WEIGHTS = [
  // Title dominates. Someone typing a title wants that article, not an
  // article that mentions it.
  { name: "title", weight: 0.5 },
  { name: "excerpt", weight: 0.2 },
  { name: "category", weight: 0.12 },
  { name: "tags", weight: 0.1 },
  { name: "moods", weight: 0.08 },
];

export function buildIndex(docs: SearchDoc[]) {
  return new Fuse(docs, {
    keys: WEIGHTS,
    // 0.0 = exact, 1.0 = match anything. 0.38 tolerates a transposed or
    // dropped character without letting three-letter queries match the corpus.
    threshold: 0.38,
    ignoreLocation: true, // a match at the end of an excerpt is still a match
    minMatchCharLength: 2,
    includeScore: true,
    includeMatches: true, // drives the highlighting below
    useExtendedSearch: false,
  });
}

export interface Hit {
  doc: SearchDoc;
  matches: readonly FuseResultMatch[];
}

export function runSearch(fuse: Fuse<SearchDoc>, query: string, limit = 8): Hit[] {
  const q = query.trim();
  if (q.length < 2) return [];
  return fuse
    .search(q, { limit })
    .map((r) => ({ doc: r.item, matches: r.matches ?? [] }));
}

/**
 * Split a string into matched / unmatched runs so the caller can mark the
 * matched parts. Returns plain data, never HTML — nothing here goes near
 * dangerouslySetInnerHTML.
 */
export function highlight(
  text: string,
  matches: readonly FuseResultMatch[],
  key: string
): { text: string; hit: boolean }[] {
  const m = matches.find((x) => x.key === key);
  if (!m || !m.indices.length) return [{ text, hit: false }];

  // Fuse yields overlapping/adjacent ranges; merge them or the output
  // fragments into unreadable single characters.
  const ranges = [...m.indices]
    .filter(([s, e]) => e - s >= 1)
    .sort((a, b) => a[0] - b[0]);
  if (!ranges.length) return [{ text, hit: false }];

  const merged: [number, number][] = [];
  for (const [s, e] of ranges) {
    const last = merged[merged.length - 1];
    if (last && s <= last[1] + 1) last[1] = Math.max(last[1], e);
    else merged.push([s, e]);
  }

  const out: { text: string; hit: boolean }[] = [];
  let cursor = 0;
  for (const [s, e] of merged) {
    if (s > cursor) out.push({ text: text.slice(cursor, s), hit: false });
    out.push({ text: text.slice(s, e + 1), hit: true });
    cursor = e + 1;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor), hit: false });
  return out;
}

/* ------------------------------------------------------------------ */
/* Recent searches                                                      */
/* ------------------------------------------------------------------ */

const RECENTS_KEY = "spidaverse:recent-searches";
const MAX_RECENTS = 5;

export function readRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string").slice(0, MAX_RECENTS)
      : [];
  } catch {
    // Private mode, quota, or someone else's data in the key. Recents are a
    // convenience; never let them break the dialog.
    return [];
  }
}

export function pushRecent(query: string): string[] {
  const q = query.trim();
  if (!q || typeof window === "undefined") return readRecents();
  const next = [q, ...readRecents().filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(
    0,
    MAX_RECENTS
  );
  try {
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* non-fatal, see readRecents */
  }
  return next;
}

export function clearRecents(): string[] {
  try {
    window.localStorage.removeItem(RECENTS_KEY);
  } catch {
    /* non-fatal */
  }
  return [];
}

/* ------------------------------------------------------------------ */
/* Category jumps                                                       */
/* ------------------------------------------------------------------ */

/**
 * Search should also find the FILTERS, not only the articles. The results page
 * already facets by category; without this, typing "reviews" returns articles
 * that mention reviews and gives no way to reach the category itself.
 */
export function matchCategories(
  docs: SearchDoc[],
  query: string,
  limit = 3
): { title: string; slug: string; count: number }[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const byCat = new Map<string, { title: string; slug: string; count: number }>();
  for (const d of docs) {
    if (!d.category || !d.categorySlug) continue;
    const entry = byCat.get(d.categorySlug) ?? {
      title: d.category,
      slug: d.categorySlug,
      count: 0,
    };
    entry.count += 1;
    byCat.set(d.categorySlug, entry);
  }
  return [...byCat.values()]
    .filter((c) => c.title.toLowerCase().includes(q))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
