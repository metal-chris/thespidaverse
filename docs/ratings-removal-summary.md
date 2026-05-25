# Ratings Removal + Community Pivot — Summary

Date: 2026-05-25

## What changed

Two coordinated moves on the same day:

1. **Personal Web Rating** is no longer rendered on any reader-facing surface. The Sanity field, mock data, and TypeScript types stay intact — I keep my own scores internally as a private notebook.
2. **Web Rating pivoted to community-only.** The community slider no longer depends on whether I assigned a personal score; it runs on every review by default and can be opted out per article via `pollConfig.enableCommunityRating`. The public average only shows once **5 votes** are in — below that, the page tells you how many more are needed. The community number is not surfaced on cards, OG images, or list views — it lives on the article page next to the writing.
3. A new `/patch-notes` page documents the project's history in editorial voice; the May 25 entry covers both moves above.

## Files modified

| File | Change |
| --- | --- |
| [src/app/[locale]/articles/[slug]/ArticleBody.tsx](src/app/[locale]/articles/[slug]/ArticleBody.tsx) | Dropped personal `WebRating` block; removed unused `webRating` prop and `WebRatingStats` import |
| [src/app/[locale]/articles/[slug]/page.tsx](src/app/[locale]/articles/[slug]/page.tsx) | Removed `&rating=` from OG URL; removed `reviewJsonLd` import + emit; dropped `webRating` pass-through to `ArticleBody` |
| [src/app/api/og/route.tsx](src/app/api/og/route.tsx) | Removed `rating` searchParam read + rendered score block |
| [src/components/ui/Card.tsx](src/components/ui/Card.tsx) | Removed both rating-badge overlays (featured + standard); dropped `WebRating` import |
| [src/app/[locale]/collections/[slug]/page.tsx](src/app/[locale]/collections/[slug]/page.tsx) | Removed inline `WebRating` from `ArticleRow`; dropped import |
| [src/components/journal/JournalTimeline.tsx](src/components/journal/JournalTimeline.tsx) | Removed rating render in `DiaryCard`; dropped import + unused `isCompleted` |
| [src/components/engagement/EngagementSection.tsx](src/components/engagement/EngagementSection.tsx) | Dropped `authorWebRating` prop; community rating now gated only by `pollConfig.enableCommunityRating !== false` |
| [src/components/engagement/CommunityWebRating.tsx](src/components/engagement/CommunityWebRating.tsx) | Added 5-vote threshold before public average renders; label changed from "Community average" to "Web Rating"; below-threshold copy tells reader how many more votes are needed |
| [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) | Added Patch Notes link |
| [src/messages/{en,es,fr,ja,ko,pt}.json](src/messages/) | Added `footer.patchNotes`; rewrote `gadgetWebRatingTagline` and `webRatingDescription` to reflect audience-driven framing |

Field, type, schema, and engagement API/data layer intentionally untouched.

## Files created

| File | Purpose |
| --- | --- |
| [src/app/[locale]/patch-notes/page.tsx](src/app/[locale]/patch-notes/page.tsx) | New `/patch-notes` route |
| [src/lib/patch-notes/index.ts](src/lib/patch-notes/index.ts) | Frontmatter parser + minimal Markdown renderer + ordered loader (no new deps) |
| [content/patch-notes/*.md](content/patch-notes/) | 15 editorial entries |
| [docs/ratings-removal-audit.md](docs/ratings-removal-audit.md) | Phase 1 audit |
| [docs/ratings-removal-summary.md](docs/ratings-removal-summary.md) | This document |

## Patch Notes seeded (newest first)

| Version | Date | Title | Category |
| --- | --- | --- | --- |
| v2026.15 | 2026-05-25 | On ratings, and why ours belong to you now | Philosophy |
| v2026.14 | 2026-05-14 | A real editorial calendar | Site |
| v2026.13 | 2026-05-13 | Articles got their anatomy | Design |
| v2026.12 | 2026-04-05 | Three new ways to weigh in | Feature |
| v2026.11 | 2026-04-05 | Newsletter sunset | Site |
| v2026.10 | 2026-04-05 | The Spidaverse, in six languages | Feature |
| v2026.09 | 2026-04-02 | Currently Consuming, live | Feature |
| v2026.08 | 2026-04-01 | About page, rebuilt | Design |
| v2026.07 | 2026-03-30 | The Community Web Rating goes live | Feature |
| v2026.06 | 2026-03-30 | Eight categories, twelve formats | Site |
| v2026.05 | 2026-03-29 | The Web Rating, shipped | Feature |
| v2026.04 | 2026-03-25 | Theme transitions, in character | Design |
| v2026.03 | 2026-03-23 | The three suits, dialed in | Design |
| v2026.02 | 2026-03-21 | The Gallery opens | Series Launch |
| v2026.01 | 2026-03-18 | Launch day | Site |

Version numbers are computed at render time from `date + slug` rank.

## Verification performed (local dev server)

- `/patch-notes` returns 200 and renders all 15 entries in reverse-chronological order.
- Footer link to `/patch-notes` is present site-wide.
- A representative article page renders no personal `WebRating` SVG and emits no `Review` JSON-LD.
- OG image route ignores any incoming `rating` param.
- Community Web Rating slider renders on review pages without dependency on the author's personal rating.
- Below-threshold copy displays the correct "N more votes" affordance.
- Server logs and browser console: clean.

## Posts flagged for manual prose review

None in this repo. Mock fixture [src/lib/providers/mock/scenarios/edge-cases.scenario.ts](src/lib/providers/mock/scenarios/edge-cases.scenario.ts) contains a title "An Absolute Masterpiece — 100/100" — mock data, not user content, flagged for awareness.

Production article bodies in Sanity were not inspected — any author prose referencing a numeric personal score must be reviewed in Studio.

## Out-of-scope items intentionally left in place

- [src/lib/seo/jsonLd.ts](src/lib/seo/jsonLd.ts) — `reviewJsonLd()` helper no longer called but kept dormant in source.
- The `WebRating` component itself ([src/components/content/WebRating.tsx](src/components/content/WebRating.tsx)) is retained — the community slider uses the same spider-web shape.
- About-page `PhilosophyConsole` retains its `<WebRating score={100} variant="full" />` demo as a visual; the surrounding i18n copy now frames it correctly as audience-driven.

## No `TODO:` markers left in seeded entries.
