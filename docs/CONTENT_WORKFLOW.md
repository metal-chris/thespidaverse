# The Spidaverse — Content Workflow

## Cadence Rules

- **Monday 13:00 UTC** — Longform / opinion / review formats: First Bite, The Full Web, Versus, Spida Sense, One Year Later
- **Wednesday 15:00 UTC** — News / list / competitive formats: The Daily Bugle, The Sinister Six, The Gauntlet, State of the Game, The Web Sling
- **Saturday 14:00 UTC** — Culture / music / anime: The Rotation, Spin the Block, Cartoons & Cereal column

### Draft IDs

- **Forward schedule:** `drafts.scheduled-<slug>` (created by `scripts/seed-articles-<period>.ts`)
- **Backfill articles:** `drafts.backfill-<slug>` (created by `scripts/seed-backfill-<slug>.ts`)

Both land in the Sanity Drafts bucket. Set `publishedAt` explicitly to the slot date — Sanity uses `_createdAt` as fallback but we never rely on that for backfill.

### Running a Seed Script

```bash
# Ensure .env.local has NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_WRITE_TOKEN
npx tsx scripts/seed-backfill-<slug>.ts
```

The script resolves category slugs to Sanity document references at runtime. The named categories (`anime`, `movies`, `tv`, `video-games`, `music`, `culture`, `books`, `tech`) must already exist in Sanity Studio before running.

### Backfill Drain Routine

The weekly automated routine processes one slot per run:
1. Finds the **oldest** row still marked `Backfill` in the table below.
2. Researches the pop-culture window for that date.
3. Writes a real, dated article in Spida-Mane voice.
4. Creates `scripts/seed-backfill-<slug>.ts`.
5. Updates the row status to `Drafted (seed-backfill-<slug>.ts)`.
6. Opens a PR — user merges and runs the script locally.

---

## Backfill calendar (2026-03-30 → 2026-05-14)

20 missed slots from the gap period. Drain oldest-first.

| # | Date | Day | Time UTC | Format | Category | Status |
|---|------|-----|----------|--------|----------|--------|
| 1 | 2026-03-30 | Mon | 13:00 | first-bite | anime | Drafted (seed-backfill-steel-ball-run-first-bite.ts) |
| 2 | 2026-04-01 | Wed | 15:00 | the-daily-bugle | movies | Backfill |
| 3 | 2026-04-04 | Sat | 14:00 | the-rotation | music | Backfill |
| 4 | 2026-04-06 | Mon | 13:00 | the-full-web | tv | Backfill |
| 5 | 2026-04-08 | Wed | 15:00 | spida-sense | culture | Backfill |
| 6 | 2026-04-11 | Sat | 14:00 | spin-the-block | anime | Backfill |
| 7 | 2026-04-13 | Mon | 13:00 | first-bite | video-games | Backfill |
| 8 | 2026-04-15 | Wed | 15:00 | the-sinister-six | movies | Backfill |
| 9 | 2026-04-18 | Sat | 14:00 | the-web-sling | culture | Backfill |
| 10 | 2026-04-20 | Mon | 13:00 | versus | anime | Backfill |
| 11 | 2026-04-22 | Wed | 15:00 | state-of-the-game | video-games | Backfill |
| 12 | 2026-04-25 | Sat | 14:00 | one-year-later | movies | Backfill |
| 13 | 2026-04-27 | Mon | 13:00 | first-bite | tv | Backfill |
| 14 | 2026-04-29 | Wed | 15:00 | the-gauntlet | anime | Backfill |
| 15 | 2026-05-02 | Sat | 14:00 | the-full-web | music | Backfill |
| 16 | 2026-05-04 | Mon | 13:00 | spida-sense | movies | Backfill |
| 17 | 2026-05-06 | Wed | 15:00 | the-daily-bugle | culture | Backfill |
| 18 | 2026-05-09 | Sat | 14:00 | the-web-sling | video-games | Backfill |
| 19 | 2026-05-11 | Mon | 13:00 | first-bite | anime | Backfill |
| 20 | 2026-05-13 | Wed | 15:00 | the-rotation | music | Backfill |
