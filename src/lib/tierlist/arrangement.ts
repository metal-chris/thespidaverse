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
 */
export const TIER_COLORS: Record<string, string> = {
  S: "#E85A4F",
  A: "#E8944F",
  B: "#E8C94F",
  C: "#6FC46F",
  D: "#5FA8DC",
  E: "#4FC4B0",
  F: "#A66FC4",
};

export function tierColor(tier: TierRow): string {
  return tier.color || TIER_COLORS[tier.label] || "#8A8A8A";
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
