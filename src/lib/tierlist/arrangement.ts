import type { TierEntry, TierListBlock, TierRow } from "@/types";

/**
 * The tier-list arrangement wire format, extracted from TierMaker so every
 * surface that speaks it — the Maker itself, the /r/ share pages, the
 * /api/og/tierlist card renderer, the /embed route — decodes against ONE
 * implementation instead of three copies that drift.
 *
 * The format: `?tl=` (or the /r/<tl> path segment) is base-36 entry indices
 * grouped by tier, groups joined with `|`. Indices address the block's
 * canonical flat order, so adding an entry later leaves old links valid — the
 * new entry simply arrives unranked. Single base-36 chars cap a block at 36
 * entries, which the Maker inherited as a hard limit; nothing here may
 * "improve" that without breaking every link already shared.
 *
 * No React, no Sanity client, no Node APIs — this module must run on the edge
 * runtime (the OG image route) exactly as it runs in the browser.
 */

export const UNRANKED = "_";

/**
 * Two shapes share this format.
 *
 * `tiers` — the classic S/A/B chart. Groups map one-to-one onto the block's
 * tiers, so the count must match exactly.
 *
 * `numbered` — an ordered 1, 2, 3… list where the block's `tiers` are
 * BUCKETS: everything in a bucket ties, and a bucket's rank is one more than
 * the number of entries above it. Bucket count is free, because a reader
 * splitting a tie creates one, so the count guard is dropped and groups past
 * the block's own buckets get positional keys.
 *
 * The block's `listType` says which rules apply; nothing is encoded in the
 * string. Documented consequence: flipping a published list from tiers to
 * numbered reinterprets codes already shared against it — S/A/B become 1st,
 * 4th, 9th. That is a re-authoring decision, not an accident waiting to
 * happen, and it is the reason the switch lives in Studio rather than the UI.
 */
export type { TierListType } from "@/types";
import type { TierListType } from "@/types";

/**
 * Upper bound on buckets in a numbered code. Entries cap at 36 (one base-36
 * character each), so no meaningful list needs more; this only stops a
 * hand-edited URL from asking for millions of empty groups.
 */
export const MAX_BUCKETS = 64;

/** Bucket key for a group with no matching tier. Positional and stable. */
export function syntheticBucketKey(index: number): string {
  return `b${index}`;
}

export type Arrangement = Record<string, string[]>;

export interface FlatItem {
  entry: TierEntry;
  tier: TierRow;
  index: number;
}

/** Canonical flat order — the index space the URL encodes against. */
export function flatten(tiers: TierRow[]): FlatItem[] {
  const out: FlatItem[] = [];
  for (const tier of tiers) {
    for (const entry of tier.entries ?? []) {
      out.push({ entry, tier, index: out.length });
    }
  }
  return out;
}

export function canonicalArrangement(tiers: TierRow[]): Arrangement {
  const a: Arrangement = { [UNRANKED]: [] };
  for (const tier of tiers) {
    a[tier._key] = (tier.entries ?? []).map((e) => e._key);
  }
  return a;
}

export function encodeArrangement(
  arr: Arrangement,
  tiers: TierRow[],
  keyToIndex: Map<string, number>,
  /**
   * Bucket keys in display order. Defaults to the block's own tiers, which is
   * every `tiers`-mode list; numbered lists pass their live bucket order so a
   * reader-created bucket survives the round trip.
   */
  order?: string[]
): string {
  return (order ?? tiers.map((t) => t._key))
    .map((key) =>
      (arr[key] ?? [])
        .map((k) => keyToIndex.get(k))
        .filter((i): i is number => i !== undefined)
        .map((i) => i.toString(36))
        .join("")
    )
    .join("|");
}

/**
 * Decode defensively: a hand-edited or stale link must never throw or produce
 * a board with duplicated/missing chips. Anything unparseable falls back to
 * the author's ranking (null); anything simply absent lands unranked.
 */
export function decodeArrangement(
  param: string,
  tiers: TierRow[],
  items: FlatItem[],
  listType: TierListType = "tiers"
): Arrangement | null {
  const groups = param.split("|");
  const numbered = listType === "numbered";
  // A tiers list has exactly as many groups as the chart has rows. A numbered
  // list may have any number, because splitting a tie adds a bucket and empty
  // buckets are legal — a one-entry list with four buckets is a perfectly
  // ordinary thing for a reader to build. Only an absolute cap applies, well
  // past the 36 entries the single-character index space allows, so the input
  // is still bounded without second-guessing the shape.
  if (!numbered && groups.length !== tiers.length) return null;
  if (numbered && groups.length > MAX_BUCKETS) return null;

  const arr: Arrangement = { [UNRANKED]: [] };
  const seen = new Set<number>();

  for (let g = 0; g < groups.length; g++) {
    const keys: string[] = [];
    for (const ch of groups[g]) {
      const idx = parseInt(ch, 36);
      if (Number.isNaN(idx) || idx < 0 || idx >= items.length || seen.has(idx)) return null;
      seen.add(idx);
      keys.push(items[idx].entry._key);
    }
    arr[tiers[g]?._key ?? syntheticBucketKey(g)] = keys;
  }
  // Entries added to the block after the link was made.
  arr[UNRANKED] = items.filter((it) => !seen.has(it.index)).map((it) => it.entry._key);
  return arr;
}

