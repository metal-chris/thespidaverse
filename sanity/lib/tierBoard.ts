/**
 * Moving an entry between tiers, as a pure function.
 *
 * Phase 3 / A8 (docs/TIER_LIST_SPEC.md). Studio's array form makes a
 * cross-tier move a matter of deleting from one collapsed list and
 * re-creating in another; this is the operation the reader Maker performs
 * with a drag, applied to the document instead of to an ephemeral
 * arrangement.
 *
 * The whole entry object moves, so its _key travels with it — and with the
 * _key, its anchor, capsule content, image and rating. Nothing is rebuilt,
 * so nothing is lost.
 */

export interface BoardEntry { _key?: string; [k: string]: unknown }
export interface BoardTier { _key?: string; label?: string; entries?: BoardEntry[]; [k: string]: unknown }

/**
 * Move `entryKey` into `toTierKey`, inserted before `beforeKey` when given
 * and appended otherwise. Returns the original array unchanged if the entry
 * or the target tier does not exist, or if the move is a no-op.
 */
export function moveEntry(
  tiers: BoardTier[],
  entryKey: string,
  toTierKey: string,
  beforeKey?: string
): BoardTier[] {
  if (entryKey === beforeKey) return tiers;
  if (!tiers.some((t) => t._key === toTierKey)) return tiers;

  let moved: BoardEntry | undefined;
  let fromTierKey: string | undefined;
  let fromIndex = -1;

  for (const t of tiers) {
    const i = (t.entries ?? []).findIndex((e) => e._key === entryKey);
    if (i !== -1) { moved = t.entries![i]; fromTierKey = t._key; fromIndex = i; break; }
  }
  if (!moved) return tiers;

  // Dropping an entry back where it already sits, with nothing between.
  if (fromTierKey === toTierKey && !beforeKey) {
    const list = tiers.find((t) => t._key === toTierKey)!.entries ?? [];
    if (fromIndex === list.length - 1) return tiers;
  }

  const stripped = tiers.map((t) => ({
    ...t,
    entries: (t.entries ?? []).filter((e) => e._key !== entryKey),
  }));

  // Only the first tier with this key receives it. Duplicate keys are
  // invalid (tierValidation warns), but appending to every match would
  // duplicate the entry rather than move it.
  let placed = false;
  return stripped.map((t) => {
    if (t._key !== toTierKey || placed) return t;
    placed = true;
    const entries = [...(t.entries ?? [])];
    const at = beforeKey ? entries.findIndex((e) => e._key === beforeKey) : -1;
    if (at === -1) entries.push(moved!);
    else entries.splice(at, 0, moved!);
    return { ...t, entries };
  });
}

/** Flat 1–N order across tiers — the index space the share code addresses. */
export function flatOrder(tiers: BoardTier[]): string[] {
  const out: string[] = [];
  for (const t of tiers) for (const e of t.entries ?? []) if (e._key) out.push(e._key);
  return out;
}
