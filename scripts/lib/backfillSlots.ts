/**
 * Backfill slot allocation.
 *
 * The backfill calendar in docs/CONTENT_WORKFLOW.md defines 20 dated slots
 * between 2026-03-30 and 2026-05-13, each tied to a format. Every slot's
 * Status column still reads "Backfill" because nothing ever wrote to it — so
 * every generator run picked the same slot for a given format and hardcoded it
 * into its seed script. The result: 9 `the-daily-bugle` backfills all stamped
 * 2026-03-30 and 3 `the-full-web` backfills all stamped 2026-05-13, across 14
 * open PRs. Merging them would pile 11 articles onto one day.
 *
 * The fix is not a better Status column. It is to stop keeping the claim state
 * in a document a human has to remember to update, and derive it from what is
 * actually in Sanity. A slot is taken when a real article sits on it. That
 * cannot drift, and it self-heals if a draft is deleted.
 *
 * Ordering is newest-first, per the calendar's own guidance: filling
 * 2026-05-13 → 2026-03-30 populates the front page with recent-looking content
 * while older slots fill at a sustainable pace.
 */
import type { SanityClient } from "@sanity/client";

export interface BackfillSlot {
  /** YYYY-MM-DD, as written in the calendar. */
  date: string;
  day: "Mon" | "Wed" | "Sat";
  format: string;
}

/**
 * The calendar, transcribed from docs/CONTENT_WORKFLOW.md.
 *
 * Kept as data rather than parsed out of the markdown: the table is
 * hand-maintained prose with alignment padding, and a parser would fail
 * silently on a reformat. `verify-backfill-slots.ts` asserts this list still
 * matches the document.
 */
export const BACKFILL_SLOTS: readonly BackfillSlot[] = [
  { date: "2026-03-30", day: "Mon", format: "the-daily-bugle" },
  { date: "2026-04-01", day: "Wed", format: "the-full-web" },
  { date: "2026-04-04", day: "Sat", format: "cartoons-and-cereal" },
  { date: "2026-04-06", day: "Mon", format: "the-daily-bugle" },
  { date: "2026-04-08", day: "Wed", format: "the-sinister-six" },
  { date: "2026-04-11", day: "Sat", format: "cartoons-and-cereal" },
  { date: "2026-04-13", day: "Mon", format: "the-daily-bugle" },
  { date: "2026-04-15", day: "Wed", format: "versus" },
  { date: "2026-04-18", day: "Sat", format: "cartoons-and-cereal" },
  { date: "2026-04-20", day: "Mon", format: "the-daily-bugle" },
  { date: "2026-04-22", day: "Wed", format: "the-full-web" },
  { date: "2026-04-25", day: "Sat", format: "cartoons-and-cereal" },
  { date: "2026-04-27", day: "Mon", format: "the-daily-bugle" },
  { date: "2026-04-29", day: "Wed", format: "the-sinister-six" },
  { date: "2026-05-02", day: "Sat", format: "cartoons-and-cereal" },
  { date: "2026-05-04", day: "Mon", format: "the-daily-bugle" },
  { date: "2026-05-06", day: "Wed", format: "versus" },
  { date: "2026-05-09", day: "Sat", format: "cartoons-and-cereal" },
  { date: "2026-05-11", day: "Mon", format: "the-daily-bugle" },
  { date: "2026-05-13", day: "Wed", format: "the-full-web" },
] as const;

/** House publish times, so a seed script never hand-picks one. */
const TIME_BY_DAY: Record<BackfillSlot["day"], string> = {
  Mon: "13:00:00.000Z",
  Wed: "15:00:00.000Z",
  Sat: "14:00:00.000Z",
};

/** The `publishedAt` a slot should carry. */
export function publishedAtFor(slot: BackfillSlot): string {
  return `${slot.date}T${TIME_BY_DAY[slot.day]}`;
}

/**
 * Slot dates already occupied, read from Sanity.
 *
 * Counts drafts as well as published documents — a queued draft has reserved
 * its slot just as firmly as a live article, and ignoring drafts is exactly
 * how two scripts end up on the same date.
 */
export async function claimedSlotDates(client: SanityClient): Promise<Set<string>> {
  const dates = BACKFILL_SLOTS.map((s) => s.date);
  const rows = await client.fetch<Array<{ publishedAt?: string }>>(
    `*[_type == "article" && defined(publishedAt) && string::split(publishedAt, "T")[0] in $dates]{publishedAt}`,
    { dates }
  );
  return new Set(rows.map((r) => (r.publishedAt ?? "").slice(0, 10)).filter(Boolean));
}

/** The newest unclaimed slot for a format, or null when that format is full. */
export function nextSlot(format: string, claimed: ReadonlySet<string>): BackfillSlot | null {
  const open = BACKFILL_SLOTS.filter((s) => s.format === format && !claimed.has(s.date));
  if (!open.length) return null;
  // Newest first — the calendar's stated fill order.
  return open[open.length - 1];
}

/** How many slots a format has, total and still open. */
export function slotCapacity(format: string, claimed: ReadonlySet<string>) {
  const all = BACKFILL_SLOTS.filter((s) => s.format === format);
  return { total: all.length, open: all.filter((s) => !claimed.has(s.date)).length };
}

/**
 * Claim a slot for `format`, or throw with something actionable.
 *
 * Throwing beats falling back to a default date: a silent default is how every
 * one of these scripts ended up on 2026-03-30 in the first place.
 */
export async function assignBackfillSlot(
  client: SanityClient,
  format: string
): Promise<BackfillSlot> {
  const known = new Set(BACKFILL_SLOTS.map((s) => s.format));
  if (!known.has(format)) {
    throw new Error(
      `Format "${format}" has no backfill slots. The calendar allocates only: ` +
        `${[...known].sort().join(", ")}. Add slots to docs/CONTENT_WORKFLOW.md ` +
        `(and BACKFILL_SLOTS) before backfilling this format.`
    );
  }
  const claimed = await claimedSlotDates(client);
  const slot = nextSlot(format, claimed);
  if (!slot) {
    const { total } = slotCapacity(format, claimed);
    throw new Error(
      `All ${total} "${format}" backfill slots are taken. Either free one, or ` +
        `extend the calendar in docs/CONTENT_WORKFLOW.md and BACKFILL_SLOTS.`
    );
  }
  return slot;
}
