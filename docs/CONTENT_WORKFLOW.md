# Content Workflow

The publishing workflow for articles on The Spidaverse. Formalizes the intent encoded in [sanity/schemas/article.ts](../sanity/schemas/article.ts).

## Cadence

Three posts per week. Fixed days, fixed format slots.

| Day       | Slot          | Format                                                   | Typical length    |
| --------- | ------------- | -------------------------------------------------------- | ----------------- |
| Monday    | News beat     | `the-daily-bugle`                                        | 300–600 words     |
| Wednesday | Long-form     | Rotating: `the-full-web` → `the-sinister-six` → `versus` | 1,200–2,500 words |
| Saturday  | Weekly column | `cartoons-and-cereal` series                             | 600–1,200 words   |

Wednesday long-form rotates on a 3-week cycle so each format hits roughly once every 21 days. Saturday is reserved for the `cartoons-and-cereal` series (anime/manga); other media verticals go on Mon/Wed.

## Format roster

The schema defines 12 formats. The 3/week cadence uses 4 of them on a fixed schedule; the remaining 8 are **opportunistic slots** — drop them in for special occasions (release weeks, anniversaries, reactions to news) and bump or skip the fixed slot if scheduling collides.

### Fixed-cadence formats

- **`the-daily-bugle`** — News beat. Short reaction to a release, trailer, leak, casting, or industry move.
- **`the-full-web`** — Full review. Deep takes with web rating, mood, related media.
- **`the-sinister-six`** — Listicle of 6. Curated picks, rankings, hot takes in groups.
- **`versus`** — Comparison piece. Two works/characters/eras measured head-to-head.

### Opportunistic formats

- **`first-bite`** — Quick take / impression after the first chunk of a new thing.
- **`spin-the-block`** — Revisit. Going back to something old to see if it holds up.
- **`the-gauntlet`** — Marathon / challenge writeup (a full series binge, full discography, etc.).
- **`spida-sense`** — Hot take. Opinion-forward, intentionally contrarian or sharp.
- **`the-web-sling`** — Link roundup. What I read/watched/played this week from elsewhere.
- **`state-of-the-game`** — Industry/scene check-in. Where is anime / where is the MCU / etc.
- **`the-rotation`** — What's currently in heavy rotation. Companion to Currently Consuming, but as a written post.
- **`one-year-later`** — Retrospective. How does X land 12 months on?

## Series

`series` is the recurring-column field. Currently one series:

- **`cartoons-and-cereal`** — Saturday anime/manga column.

Adding a new series = add the slug to the `series` field options in [sanity/schemas/article.ts](../sanity/schemas/article.ts) and decide its weekday slot.

## Polls

Every post ships with engagement, set under `pollConfig` in Sanity.

### Community Web Rating

`enableCommunityRating: true` is the default and should stay on for any post with a `webRating`. Skip it only when the piece isn't review-shaped (e.g. a link roundup or news beat with no rating).

### Poll questions

Up to 3 questions per post. Keep it lightweight — 1 question is usually right. Choose the type that matches the post:

| Format               | Default poll type           | Example question                          |
| -------------------- | --------------------------- | ----------------------------------------- |
| `the-daily-bugle`    | `hot_take`                  | "How hyped are you about this?"           |
| `the-full-web`       | `yes_no` or `agree_scale`   | "Have you watched this?" / "Agree?"       |
| `the-sinister-six`   | `ranking` (3–5 items)       | "Rank these picks for yourself"           |
| `versus`             | `this_or_that` (exactly 2)  | Pick a side                               |
| `cartoons-and-cereal`| `yes_no` or `multiple_choice` | "Adding this to your list?"             |
| `spida-sense`        | `hot_take`                  | "How spicy is this take?"                 |
| `one-year-later`     | `agree_scale`               | "Does it still hit?"                      |

`questionKey` is machine-readable (snake_case, stable) — used for analytics. `questionText` is the reader-facing string. For `this_or_that` you must supply exactly 2 options; for `ranking` supply 3–5 items.

## Authoring workflow

