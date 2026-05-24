# The Spidaverse Content Workflow

## Cadence

Three posts per week on a fixed schedule: **Monday, Wednesday, Saturday**.

| Day | Format | Series |
|-----|--------|--------|
| Monday | `the-daily-bugle` | — |
| Wednesday | rotating (see below) | — |
| Saturday | `first-bite` or `one-year-later` | `cartoons-and-cereal` |

### Wednesday Long-Form Rotation

The Wednesday slot cycles through three formats in strict order, resetting after every third Wednesday:

1. `the-full-web` — deep-dive essay or analysis (1500–2500 words)
2. `the-sinister-six` — ranked list of exactly six items (1200–2000 words)
3. `versus` — head-to-head comparison of two subjects (1200–1800 words)

### Saturday: Cartoons & Cereal

Always tagged `series: "cartoons-and-cereal"`. Covers anime, manga, and animated film.

- **New release / season premiere** → format `first-bite`
- **Anniversary revisit (≥1 year old)** → format `one-year-later`
- **Reassessment / changed opinion** → format `spin-the-block`

---

## Format Reference

| Format value | Title | Description | Target length |
|---|---|---|---|
| `the-daily-bugle` | The Daily Bugle | News commentary, cultural roundups, breaking stories | 5–8 min |
| `the-full-web` | The Full Web | Long-form essay, analysis, or deep dive | 10–15 min |
| `the-sinister-six` | The Sinister Six | Ranked list — exactly 6 items | 8–12 min |
| `versus` | Versus | Head-to-head comparison of two things | 8–10 min |
| `first-bite` | First Bite | New-release review or first impressions | 8–12 min |
| `one-year-later` | One Year Later | Anniversary revisit of an older work | 8–12 min |
| `spin-the-block` | Spin the Block | Reassessment — changing a previous take | 6–8 min |
| `spida-sense` | Spida Sense | Personal opinion / hot take | 4–6 min |
| `the-web-sling` | The Web Sling | Link roundup / quick hits | 4–6 min |
| `state-of-the-game` | State of the Game | Gaming-focused check-in or retrospective | 8–12 min |

---

## Poll Mapping

Default poll config by format. Override per article when the topic warrants it.

### `the-daily-bugle`
```json
{
  "enableCommunityRating": false,
  "pollQuestions": [
    { "questionKey": "follow_story", "questionText": "Are you following this story?", "questionType": "yes_no" }
  ]
}
```

### `the-full-web`
```json
{
  "enableCommunityRating": true,
  "pollQuestions": [
    { "questionKey": "agree_take", "questionText": "Do you agree with this take?", "questionType": "agree_scale" },
    { "questionKey": "topic_depth", "questionText": "How deep did this go?", "questionType": "slider" }
  ]
}
```

### `the-sinister-six`
```json
{
  "enableCommunityRating": false,
  "pollQuestions": [
    { "questionKey": "list_agree", "questionText": "Did we get the list right?", "questionType": "agree_scale" },
    { "questionKey": "snub", "questionText": "What got snubbed?", "questionType": "hot_take" }
  ]
}
```

### `versus`
```json
{
  "enableCommunityRating": false,
  "pollQuestions": [
    {
      "questionKey": "winner",
      "questionText": "Who wins?",
      "questionType": "this_or_that",
      "options": ["Side A", "Side B"]
    }
  ]
}
```
> Customize `questionText` and `options` to match each specific matchup.

### `cartoons-and-cereal` (all Saturday formats)
```json
{
  "enableCommunityRating": true,
  "pollQuestions": [
    { "questionKey": "have_you_watched", "questionText": "Have you watched/read this?", "questionType": "yes_no" },
    { "questionKey": "your_rating", "questionText": "Rate it yourself", "questionType": "slider" }
  ]
}
```

---

## Seed Scripts

Draft articles are materialized to Sanity using seed scripts in `scripts/`. Each file covers a named date window, e.g. `seed-articles-2026-05-to-06.ts`.

**To seed a batch:**
```bash
npx tsx scripts/seed-articles-<period>.ts
```

Requires `.env.local` with:
- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- `NEXT_PUBLIC_SANITY_DATASET` (defaults to `production`)
- `SANITY_WRITE_TOKEN`

Draft documents are created with `_id: drafts.scheduled-<slug>`. Publish them in Sanity Studio when ready.

---

## Horizon Policy

The **schedule-extension routine** fires Sunday morning and maintains a rolling 4-week horizon. Each run appends the next 3 slots to `docs/CONTENT_SCHEDULE.md` and creates a new seed script covering that date range.
