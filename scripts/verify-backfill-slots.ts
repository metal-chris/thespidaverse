/**
 * Checks for backfill slot allocation.
 *
 * Case 1 is the bug this replaced: nine `the-daily-bugle` backfills must land
 * on nine DIFFERENT dates, not nine copies of 2026-03-30.
 *
 * Run: npx tsx scripts/verify-backfill-slots.ts
 */
import { readFileSync } from "fs";
import {
  BACKFILL_SLOTS,
  nextSlot,
  publishedAtFor,
  slotCapacity,
  type BackfillSlot,
} from "./lib/backfillSlots";

let pass = 0;
const failures: string[] = [];
const check = (name: string, cond: boolean, detail = "") => {
  if (cond) pass++;
  else failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/** Allocate n slots for a format, claiming each as we go. */
function allocate(format: string, n: number, claimed = new Set<string>()) {
  const out: (BackfillSlot | null)[] = [];
  for (let i = 0; i < n; i++) {
    const s = nextSlot(format, claimed);
    out.push(s);
    if (s) claimed.add(s.date);
  }
  return out;
}

/* 1. THE BUG: nine daily-bugle backfills, nine distinct dates. */
{
  const got = allocate("the-daily-bugle", 9);
  const filled = got.filter(Boolean) as BackfillSlot[];
  const dates = filled.map((s) => s.date);
  check("1a seven daily-bugle slots get filled", filled.length === 7, String(filled.length));
  check("1b every assigned date is distinct", new Set(dates).size === dates.length, dates.join(","));
  check("1c not all stamped 2026-03-30", new Set(dates).size > 1);
  check("1d the 8th and 9th are refused, not defaulted", got[7] === null && got[8] === null);
  check("1e newest first", dates[0] === "2026-05-11", dates[0]);
}

/* 2. the-full-web: exactly three, newest first, all distinct. */
{
  const got = allocate("the-full-web", 4).filter(Boolean) as BackfillSlot[];
  const dates = got.map((s) => s.date);
  check("2a three full-web slots", got.length === 3, String(got.length));
  check("2b distinct and newest-first",
    dates.join(",") === "2026-05-13,2026-04-22,2026-04-01", dates.join(","));
}

/* 3. A format with no slots is refused rather than silently defaulted —
      `first-bite` is what two open PRs actually use. */
{
  check("3 first-bite has no slots", nextSlot("first-bite", new Set()) === null);
}

/* 4. Already-claimed dates are skipped. */
{
  const claimed = new Set(["2026-05-11", "2026-05-04"]);
  const s = nextSlot("the-daily-bugle", claimed);
  check("4 skips claimed dates", s?.date === "2026-04-27", s?.date);
}

/* 5. Slot table integrity. */
{
  const dates = BACKFILL_SLOTS.map((s) => s.date);
  check("5a 20 slots", BACKFILL_SLOTS.length === 20, String(BACKFILL_SLOTS.length));
  check("5b dates unique", new Set(dates).size === 20);
  check("5c dates ascending", dates.join() === [...dates].sort().join());
  const caps = ["the-daily-bugle", "the-full-web", "cartoons-and-cereal", "the-sinister-six", "versus"]
    .map((f) => `${f}:${slotCapacity(f, new Set()).total}`);
  check("5d capacity per format",
    caps.join(" ") === "the-daily-bugle:7 the-full-web:3 cartoons-and-cereal:6 the-sinister-six:2 versus:2",
    caps.join(" "));
}

/* 6. House publish times, so no seed script hand-picks one. */
{
  const mon = BACKFILL_SLOTS.find((s) => s.day === "Mon")!;
  const wed = BACKFILL_SLOTS.find((s) => s.day === "Wed")!;
  const sat = BACKFILL_SLOTS.find((s) => s.day === "Sat")!;
  check("6 Mon 13:00 / Wed 15:00 / Sat 14:00",
    publishedAtFor(mon).endsWith("T13:00:00.000Z") &&
    publishedAtFor(wed).endsWith("T15:00:00.000Z") &&
    publishedAtFor(sat).endsWith("T14:00:00.000Z"));
}

/* 7. The table above must still match the document it was transcribed from,
      so the two cannot drift. */
{
  const md = readFileSync("docs/CONTENT_WORKFLOW.md", "utf8");
  const rows = [...md.matchAll(/^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(Mon|Wed|Sat)\s*\|\s*([a-z-]+)\s*\|/gm)]
    .map((m) => ({ date: m[1], day: m[2], format: m[3] }));
  check("7a document still lists 20 slots", rows.length === 20, String(rows.length));
  const same = rows.every((r, i) =>
    r.date === BACKFILL_SLOTS[i]?.date &&
    r.day === BACKFILL_SLOTS[i]?.day &&
    r.format === BACKFILL_SLOTS[i]?.format);
  check("7b code matches the document row for row", same);
}

if (failures.length) {
  console.error(`backfillSlots: ${failures.length} FAILED, ${pass} passed`);
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log(`backfillSlots: ${pass} checks passed (distinct dates, newest-first, refusal, doc parity)`);
