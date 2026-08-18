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
  keyToIndex: Map<string, number>
): string {
  return tiers
    .map((t) =>
      (arr[t._key] ?? [])
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
  items: FlatItem[]
): Arrangement | null {
  const groups = param.split("|");
  if (groups.length !== tiers.length) return null;

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
    arr[tiers[g]._key] = keys;
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
  const arr = tl ? decodeArrangement(tl, tiers, items) : null;
  return tiers.map((tier) => ({
    tier,
    entries: (arr ? (arr[tier._key] ?? []) : (tier.entries ?? []).map((e) => e._key))
      .map((k) => byKey.get(k))
      .filter((e): e is TierEntry => !!e),
  }));
}