1. **Pick the slot.** Open the calendar below. Confirm format + (if Saturday) series.
2. **Create the article** in Sanity Studio at `/studio`. Required: `title`, `slug`, `format`, `category`.
3. **Body.** Use heading levels H2/H3/H4, blockquotes, images with alt text. Drop `spoilerBlock` for any spoiler content. Drop `pullquote` for a featured line. If the post has zero spoilers, check `spoilerFree` (the schema will reject it if any `spoilerBlock` is present).
4. **Metadata.** Set `mediaType`, `tags`, `moodTags`, `webRating` (0–100, or 0 to disable the web viz), `readingTime`, `mediaLength`, `excerpt`, `heroImage` (with alt text), `relatedMedia`.
5. **Poll.** Set `pollConfig.enableCommunityRating` and add 1–3 questions per the table above.
6. **Schedule.** Set `publishedAt` to the target slot's date. Leave the draft unpublished until that date — or publish immediately if backdating into the gap (see Backfill below).
7. **Publish.** Verify the slug, hero image, and poll render on a staging build before publishing.

`publishedAt` is the source of truth for ordering AND surfacing on the site. GROQ list queries filter `coalesce(publishedAt, _createdAt) <= now()`, so a published article with a future `publishedAt` stays hidden until its date arrives. The detail route (`articleBySlugQuery`) intentionally does NOT filter, so direct URLs work for previewing a scheduled post before reveal.

## Backfill calendar (2026-03-30 → 2026-05-14)

The content schema was seeded on **2026-03-30**. As of today (**2026-05-14**) the cadence has not been honored, leaving **20 open slots**. Each row below is a slot to fill — backdate `publishedAt` to the listed date so the archive populates correctly.

Wednesday long-form rotation is `the-full-web` → `the-sinister-six` → `versus`, repeating.

| Date       | Day | Format             | Status    |
| ---------- | --- | ------------------ | --------- |
| 2026-03-30 | Mon | the-daily-bugle    | Drafted (seed-backfill-kyoani-sparks-of-tomorrow-animejapan-2026.ts) |
| 2026-04-01 | Wed | the-full-web       | Backfill  |
| 2026-04-04 | Sat | cartoons-and-cereal| Backfill  |
| 2026-04-06 | Mon | the-daily-bugle    | Backfill  |
| 2026-04-08 | Wed | the-sinister-six   | Backfill  |
| 2026-04-11 | Sat | cartoons-and-cereal| Backfill  |
| 2026-04-13 | Mon | the-daily-bugle    | Backfill  |
| 2026-04-15 | Wed | versus             | Backfill  |
| 2026-04-18 | Sat | cartoons-and-cereal| Backfill  |
| 2026-04-20 | Mon | the-daily-bugle    | Backfill  |
| 2026-04-22 | Wed | the-full-web       | Backfill  |
| 2026-04-25 | Sat | cartoons-and-cereal| Backfill  |
| 2026-04-27 | Mon | the-daily-bugle    | Backfill  |
| 2026-04-29 | Wed | the-sinister-six   | Backfill  |
| 2026-05-02 | Sat | cartoons-and-cereal| Backfill  |
| 2026-05-04 | Mon | the-daily-bugle    | Backfill  |
| 2026-05-06 | Wed | versus             | Backfill  |
| 2026-05-09 | Sat | cartoons-and-cereal| Backfill  |
| 2026-05-11 | Mon | the-daily-bugle    | Backfill  |
| 2026-05-13 | Wed | the-full-web       | Backfill  |

**Suggested backfill order:** newest first. Filling 2026-05-13 → 2026-03-30 means the front page populates immediately with recent-looking content while the older slots get filled at a sustainable pace.

**Realistic pace:** 2 backfill posts/week alongside 3 new live posts → ~10 weeks to clear. Drop opportunistic formats into the live cadence as filler if a Mon/Wed/Sat slot is hard to fill on time.

## Going forward (post-backfill)

Once the backfill is clear, the workflow runs forward only:

| Day       | Slot                                  |
| --------- | ------------------------------------- |
| Monday    | `the-daily-bugle` (news beat)         |
| Wednesday | Rotating long-form (full-web / sinister-six / versus) |
| Saturday  | `cartoons-and-cereal`                 |

Hold drafts in Sanity, set `publishedAt` to the slot date, publish on the day.

## Open items (not in scope here)

The schema does not currently encode:

- A `status` field (draft / scheduled / published) — relies on Sanity's built-in draft system + the `publishedAt <= now()` query filter for forward-scheduling.
- A `pubDay` field on `series` — the Saturday convention lives only in the field description string.
- A machine-readable format → weekday map.

If the cadence above proves durable, promote it to schema fields in a follow-up.