/**
 * The classic tier ramp. Fixed rather than theme-derived on purpose: this is
 * recognizable tier-list iconography, and it must render identically in the
 * site's three themes AND in contexts that have no theme at all (OG images,
 * embeds). Schema `color` overrides per tier.
 *
 * Grade modifiers are first-class. The ramp used to know exactly seven labels
 * and drop everything else to grey with no warning; the first list that used
 * a "B+" row shipped grey between orange and yellow until someone noticed on
 * the page and hand-set a hex. A ± grade is not a custom label, it is the
 * ramp's own vocabulary, so it must never need an override.
 *
 * Every entry is an explicit literal rather than computed at runtime: an
 * author reading this file sees exactly what "A-" is. The ± values were
 * derived once (sRGB lerp, one third of the way toward the neighbouring
 * grade; S+ and F- extrapolate outward the same distance) and pasted.
 * Free-form labels ("Untouchable", "Skip") still fall to grey and are the
 * case a Studio warning should catch.
 */
export const TIER_COLORS: Record<string, string> = {
  "S+": "#E8474F",
  S: "#E85A4F",
  "S-": "#E86D4F",
  "A+": "#E8814F",
  A: "#E8944F",
  "A-": "#E8A64F",
  "B+": "#E8B74F",
  B: "#E8C94F",
  "B-": "#C0C75A",
  "C+": "#97C664",
  C: "#6FC46F",
  "C-": "#6ABB93",
  "D+": "#64B1B8",
  D: "#5FA8DC",
  "D-": "#5AB1CD",
  "E+": "#54BBBF",
  E: "#4FC4B0",
  "E-": "#6CA8B7",
  "F+": "#898BBD",
  F: "#A66FC4",
  "F-": "#C353CB",
};

export const TIER_FALLBACK_COLOR = "#8A8A8A";

/** Labels are matched case-insensitively and ignoring surrounding whitespace, so
 *  "b+" and " B+ " both resolve; the ramp is a vocabulary, not a spelling test. */
export function rampColor(label: string | undefined): string | undefined {
  return label ? TIER_COLORS[label.trim().toUpperCase()] : undefined;
}

export function tierColor(tier: TierRow): string {
  return tier.color || rampColor(tier.label) || TIER_FALLBACK_COLOR;
}

/**
 * Apply a decoded arrangement back onto tier rows, producing display rows in
 * the visitor's order (used by the OG card and any static rendering of a
 * shared ranking). Unranked entries are dropped — a share card shows what was
 * placed, not the leftovers.
 */
export function arrangedRows(
  block: TierListBlock,
  tl: string | null | undefined
): { tier: TierRow; entries: TierEntry[] }[] {
  const tiers = block.tiers ?? [];
  const items = flatten(tiers);
  const byKey = new Map(items.map((it) => [it.entry._key, it.entry]));
  const arr = tl ? decodeArrangement(tl, tiers, items, block.listType ?? "tiers") : null;
  return tiers.map((tier) => ({
    tier,
    entries: (arr ? (arr[tier._key] ?? []) : (tier.entries ?? []).map((e) => e._key))
      .map((k) => byKey.get(k))
      .filter((e): e is TierEntry => !!e),
  }));
}

/**
 * Numbered mode: what number each entry wears.
 *
 * A bucket's rank is one more than the number of entries above it, so a
 * two-entry first bucket is a tie for 1st and the bucket after it is 3rd —
 * the convention every sports table and leaderboard already uses. Entries in
 * the same bucket share a number.
 */
export function numberedRanks(arr: Arrangement, order: string[]): Map<string, number> {
  const ranks = new Map<string, number>();
  let above = 0;
  for (const key of order) {
    const bucket = arr[key] ?? [];
    if (!bucket.length) continue;
    const rank = above + 1;
    for (const entryKey of bucket) ranks.set(entryKey, rank);
    above += bucket.length;
  }
  return ranks;
}

/** Bucket keys in display order for an arrangement, block buckets first. */
export function bucketOrder(arr: Arrangement, tiers: TierRow[]): string[] {
  const fromBlock = tiers.map((t) => t._key);
  const extra = Object.keys(arr).filter(
    (k) => k !== UNRANKED && !fromBlock.includes(k)
  );
  extra.sort();
  return [...fromBlock, ...extra];
}
