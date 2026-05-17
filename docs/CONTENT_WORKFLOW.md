# The Spidaverse — Content Workflow

## Weekly Cadence

| Day | Slot | Format / Series |
|-----|------|----------------|
| Monday | The Daily Bugle | `the-daily-bugle` |
| Wednesday | Long-Form (rotating) | `the-full-web` → `the-sinister-six` → `versus` (repeating) |
| Saturday | Cartoons & Cereal | series: `cartoons-and-cereal` |

**publish times (UTC):** Monday 13:00 · Wednesday 15:00 · Saturday 14:00

---

## Format Definitions

### `the-daily-bugle` — Monday
Quick-hit news, reactions, and cultural commentary. **300–800 words.** Fresh angle on what just dropped, what's trending, or what the discourse missed. Non-review: `webRating: 0`.

### `the-full-web` — Wednesday (rotation slot 1) or Saturday (Cartoons & Cereal deep dives)
Full-length review or essay. **1,500–2,500 words.** Single piece of media or cultural topic examined thoroughly. Set `webRating` when this is a review.

### `the-sinister-six` — Wednesday (rotation slot 2)
Ranked list or "six things" format. **1,000–1,800 words.** Six reasons, picks, or arguments anchored around a central thesis. Non-review: `webRating: 0`.

### `versus` — Wednesday (rotation slot 3)
Head-to-head comparison of two films, shows, games, albums, or cultural moments. **1,200–2,000 words.** Pick a winner. Non-review: `webRating: 0`.

### Cartoons & Cereal — Saturday
Anime and manga coverage. Always set `series: "cartoons-and-cereal"`. Choose the format that fits the piece:
- `first-bite` — premiere or first-three-episodes impression
- `the-full-web` — midseason or full-season review (set `webRating`)
- `spin-the-block` — revisit of an older title
- `one-year-later` — anniversary / retrospective

---

## Wednesday Rotation

The sequence cycles: **`the-full-web` → `the-sinister-six` → `versus` → repeat**.

To find the current position, look at the last three Wednesday entries in `CONTENT_SCHEDULE.md`.

---

## CategorySlug Reference

| Slug | Use for |
|------|---------|
| `anime` | Anime, manga |
| `movies` | Film |
| `tv` | Live-action TV / streaming |
| `video-games` | Games |
| `books` | Books, comics |
| `music` | Music, albums |
| `culture` | Cross-media cultural takes |
| `tech` | Tech, platform news |

---

## Poll Mapping — per-format defaults

Use these as starting poll questions. Adjust `questionText` to be article-specific.

### `the-daily-bugle`
```json
[
  {
    "questionKey": "seen_it",
    "questionText": "Have you seen / played / heard this yet?",
    "questionType": "yes_no"
  },
  {
    "questionKey": "hot_take",
    "questionText": "Is this the cultural moment of the week?",
    "questionType": "hot_take"
  }
]
```
`enableCommunityRating: false`

### `the-full-web` (review)
```json
[
  {
    "questionKey": "overall_rating",
    "questionText": "Rate it overall (1–10)",
    "questionType": "slider"
  },
  {
    "questionKey": "recommend",
    "questionText": "Would you recommend it?",
    "questionType": "yes_no"
  },
  {
    "questionKey": "verdict_check",
    "questionText": "The web rating is fair.",
    "questionType": "agree_scale"
  }
]
```
`enableCommunityRating: true`

### `the-sinister-six`
```json
[
  {
    "questionKey": "agree_ranking",
    "questionText": "Do you agree with this ranking?",
    "questionType": "agree_scale"
  },
  {
    "questionKey": "hot_take",
    "questionText": "This list is controversial.",
    "questionType": "hot_take"
  }
]
```
`enableCommunityRating: false`

### `versus`
```json
[
  {
    "questionKey": "winner",
    "questionText": "Which one wins?",
    "questionType": "this_or_that",
    "options": ["<Side A>", "<Side B>"]
  },
  {
    "questionKey": "convincing",
    "questionText": "How convincing was the case made?",
    "questionType": "agree_scale"
  },
  {
    "questionKey": "overall_quality",
    "questionText": "Rate this matchup (1–10)",
    "questionType": "slider"
  }
]
```
`enableCommunityRating: false`

### `cartoons-and-cereal`
```json
[
  {
    "questionKey": "watching",
    "questionText": "Are you watching / have you read this?",
    "questionType": "yes_no"
  },
  {
    "questionKey": "rating",
    "questionText": "Rate it (1–10)",
    "questionType": "slider"
  },
  {
    "questionKey": "continue",
    "questionText": "Will you keep up with it?",
    "questionType": "yes_no"
  }
]
```
`enableCommunityRating: true`

---

## Seed Script Naming

Each seed script covers a batch of scheduled article drafts. Name by the months spanned:

```
scripts/seed-articles-YYYY-MM-to-MM.ts   # e.g. 2026-05-to-06
scripts/seed-articles-YYYY-MM.ts         # if all articles fall in one month
```

Run with: `npx tsx scripts/seed-articles-<period>.ts`

Requires `.env.local` with `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `SANITY_WRITE_TOKEN`.
