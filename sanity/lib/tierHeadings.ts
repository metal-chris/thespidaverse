/**
 * Parse a document body's numbered headings into tier entries.
 *
 * Phase 3 / A6 (docs/TIER_LIST_SPEC.md). This is the script that ran three
 * times by hand in Aug 2026 — Ghibli (24), the animated series (9), Rivals
 * (7) — turned into a pure function the Studio button calls.
 *
 * Two heading shapes, both drawn from real articles:
 *   "3. Grave of the Fireflies (1988)"        → title, year
 *   "9. Marvel's Spider-Man (2017-2020)"      → title, year range
 *   "Season 6: Night at the Museum"           → title "Season 6", subtitle
 *
 * The anchor is `slugify(headingText)` because that is exactly what
 * PortableTextComponents.tsx puts on the rendered <h2 id>. Deriving it any
 * other way would drift.
 */
import { slugify } from "@/lib/utils";

export interface ParsedHeading {
  /** Order the heading appeared in, 1-based. Not the number in the text. */
  position: number;
  /** The number in "3." or "Season 6", when there is one. */
  rank: number | null;
  title: string;
  year?: string;
  subtitle?: string;
  anchor: string;
  heading: string;
}

type PTBlock = { _type?: string; style?: string; children?: Array<{ text?: string }> };

const NUMBERED = /^\s*(\d+)\s*[.)]\s*(.+?)\s*$/;
const SEASON = /^\s*(Season\s+\d+)\s*[:—-]\s*(.+?)\s*$/i;
/** Trailing "(1988)", "(2017-2020)", "(2025-Present)" — and nothing else. */
const TRAILING_YEAR = /^(.*?)\s*\((\d{4}(?:\s*[-–]\s*(?:\d{4}|Present))?)\)\s*$/i;

export function headingText(b: PTBlock): string {
  return (b.children ?? []).map((c) => c.text ?? "").join("");
}

export function parseHeadings(body: unknown): ParsedHeading[] {
  const blocks = Array.isArray(body) ? (body as PTBlock[]) : [];
  const out: ParsedHeading[] = [];

  for (const b of blocks) {
    if (b._type !== "block" || b.style !== "h2") continue;
    const text = headingText(b).trim();
    if (!text) continue;

    let rank: number | null = null;
    let title = "";
    let subtitle: string | undefined;

    const season = SEASON.exec(text);
    const numbered = NUMBERED.exec(text);

    if (season) {
      title = season[1].replace(/\s+/g, " ");
      subtitle = season[2].replace(/\s*\([^)]*\)\s*$/, "").trim() || undefined;
      rank = Number(/\d+/.exec(title)?.[0] ?? NaN);
      if (Number.isNaN(rank)) rank = null;
    } else if (numbered) {
      rank = Number(numbered[1]);
      title = numbered[2];
    } else {
      continue; // Not a ranked entry heading — intro and essay sections stay put.
    }

    let year: string | undefined;
    if (!season) {
      const withYear = TRAILING_YEAR.exec(title);
      if (withYear) {
        title = withYear[1].trim();
        year = withYear[2].replace(/\s*[-–]\s*/, "-");
      }
    }

    out.push({
      position: out.length + 1,
      rank,
      title: title.trim(),
      year,
      subtitle,
      anchor: slugify(text),
      heading: text,
    });
  }

  // Rank order when every heading carried one (articles count both 1→N and
  // N→1); document order otherwise.
  const allRanked = out.length > 0 && out.every((h) => h.rank !== null);
  if (allRanked) out.sort((a, b) => (a.rank as number) - (b.rank as number));
  return out;
}

/** Anchors already present anywhere in the block, so re-running adds only what is new. */
export function existingAnchors(tiers: Array<{ entries?: Array<{ anchor?: string }> }> | undefined): Set<string> {
  const s = new Set<string>();
  for (const t of tiers ?? []) for (const e of t.entries ?? []) if (e.anchor) s.add(e.anchor);
  return s;
}
