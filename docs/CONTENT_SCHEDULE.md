# Content Schedule — 2026-05-16 → 2026-06-17

Forward-scheduled article slots for the next four weeks. Workflow is defined in [CONTENT_WORKFLOW.md](./CONTENT_WORKFLOW.md). Backfill (2026-03-30 → 2026-05-14) is tracked separately.

## Status

The original 12 slots (through 2026-06-10) have **unpublished drafts in Sanity Studio**. The 3 new slots (2026-06-13 → 2026-06-17) are added by `scripts/seed-articles-2026-06-to-07.ts` — run `npx tsx scripts/seed-articles-2026-06-to-07.ts` locally to materialize those drafts. Each draft holds title, slug, format, full body, polls, mood tags, web rating, and `publishedAt` set to the slot date. Drafts will not appear on the live site until manually published.

Drafts live at `_id = drafts.scheduled-<slug>`. Open them in Studio at `/studio` under **Articles**.

## Schedule

| Date       | Day | Format               | Title                                                              | Category    | Poll type        |
| ---------- | --- | -------------------- | ------------------------------------------------------------------ | ----------- | ---------------- |
| 2026-05-16 | Sat | cartoons-and-cereal  | Dandadan S2 Is Already Eating                                      | Anime       | multiple_choice  |
| 2026-05-18 | Mon | the-daily-bugle      | Switch 2 Just Crossed 20 Million / Joy-Con Pricing                 | Video Games | hot_take         |
| 2026-05-20 | Wed | the-sinister-six     | 2026's Best Game Soundtracks (So Far)                              | Music       | ranking          |
| 2026-05-23 | Sat | cartoons-and-cereal  | I Finally Finished Vinland Saga                                    | Anime       | yes_no           |
| 2026-05-25 | Mon | the-daily-bugle      | Beyond the Spider-Verse Trailer Reaction                           | Movies      | hot_take         |
| 2026-05-27 | Wed | versus               | Arcane vs. The Last of Us                                          | TV          | this_or_that     |
| 2026-05-30 | Sat | cartoons-and-cereal  | Chainsaw Man: Reze Arc                                             | Anime       | yes_no           |
| 2026-06-01 | Mon | the-daily-bugle      | Star Wars: Starfighter — Ryan Gosling Cast                         | Movies      | hot_take         |
| 2026-06-03 | Wed | the-full-web         | GTA 6, Six Months In                                               | Video Games | agree_scale      |
| 2026-06-06 | Sat | cartoons-and-cereal  | Solo Leveling S3 Premiere                                          | Anime       | yes_no           |
| 2026-06-08 | Mon | the-daily-bugle      | Summer 2026 Anime: 3 Shows                                         | Anime       | multiple_choice  |
| 2026-06-10 | Wed | the-sinister-six     | Best Spider-Man Stories Across Every Medium                        | Culture     | ranking          |
| 2026-06-13 | Sat | cartoons-and-cereal  | Shangri-La Frontier S2 Hit Netflix and I've Already Lost a Weekend | Anime       | multiple_choice  |
| 2026-06-15 | Mon | the-daily-bugle      | They Announced a Persona Live-Action TV Show and I Have Feelings About This | TV | hot_take    |
| 2026-06-17 | Wed | versus               | Versus: Frieren vs. Mushishi — Which Slow Fantasy Actually Hits Harder? | Anime  | this_or_that     |

Wednesday long-form rotation continues `the-sinister-six` → `versus` → `the-full-web` → `the-sinister-six` from the backfill's last entry (`the-full-web` on 2026-05-13).

## Publishing each slot

1. Open the draft in Studio (`/studio` → Articles → find the scheduled-`<slug>` entry).
2. Edit pass: voice check, fact check, hero image, any spoiler blocks if needed.
3. Hit **Publish**. The article will stay hidden on lists/feeds/graph until its `publishedAt` arrives — see "How forward-scheduling works" below.

### How forward-scheduling works

Article list queries in [src/lib/sanity/queries.ts](../src/lib/sanity/queries.ts) now filter on `coalesce(publishedAt, _createdAt) <= now()`. That means:

- A **published article with a future `publishedAt`** is hidden from the homepage, category pages, tag pages, mood pages, and the web graph until the date arrives. Then it surfaces automatically — no day-of action needed.
- The **direct article URL stays open** (`articleBySlugQuery` does *not* filter). This is intentional: you can share a preview link to a future-scheduled article before its reveal date.
- Drafts in Sanity (unpublished) are never visible publicly at all, by either route.

This means you can **batch-publish all 12 drafts after editing** — the site will reveal each one on its own date. Or you can leave them as drafts and publish day-of. Either workflow works.

## Regenerating / extending the schedule

The original seed script is at [scripts/seed-articles-2026-05-to-06.ts](../scripts/seed-articles-2026-05-to-06.ts). The extension covering 2026-06-13 → 2026-06-17 is at [scripts/seed-articles-2026-06-to-07.ts](../scripts/seed-articles-2026-06-to-07.ts). Both are **idempotent** (`createOrReplace`). Use `--dry` to preview without writing.

To extend the schedule past 2026-06-17:

1. Copy the script to a new dated filename (e.g. `seed-articles-2026-06b-to-07.ts`).
2. Continue the Wed rotation: after 2026-06-17 (versus), the next Wed is `the-full-web` → `the-sinister-six` → `versus` → ...
3. Keep Mon = `the-daily-bugle`, Sat = `cartoons-and-cereal`.
4. Update slug, `publishedAt`, and draft `_id` per article.

## Voice + draft quality note

These drafts were generated programmatically and **need a voice pass before publishing**. Topics are real and the structure follows the workflow doc, but the prose hasn't been through a Spida Mane edit. Treat each slot as a strong scaffold, not a finished post.
