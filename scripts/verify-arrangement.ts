/**
 * Round-trip check for the tier-list wire format.
 *
 * `src/lib/tierlist/arrangement.ts` is shared by the Maker, the /r/ share
 * pages, the OG card renderer and /embed, and every already-shared link has
 * to keep decoding. There is no test runner in this repo, so this script is
 * the safety net for the one module that cannot afford to drift.
 *
 *   npx tsx scripts/verify-arrangement.ts
 *
 * Checks, over thousands of generated arrangements in both list types:
 *   encode → decode → encode  is the identity
 *   decode never invents, drops or duplicates an entry
 *   malformed input returns null rather than a broken board
 *   numbered ranks follow competition numbering (1,1,3…)
 */
import {
  UNRANKED,
  bucketOrder,
  decodeArrangement,
  encodeArrangement,
  numberedRanks,
  syntheticBucketKey,
  type Arrangement,
} from "../src/lib/tierlist/arrangement";
import type { TierRow, TierEntry } from "../src/types";

/* Deterministic PRNG, so a failure is reproducible. */
let seed = 0x5eed;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0x100000000);
const pick = <T,>(xs: T[]) => xs[Math.floor(rnd() * xs.length)];

function makeBlock(nTiers: number, nEntries: number) {
  const entries: TierEntry[] = Array.from({ length: nEntries }, (_, i) => ({
    _key: `e${i}`,
    title: `Entry ${i}`,
  })) as TierEntry[];
  const tiers: TierRow[] = Array.from({ length: nTiers }, (_, i) => ({
    _key: `t${i}`,
    label: String.fromCharCode(65 + i),
    entries: [],
  })) as TierRow[];
  // Deal every entry into the block so `flatten` sees them all.
  entries.forEach((e, i) => (tiers[i % nTiers].entries as TierEntry[]).push(e));
  const items = tiers.flatMap((t, ti) =>
    (t.entries ?? []).map((entry) => ({ entry, tier: t, index: 0 }))
  );
  items.forEach((it, i) => (it.index = i));
  const keyToIndex = new Map(items.map((it) => [it.entry._key, it.index]));
  return { tiers, items, keyToIndex };
}

function randomArrangement(order: string[], entryKeys: string[]): Arrangement {
  const arr: Arrangement = { [UNRANKED]: [] };
  for (const k of order) arr[k] = [];
  for (const key of entryKeys) {
    if (rnd() < 0.15) arr[UNRANKED].push(key);
    else arr[pick(order)].push(key);
  }
  return arr;
}

let checks = 0;
const failures: string[] = [];
const fail = (m: string) => failures.push(m);

/* ── tiers mode ─────────────────────────────────────────────── */
for (let round = 0; round < 1500; round++) {
  const nTiers = 2 + Math.floor(rnd() * 6);
  const nEntries = 1 + Math.floor(rnd() * 36);
  const { tiers, items, keyToIndex } = makeBlock(nTiers, nEntries);
  const order = tiers.map((t) => t._key);
  const arr = randomArrangement(order, items.map((i) => i.entry._key));

  const code = encodeArrangement(arr, tiers, keyToIndex);
  const decoded = decodeArrangement(code, tiers, items, "tiers");
  checks++;
  if (!decoded) { fail(`tiers: decode returned null for ${code}`); continue; }

  const again = encodeArrangement(decoded, tiers, keyToIndex);
  if (again !== code) fail(`tiers: not idempotent\n  ${code}\n  ${again}`);

  const placed = order.flatMap((k) => decoded[k] ?? []);
  const all = [...placed, ...(decoded[UNRANKED] ?? [])].sort();
  const want = items.map((i) => i.entry._key).sort();
  if (JSON.stringify(all) !== JSON.stringify(want)) fail(`tiers: entry set changed for ${code}`);
  if (new Set(placed).size !== placed.length) fail(`tiers: duplicate placement in ${code}`);
}

/* ── numbered mode, including reader-created buckets ────────── */
for (let round = 0; round < 1500; round++) {
  const nTiers = 1 + Math.floor(rnd() * 5);
  const nEntries = 1 + Math.floor(rnd() * 36);
  const { tiers, items, keyToIndex } = makeBlock(nTiers, nEntries);
  // Buckets beyond the block's own, as a reader splitting ties would create.
  const extra = Math.floor(rnd() * 4);
  const order = [
    ...tiers.map((t) => t._key),
    ...Array.from({ length: extra }, (_, i) => syntheticBucketKey(nTiers + i)),
  ];
  const arr = randomArrangement(order, items.map((i) => i.entry._key));

  const code = encodeArrangement(arr, tiers, keyToIndex, order);
  const decoded = decodeArrangement(code, tiers, items, "numbered");
  checks++;
  if (!decoded) { fail(`numbered: decode returned null for ${code}`); continue; }

  const decodedOrder = bucketOrder(decoded, tiers);
  const again = encodeArrangement(decoded, tiers, keyToIndex, decodedOrder);
  if (again !== code) fail(`numbered: not idempotent\n  ${code}\n  ${again}`);

  const placed = decodedOrder.flatMap((k) => decoded[k] ?? []);
  const all = [...placed, ...(decoded[UNRANKED] ?? [])].sort();
  if (JSON.stringify(all) !== JSON.stringify(items.map((i) => i.entry._key).sort()))
    fail(`numbered: entry set changed for ${code}`);

  // Competition numbering: ranks ascend, ties share, next rank skips.
  const ranks = numberedRanks(decoded, decodedOrder);
  let above = 0;
  for (const k of decodedOrder) {
    const b = decoded[k] ?? [];
    if (!b.length) continue;
    for (const e of b) if (ranks.get(e) !== above + 1) fail(`numbered: ${e} rank ${ranks.get(e)}, want ${above + 1}`);
    above += b.length;
  }
  for (const e of decoded[UNRANKED] ?? []) if (ranks.has(e)) fail(`numbered: unranked ${e} got a number`);
}

/* ── malformed input must fall back, never corrupt ──────────── */
{
  const { tiers, items } = makeBlock(3, 5);
  const bad: [string, string][] = [
    ["wrong group count", "0|1"],
    ["index out of range", "z||"],
    ["duplicate index", "00||"],
    ["non-base36", "!||"],
    ["duplicate across groups", "0|0|"],
  ];
  for (const [name, code] of bad) {
    checks++;
    if (decodeArrangement(code, tiers, items, "tiers") !== null) fail(`tiers: accepted ${name} (${code})`);
  }
  // Numbered drops only the count guard; the integrity guards stay.
  checks++;
  if (decodeArrangement("0|1", tiers, items, "numbered") === null) fail("numbered: rejected a legal short code");
  for (const [name, code] of bad.slice(1)) {
    checks++;
    if (decodeArrangement(code, tiers, items, "numbered") !== null) fail(`numbered: accepted ${name} (${code})`);
  }
}

/* ── the format's promise: old links keep working ───────────── */
{
  const { tiers, items } = makeBlock(6, 17);
  const legacy = "0123|456|789|ab|cd|efg";
  checks++;
  const d = decodeArrangement(legacy, tiers, items, "tiers");
  if (!d) fail("a code shared before this change no longer decodes");
}

if (failures.length) {
  console.error(`\n${failures.length} FAILURES of ${checks} checks\n`);
  for (const f of failures.slice(0, 10)) console.error("  " + f);
  process.exit(1);
}
console.log(`arrangement.ts: ${checks} checks passed (tiers + numbered round trips, guards, legacy code)`);
