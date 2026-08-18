/**
 * Aggregating reader arrangements into "where readers put it".
 *
 * Phase 5 (docs/TIER_LIST_SPEC.md). Pure: it takes decoded arrangements and
 * returns counts and a consensus board, so the rules can be tested without a
 * database or a request.
 *
 * Kept out of arrangement.ts, which is the wire format shared by four
 * surfaces and must stay minimal and edge-safe.
 */
import { UNRANKED, type Arrangement } from "./arrangement";

/** Below this, an "aggregate" is one person's opinion plus noise. */
export const MIN_RESPONSES = 5;

/** entryKey → tierKey → how many readers put it there. */
export type PerEntry = Record<string, Record<string, number>>;

export interface PollAggregate {
  count: number;
  /** Stored codes that no longer decode, usually because an entry was removed. */
  undecodable: number;
  perEntry: PerEntry;
  /** entryKey → the tier the crowd settled on. Entries nobody placed are absent. */
  crowd: Record<string, string>;
  /** The crowd's board, ready for the same chart the author's ranking uses. */
  arrangement: Arrangement;
}

/**
 * Count placements. An entry left unranked is an abstention FOR THAT ENTRY,
 * not a vote — a reader who ranks three of twenty films should not be forced
 * into an opinion about the other seventeen.
 */
export function tallyPlacements(arrangements: Arrangement[]): PerEntry {
  const per: PerEntry = {};
  for (const arr of arrangements) {
    for (const [tierKey, entries] of Object.entries(arr)) {
      if (tierKey === UNRANKED) continue;
      for (const entryKey of entries) {
        (per[entryKey] ??= {})[tierKey] = ((per[entryKey] ?? {})[tierKey] ?? 0) + 1;
      }
    }
  }
  return per;
}

/**
 * The tier the crowd chose for one entry: the mode. Ties break toward the
 * placement closest to the median of all votes, so a genuine split lands
 * between the camps rather than at whichever tier sorts first; a remaining
 * tie breaks toward the higher tier.
 */
export function consensusTier(
  counts: Record<string, number>,
  tierOrder: string[]
): string | null {
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  if (!entries.length) return null;

  const max = Math.max(...entries.map(([, n]) => n));
  const tied = entries.filter(([, n]) => n === max).map(([k]) => k);
  if (tied.length === 1) return tied[0];

  const indexOf = (k: string) => {
    const i = tierOrder.indexOf(k);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };

  // Median index across every vote cast, not just the tied ones.
  const votes: number[] = [];
  for (const [k, n] of entries) for (let i = 0; i < n; i++) votes.push(indexOf(k));
  votes.sort((a, b) => a - b);
  const median = votes[Math.floor(votes.length / 2)];

  return tied
    .slice()
    .sort((a, b) => {
      const da = Math.abs(indexOf(a) - median);
      const db = Math.abs(indexOf(b) - median);
      return da !== db ? da - db : indexOf(a) - indexOf(b);
    })[0];
}

/**
 * Build the crowd's board. Within a tier, entries are ordered by how strongly
 * the crowd agreed, then by the author's own order, so a row is not arbitrary.
 */
export function aggregate(
  arrangements: Arrangement[],
  tierOrder: string[],
  canonicalOrder: string[],
  undecodable = 0
): PollAggregate {
  const perEntry = tallyPlacements(arrangements);
  const crowd: Record<string, string> = {};
  for (const [entryKey, counts] of Object.entries(perEntry)) {
    const tier = consensusTier(counts, tierOrder);
    if (tier) crowd[entryKey] = tier;
  }

  const arrangement: Arrangement = { [UNRANKED]: [] };
  for (const t of tierOrder) arrangement[t] = [];

  const rank = new Map(canonicalOrder.map((k, i) => [k, i]));
  const placed = Object.entries(crowd).sort(([ak, at], [bk, bt]) => {
    if (at !== bt) return tierOrder.indexOf(at) - tierOrder.indexOf(bt);
    const av = perEntry[ak][at] ?? 0;
    const bv = perEntry[bk][bt] ?? 0;
    if (av !== bv) return bv - av;
    return (rank.get(ak) ?? 0) - (rank.get(bk) ?? 0);
  });
  for (const [entryKey, tierKey] of placed) (arrangement[tierKey] ??= []).push(entryKey);

  for (const k of canonicalOrder) if (!crowd[k]) arrangement[UNRANKED].push(k);

  return { count: arrangements.length, undecodable, perEntry, crowd, arrangement };
}

/** How far the crowd moved an entry from where the author put it. */
export function crowdDelta(
  entryKey: string,
  crowd: Record<string, string>,
  authorTierOf: (key: string) => string | null,
  tierOrder: string[]
): { from: string; to: string; direction: "up" | "down" } | null {
  const to = crowd[entryKey];
  const from = authorTierOf(entryKey);
  if (!to || !from || to === from) return null;
  const di = tierOrder.indexOf(to) - tierOrder.indexOf(from);
  if (di === 0) return null;
  return { from, to, direction: di < 0 ? "up" : "down" };
}
