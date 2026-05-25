# Ratings Removal — Audit

Captured 2026-05-25, before any code changes.

## Goal

Hide the personal Web Rating from every reader-facing surface while preserving the underlying data in the schema. The Community Web Rating (audience-driven) remains the only visible score on review pages. Personal ratings remain editable through existing Sanity authoring.

## 1. Personal-rating render sites (to hide)

| File | Line(s) | Surface | Variant |
| --- | --- | --- | --- |
| [src/app/[locale]/articles/[slug]/ArticleBody.tsx](src/app/[locale]/articles/[slug]/ArticleBody.tsx:47) | 47–56 | Article detail — large block above body | `WebRating` `variant="full"` |
| [src/components/ui/Card.tsx](src/components/ui/Card.tsx:146) | 146–150 | Featured article card overlay | `WebRating` `variant="badge"` |
| [src/components/ui/Card.tsx](src/components/ui/Card.tsx:234) | 234–238 | Standard article card overlay | `WebRating` `variant="badge"` |
| [src/app/[locale]/collections/[slug]/page.tsx](src/app/[locale]/collections/[slug]/page.tsx:233) | 233–236 | Collection list row | `WebRating` `variant="inline"` |
| [src/components/journal/JournalTimeline.tsx](src/components/journal/JournalTimeline.tsx:408) | 408–414 | Media diary entry row | `WebRating` `variant="inline"` + numeric fallback |
| [src/app/[locale]/articles/[slug]/page.tsx](src/app/[locale]/articles/[slug]/page.tsx:97) | 97 | Article OG image URL — `&rating=` query param | meta |
| [src/app/api/og/route.tsx](src/app/api/og/route.tsx:10) | 10, 100–121 | Rendered into OG image bottom-left | meta |
| [src/app/[locale]/articles/[slug]/page.tsx](src/app/[locale]/articles/[slug]/page.tsx:202) | 202–216 | `Review` JSON-LD with `ratingValue` | structured data |

## 2. Community-rating render sites (preserve unchanged)

| File | Purpose |
| --- | --- |
| [src/components/engagement/CommunityWebRating.tsx](src/components/engagement/CommunityWebRating.tsx) | Slider + results UI — audience-driven |
| [src/components/engagement/EngagementSection.tsx](src/components/engagement/EngagementSection.tsx:36) | Gates whether community rating renders. Currently keyed on `authorWebRating > 0` (data still exists, so this keeps working). |
| [src/components/content/WebRating.tsx](src/components/content/WebRating.tsx) | `WebRating` component itself stays in the repo. Personal-rating call sites are removed; community teaser inside the component is unaffected. |

## 3. Schema / data — keep intact

| Schema | Field | Notes |
| --- | --- | --- |
| [sanity/schemas/article.ts](sanity/schemas/article.ts:249) | `webRating` (number, 0–100) | Kept. Still editable in Sanity Studio. |
| [sanity/schemas/mediaDiary.ts](sanity/schemas/mediaDiary.ts) | `rating` (number) | Kept. Still editable. |
| [src/types/index.ts](src/types/index.ts:57) | `Article.webRating?: number` | Kept on the type. |

Mock providers (`src/lib/providers/mock/scenarios/*`) keep their rating values — they exercise the data path even when not rendered.

## 4. Listings, sorts, filters

No reader-facing UI currently sorts or filters by personal rating. Search, category, and archive pages are unaffected.

## 5. Metadata surfaces actually exposed today

- **OG image URL** — `rating` query param added in [src/app/[locale]/articles/[slug]/page.tsx:97](src/app/[locale]/articles/[slug]/page.tsx:97). To remove.
- **OG image render** — score painted bottom-left in [src/app/api/og/route.tsx](src/app/api/og/route.tsx). To remove.
- **JSON-LD `Review` schema** — emitted conditionally when `article.webRating != null` in [src/app/[locale]/articles/[slug]/page.tsx:202](src/app/[locale]/articles/[slug]/page.tsx:202). The `reviewJsonLd()` helper in [src/lib/seo/jsonLd.ts](src/lib/seo/jsonLd.ts:64) is unused after removal but left in place to keep the diff narrow.

No sitemap, RSS, or admin-panel rating exposure exists. No new metadata surfaces are introduced by this change.

## 6. Inline prose flagged for human review

Searches across mock article bodies and Sanity content found **no review prose** of the form "I gave this an 8" / "score of N" / "rated it X". One mock title is structurally numeric:

- [src/lib/providers/mock/scenarios/edge-cases.scenario.ts](src/lib/providers/mock/scenarios/edge-cases.scenario.ts) — title "An Absolute Masterpiece — 100/100". Mock fixture only; not user-authored prose. Flagged but not modified.

Production article bodies live in Sanity and are not present in this repo, so any author prose referencing a numeric score must be reviewed in Studio by a human. **No prose was modified.**

## 7. Out of scope (flagged, not touched)

- **About page philosophy demo** — [src/components/about/PhilosophyConsole.tsx:19](src/components/about/PhilosophyConsole.tsx) hard-codes `score={100}` as an educational demonstration of the Web Rating system. Removing it would require an editorial rewrite of the About page, which is out of scope for this change. The component remains; if the About page is later updated to reflect the new philosophy, the demo should be revisited.
- **`reviewJsonLd()` helper** — kept in [src/lib/seo/jsonLd.ts](src/lib/seo/jsonLd.ts:64). The call site is removed; the helper is left dormant rather than deleted.

## 8. Patch Notes — content pattern

The repo currently sources article content from Sanity (no MDX loader is wired up). The new `/patch-notes` page will use Markdown files in [content/patch-notes/](content/patch-notes/) with `gray-matter` for frontmatter — already a transitive dependency via Next. This keeps editorial changelog entries version-controlled in git alongside the code that ships them, which matches the "patch notes" framing better than a CMS document.

## 9. Navigation surfaces to extend

- [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) — add Patch Notes link. Primary destination.
- [src/components/layout/Nav.tsx](src/components/layout/Nav.tsx) — primary nav already runs six items wide. Patch Notes does not earn a top-line nav slot; footer-only is the right placement.
