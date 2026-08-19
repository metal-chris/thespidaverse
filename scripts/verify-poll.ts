/**
 * Checks for the tier-list poll's aggregation rules.
 *
 * The numbered path exists because aggregating a numbered list by bucket key
 * records disagreement that never happened — case 1 below is the whole reason
 * the rank-space aggregator was written, and it fails against the tiers-mode
 * aggregator by construction.
 *
 * Run: npx tsx scripts/verify-poll.ts
 */
import {
  bucketOrder,
  canonicalArrangement,
  flatten,
  numberedRanks,
  UNRANKED,
  type Arrangement,
} from "../src/lib/tierlist/arrangement";
import { aggregate, aggregateNumbered } from "../src/lib/tierlist/poll";
import type { TierRow } from "../src/types";

let pass = 0;
const failures: string[] = [];
function check(name: string, cond: boolean, detail = "") {
  if (cond) pass++;
  else failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
}

/** A numbered block: n entries, each in its own bucket. */
function block(n: number): TierRow[] {
  return Array.from({ length: n }, (_, i) => ({
    _key: `b${i}`,
    label: String(i + 1),
    entries: [{ _key: `e${i}`, title: `Entry ${i + 1}` }],
  })) as TierRow[];
}

/** Build an arrangement from groups of entry indices, e.g. [[0,1],[2]]. */
function arr(groups: number[][]): Arrangement {
  const a: Arrangement = { [UNRANKED]: [] };
  groups.forEach((g, i) => {
    a[`b${i}`] = g.map((x) => `e${x}`);
  });
  return a;
}

const ranksOf = (a: Arrangement, tiers: TierRow[]) => numberedRanks(a, bucketOrder(a, tiers));

/* 1. The bug this replaced: same rank, different tie shape.
      Two readers both put Entry 3 third. One ties the top two, one does not.
      By bucket key that reads as disagreement; by rank it is unanimous. */
{
  const tiers = block(3);
  const strict = arr([[0], [1], [2]]);
  const tied = arr([[0, 1], [2]]);

  const byKey = aggregate(
    [strict, tied],
    tiers.map((t) => t._key),
    ["e0", "e1", "e2"]
  );
  const spread = Object.keys(byKey.perEntry.e2 ?? {}).length;
  check("1a bucket-key aggregation splits an agreed rank", spread === 2, `saw ${spread} buckets for e2`);

  const byRank = aggregateNumbered(
    [ranksOf(strict, tiers), ranksOf(tied, tiers)],
    ["e0", "e1", "e2"]
  );
  check("1b rank aggregation sees the agreement", JSON.stringify(byRank.perEntryRanks.e2) === "[3,3]",
    JSON.stringify(byRank.perEntryRanks.e2));
  check("1c crowd puts e2 third", byRank.crowdRank.e2 === 3, String(byRank.crowdRank.e2));
}

/* 2. Competition numbering: two entries tied at 1 make the next 3. */
{
  const tiers = block(3);
  const a = arr([[0, 1], [2]]);
  const g = aggregateNumbered([ranksOf(a, tiers), ranksOf(a, tiers)], ["e0", "e1", "e2"]);
  check("2 tie at 1 → next is 3",
    g.crowdRank.e0 === 1 && g.crowdRank.e1 === 1 && g.crowdRank.e2 === 3,
    JSON.stringify(g.crowdRank));
}

/* 3. Median resists one outlier. Four readers say 1st, one says 5th. */
{
  const tiers = block(5);
  const top = arr([[0], [1], [2], [3], [4]]);
  const dumped = arr([[1], [2], [3], [4], [0]]);
  const g = aggregateNumbered(
    [top, top, top, top, dumped].map((a) => ranksOf(a, tiers)),
    ["e0", "e1", "e2", "e3", "e4"]
  );
  check("3 one outlier does not move the median", g.crowdRank.e0 === 1, String(g.crowdRank.e0));
}

/* 4. A reader-created bucket. The block has 2 buckets, the reader uses 3 —
      synthetic keys the block never had. Rank space does not care. */
{
  const tiers = block(2);
  const spread: Arrangement = { [UNRANKED]: [], b0: ["e0"], b1: [], b2: ["e1"] };
  const ranks = ranksOf(spread, tiers);
  check("4a synthetic bucket still yields a rank", ranks.get("e1") === 2, String(ranks.get("e1")));
  const g = aggregateNumbered([ranks], ["e0", "e1"]);
  check("4b and lands in the crowd board", g.crowdRank.e1 === 2, JSON.stringify(g.crowdRank));
}

/* 5. Unranked is an abstention for that entry, not a vote. */
{
  const tiers = block(3);
  const partial: Arrangement = { [UNRANKED]: ["e2"], b0: ["e0"], b1: ["e1"] };
  const g = aggregateNumbered([ranksOf(partial, tiers)], ["e0", "e1", "e2"]);
  check("5a abstained entry is absent from the crowd", g.crowdRank.e2 === undefined);
  check("5b and casts no vote", (g.votes.e2 ?? 0) === 0);
  check("5c others still counted", g.votes.e0 === 1 && g.crowdRank.e0 === 1);
}

/* 6. Regression: the tiers path is untouched. */
{
  const tiers = [
    { _key: "tl-s", label: "S", entries: [{ _key: "e0", title: "A" }] },
    { _key: "tl-a", label: "A", entries: [{ _key: "e1", title: "B" }] },
  ] as TierRow[];
  const canon = canonicalArrangement(tiers);
  const moved: Arrangement = { [UNRANKED]: [], "tl-s": ["e0", "e1"], "tl-a": [] };
  const g = aggregate([canon, moved, moved], ["tl-s", "tl-a"], ["e0", "e1"]);
  check("6a crowd follows the majority", g.crowd.e1 === "tl-s", g.crowd.e1);
  check("6b unmoved entry stays", g.crowd.e0 === "tl-s", g.crowd.e0);
  check("6c count is the number of arrangements", g.count === 3, String(g.count));
}

/* 7. Ghibli's real shape: 24 entries, 24 buckets, one reader ties the top two.
      Everything below the tie keeps the rank both readers actually gave it. */
{
  const tiers = block(24);
  const strict = arr(Array.from({ length: 24 }, (_, i) => [i]));
  const tied = arr([[0, 1], ...Array.from({ length: 22 }, (_, i) => [i + 2])]);
  const g = aggregateNumbered(
    [ranksOf(strict, tiers), ranksOf(tied, tiers)],
    Array.from({ length: 24 }, (_, i) => `e${i}`)
  );
  check("7a e2 agreed at 3", JSON.stringify(g.perEntryRanks.e2) === "[3,3]", JSON.stringify(g.perEntryRanks.e2));
  check("7b last entry agreed at 24", JSON.stringify(g.perEntryRanks.e23) === "[24,24]", JSON.stringify(g.perEntryRanks.e23));
  check("7c every entry ranked", Object.keys(g.crowdRank).length === 24, String(Object.keys(g.crowdRank).length));
}

if (failures.length) {
  console.error(`poll.ts: ${failures.length} FAILED, ${pass} passed`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`poll.ts: ${pass} checks passed (rank-space aggregation, ties, outliers, abstentions, tiers regression)`);
