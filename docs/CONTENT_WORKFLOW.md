# Content Workflow — The Spidaverse

## Publishing Cadence

Three posts per week on a fixed schedule:

| Day       | UTC Publish Time | Typical Format Rotation                          |
|-----------|-----------------|--------------------------------------------------|
| Monday    | 13:00           | first-bite / the-full-web / versus / state-of-the-game / spin-the-block |
| Wednesday | 15:00           | the-daily-bugle / spida-sense / the-sinister-six / the-gauntlet / one-year-later |
| Saturday  | 14:00           | the-rotation / first-bite / the-web-sling (Cartoons & Cereal series) |

## Format Reference

| Format key           | What it is                                      |
|----------------------|-------------------------------------------------|
| `first-bite`         | First-look / initial review                     |
| `the-full-web`       | Full deep-dive review                           |
| `spin-the-block`     | Revisit / rewatch take                          |
| `the-sinister-six`   | Ranked list (exactly 6 picks)                   |
| `the-gauntlet`       | Head-to-head bracket / ranking battle           |
| `versus`             | Direct comparison of two things                 |
| `the-daily-bugle`    | News commentary / hot take on a headline        |
| `spida-sense`        | Opinion / hot take / think-piece                |
| `the-web-sling`      | Quick-hit roundup of several things             |
| `state-of-the-game`  | Gaming coverage / review                        |
| `the-rotation`       | Music / playlist / soundtrack breakdown         |
| `one-year-later`     | Anniversary retrospective                       |

## Seed Script Conventions

- **Draft `_id` prefix** — forward-scheduled articles: `drafts.scheduled-<slug>`
- **Draft `_id` prefix** — backfill articles: `drafts.backfill-<slug>`
- Canonical script shape: `scripts/seed-articles-2026-05-to-06.ts`
- Category lookup: scripts query Sanity by `slug.current` to resolve the `_ref`
- Run a seed script: `npx tsx scripts/seed-backfill-<slug>.ts`

## Backfill Calendar (2026-03-30 → 2026-05-14)

> **20 missed slots** from the content gap. Drain oldest-first, one slot per weekly run.
> Status transitions: `Backfill` → `Drafted (see scripts/seed-backfill-<slug>.ts)`

| # | Date       | Day | UTC   | Format             | Category      | Series               | Status |
|---|------------|-----|-------|--------------------|---------------|----------------------|--------|
| 1 | 2026-03-30 | Mon | 13:00 | first-bite         | movies        | —                    | Drafted (see scripts/seed-backfill-project-hail-mary.ts) |
| 2 | 2026-04-01 | Wed | 15:00 | the-daily-bugle    | culture       | —                    | Backfill |
| 3 | 2026-04-04 | Sat | 14:00 | the-rotation       | anime         | cartoons-and-cereal  | Backfill |
| 4 | 2026-04-06 | Mon | 13:00 | the-full-web       | tv            | —                    | Backfill |
| 5 | 2026-04-08 | Wed | 15:00 | spida-sense        | culture       | —                    | Backfill |
| 6 | 2026-04-11 | Sat | 14:00 | first-bite         | anime         | cartoons-and-cereal  | Backfill |
| 7 | 2026-04-13 | Mon | 13:00 | versus             | movies        | —                    | Backfill |
| 8 | 2026-04-15 | Wed | 15:00 | spin-the-block     | tv            | —                    | Backfill |
| 9 | 2026-04-18 | Sat | 14:00 | the-web-sling      | anime         | cartoons-and-cereal  | Backfill |
|10 | 2026-04-20 | Mon | 13:00 | state-of-the-game  | video-games   | —                    | Backfill |
|11 | 2026-04-22 | Wed | 15:00 | the-sinister-six   | movies        | —                    | Backfill |
|12 | 2026-04-25 | Sat | 14:00 | the-gauntlet       | anime         | cartoons-and-cereal  | Backfill |
|13 | 2026-04-27 | Mon | 13:00 | the-full-web       | tv            | —                    | Backfill |
|14 | 2026-04-29 | Wed | 15:00 | spida-sense        | culture       | —                    | Backfill |
|15 | 2026-05-02 | Sat | 14:00 | first-bite         | anime         | cartoons-and-cereal  | Backfill |
|16 | 2026-05-04 | Mon | 13:00 | versus             | movies        | —                    | Backfill |
|17 | 2026-05-06 | Wed | 15:00 | the-daily-bugle    | tech          | —                    | Backfill |
|18 | 2026-05-09 | Sat | 14:00 | the-rotation       | anime         | cartoons-and-cereal  | Backfill |
|19 | 2026-05-11 | Mon | 13:00 | spin-the-block     | tv            | —                    | Backfill |
|20 | 2026-05-13 | Wed | 15:00 | one-year-later     | culture       | —                    | Backfill |
