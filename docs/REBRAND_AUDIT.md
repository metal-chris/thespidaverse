# Rebrand Audit — The Spidaverse

**Date:** 2026-07-31 · **Scope:** read-only audit, no code changed.
Covers: (1) promise language, (2) "Spida Mane" persona references, (3) avatar/image assets, (4) navigation, (5) tracking reality check.

> **Locale note:** All user-facing copy lives in six locale files — `src/messages/{en,ja,fr,ko,pt,es}.json` — with identical key structure and line numbers (±0–2). Every copy finding below exists **6×**, once per locale. Line numbers cited are from `en.json`.

---

## 1. Promise Language ("no tracking / no ads / no monetization")

### 1a. Home page — "What is The Spidaverse?" section
Rendered by `src/components/home/WhatIsSection.tsx`.

| File | Key / Line | Exact wording (en) |
|---|---|---|
| `src/messages/en.json` | `home.whatIs.intro` (L144) | "Most sites want your data. This one just wants to talk about movies, games, anime, books, and music. **No tracking, no ads, no strings attached.** Just the work." |
| `src/messages/ja.json` L144 | same key | 「…トラッキングなし、広告なし、裏も表もなし。ただ作品だけ。」 |
| `src/messages/fr.json` L144 | same key | "…Pas de tracking, pas de pubs, aucune contrepartie. Juste le travail." |
| `src/messages/ko.json` L144 | same key | "…추적도, 광고도, 조건도 없습니다. 오직 작품만." |
| `src/messages/pt.json` L144 | same key | "…Sem rastreamento, sem anúncios, sem pegadinhas. Só o trabalho." |
| `src/messages/es.json` L144 | same key | "…Sin rastreo, sin anuncios, sin condiciones. Solo el trabajo." |

### 1b. About page — "Principles" (Canon Event #004 / ClassifiedTerminal)
Rendered by `src/components/about/ClassifiedTerminal.tsx`. All six locales carry translations of each.

| Key (en.json line) | Title | Exact wording (en) |
|---|---|---|
| `about.principle1Title/Tooltip` (L205–206) | "Anonymous Reactions" | "We don't track who clicked what. No accounts, no profiles, no data harvesting. You felt something, you left a mark. That's it." |
| `about.principle2Title/Tooltip` (L207–208) | "Clean Sharing" | "Share links don't carry tracking parameters. No UTM codes, no referral IDs. Just the article. …" |
| `about.principle3Title/Tooltip` (L209–210) | "No Comments" | "…If you want to talk about it, that's what the Discord is for." *(community positioning — relevant to mdnght.world link)* |
| `about.principle5Title/Tooltip` (L213–214) | "No Sales" | "No merch store, no affiliate links, no sponsored content. The Spidaverse exists because it wants to, not because it has to." |
| `about.principle6Title/Tooltip` (L215–216) | "Pop Quiz" | "…Your vote is anonymous and the results are shared with everyone. It's not data collection. It's a conversation without the comment section." |

### 1c. Related non-commercial positioning
- `about.principle4Tooltip` (L211–212) — "Artist Credits … This site doesn't repost without attribution. Ever." (attribution promise, not monetization — likely keep).
- No dedicated privacy-policy or manifesto page exists; the About page's ClassifiedTerminal **is** the de-facto manifesto.
- No promise language found in meta descriptions, footer, or `docs/`.

---

## 2. Persona References — "Spida-Mane" / "Spida Mane" / "spida.mane"

### Copy (all 6 locale files, same keys/lines)
| Key | en.json line | Wording |
|---|---|---|
| `meta.description` | L38 | "…A pop culture blog by **Spida-Mane**." |
| `footer.copyright` | L86 | "© {year} **Spida-Mane**" |
| `about.quote7Speaker` | L176 | "Spida-Mane" (attributed quote on the About quote wall) |
| `about.terminalFooter` | L222 | "FILE CLOSED // **SPIDA-MANE** // 20XX" |

### Hardcoded in code (single-language, not localized)
| File:Line | Context |
|---|---|
| [layout.tsx:32](src/app/[locale]/layout.tsx:32) | Site-wide `<Metadata>` description: "…A pop culture blog by Spida-Mane." (also feeds OG/Twitter defaults) |
| [page.tsx:16](src/app/[locale]/about/page.tsx:16) | About page meta description: "About The Spidaverse and Spida-Mane. Pop culture analyst, web-slinger…" |
| [page.tsx:7](src/app/[locale]/coming-soon/page.tsx:7) | Coming-soon meta: "…Pop culture, reviews, and community from Spida-Mane." |
| [page.tsx:174](src/app/[locale]/collections/[slug]/page.tsx:174) | Visible byline: "Curated by Spida-Mane" |
| [IDCardHeader.tsx:57](src/components/about/IDCardHeader.tsx:57) | Avatar `alt="Spida-Mane"` |
| [IDCardHeader.tsx:120](src/components/about/IDCardHeader.tsx:120) | ID card name text: "SPIDA-MANE" |
| [jsonLd.ts:50](src/lib/seo/jsonLd.ts:50) | **JSON-LD** BlogPosting `author.name: "Spida-Mane"` (every article) |
| [jsonLd.ts:94](src/lib/seo/jsonLd.ts:94) | **JSON-LD** Review `author.name: "Spida-Mane"` |

### Handles / social identity
| File:Line | Context |
|---|---|
| [Footer.tsx:53](src/components/layout/Footer.tsx:53), [Footer.tsx:71](src/components/layout/Footer.tsx:71) | Discord handle `spida.mane` (copies to clipboard; tooltip "spida.mane copied!") |
| `footer.discord` key (en.json L93) | "Discord: spida.mane (click to copy)" — all locales |
| [ArsenalPanel.tsx:23–28](src/components/about/ArsenalPanel.tsx:23) | About "Suit Tech" platform card: Discord, handle `spida.mane`, `href: "#"`, clipboard copy. (YouTube/Twitch/Instagram taglines exist as i18n keys `about.platform*Tagline` but only Discord is currently wired.) |

### Docs (non-shipping)
- [CONTENT_SCHEDULE.md:59](docs/CONTENT_SCHEDULE.md:59) — "…hasn't been through a Spida Mane edit."

### Not persona, don't touch
- `spidaverse-access` cookie name ([middleware.ts:7](src/middleware.ts:7), [route.ts:4](src/app/api/early-access/route.ts:4)) — site name, not persona.
- Article format names ("Spida Sense" etc., en.json L77/L262) — brand vocabulary; decide separately whether format names survive the rebrand.
- **Sanity CMS content** (article bodies, author documents) is not in the repo — audit Studio content separately.

---

## 3. Avatar / Image Assets (Miles Morales PFP)

| Item | Location | Notes |
|---|---|---|
| **Asset file** | `public/images/spida-mane-avatar.jpg` | The only copy; only file in `public/images/` |
| **Sole code reference** | [IDCardHeader.tsx:56](src/components/about/IDCardHeader.tsx:56) | `<Image src="/images/spida-mane-avatar.jpg" alt="Spida-Mane" />` on the About ID card |
| Favicon | `public/favicon.svg` (wired in [layout.tsx:19](src/app/layout.tsx:19)) | Stylized spider emblem SVG — **not** the PFP, but is Spider-Man iconography; flag for rebrand decision. Same for `public/spider-cursor.svg`. |
| Manifest icon | `public/manifest.json` | Uses `/favicon.svg`; name "The Spidaverse", theme `#E82334` (Spidey red) |
| OG images | `src/app/api/og/route.tsx` | Dynamically generated; text "THE SPIDAVERSE", no avatar image embedded |
| Hardcoded external image URLs | none found | All content images come from Sanity CDN at runtime |

Also note: [IDCardHeader.tsx:26](src/components/about/IDCardHeader.tsx:26)+ contains an inline "Spider emblem SVG" used on the ID card, and `src/components/about/SpiderEmblemV3.tsx` procedurally draws a spider emblem.

---

## 4. Navigation

**Config-driven, single source of truth.** The nav is one hardcoded array in [Nav.tsx:8–17](src/components/layout/Nav.tsx:8): Home, About, Articles, Journal, Collections, The Web, Gallery, Patch Notes. `Header.tsx` renders `<Nav />` for desktop and `<Nav mobile />` for the mobile drawer — **one edit covers both**.

To add an external "Join the Community" → `https://mdnght.world` link:
- Add an entry to the `links` array in `Nav.tsx` (plus a `nav.community` key in all 6 `src/messages/*.json`). Caveat: entries render via the i18n `<Link>` from `@/i18n/navigation`, which is built for internal locale-prefixed routes — an external URL needs a plain `<a target="_blank">` branch (or a separate element after the `links.map`). The active-state logic (`pathname.startsWith`) also doesn't apply to external links.
- Icon convention: lucide-react icons (e.g. `Users` or `ExternalLink`); desktop shows icon-first with label expanding on hover/active.
- **Footer** ([Footer.tsx:78–136](src/components/layout/Footer.tsx:78)) is a secondary placement: currently brand link, Patch Notes, Discord copy-button, copyright, transitions toggle. A community link would fit next to the Discord button (which the "No Comments" principle already points to — see §1b).

---

## 5. Tracking Reality Check

### ✅ Clean — no third-party analytics
- **No analytics/tracking scripts**: no gtag, GTM, Plausible, Umami, Fathom, PostHog, Mixpanel, Segment, Hotjar, Clarity, Facebook Pixel, or Vercel Analytics anywhere in `src/`, `package.json`, `next.config`, or `netlify.toml`.
- **No page-view tracking** of any kind (no view counters, no visit logging).
- Only inline `<script>` tags are the theme-flash preventer ([layout.tsx:23](src/app/layout.tsx:23)) and JSON-LD structured data on article/story pages.
- Fonts are self-hosted (`public/fonts/`) — no Google Fonts beacon.
- Share links are genuinely clean (no UTM params) — principle 2 is truthful.
- Pagefind search is static/client-side — no search-query beacon.

### ⚠️ Flag — first-party data that borders the promise wording
| Item | Where | Assessment |
|---|---|---|
| **IP hashing for engagement dedup** | `src/lib/engagement/fingerprint.ts` — `hashIP()` (unsalted SHA-256 of client IP) used by `/api/reactions/[slug]`, `/api/engagement/web-rating/[slug]`, `/api/engagement/poll/[slug]`; stored in Supabase | The "Anonymous Reactions" tooltip says "we don't track who clicked what." A per-IP hash per article/reaction is stored to prevent double-voting. Defensible as anonymization, but an **unsalted** SHA-256 of an IPv4 is trivially reversible by brute force. If the rebrand keeps the privacy claims, consider salting/HMAC-ing, or soften wording to "no accounts, no profiles, votes deduplicated by a one-way hash." |
| **Admin "Analytics" dashboard** | `src/app/admin/analytics/*`, `/api/admin/analytics`, env var `NEXT_PUBLIC_ANALYTICS_PASSWORD` | Aggregates only web-rating scores and poll answers from Supabase — engagement stats, not visitor tracking. Truthful, but the label "Analytics" and the env var name could read badly against "no tracking" copy if ever surfaced. Low priority. |
| **Early-access cookie** | `spidaverse-access` first-party cookie ([middleware.ts](src/middleware.ts), [early-access route](src/app/api/early-access/route.ts)) | Functional gate cookie, not tracking. Fine. |
| **Third-party gallery embeds** | `src/components/gallery/VideoEmbed.tsx` (YouTube, TikTok, Instagram iframes), `GalleryDetailView.tsx` (Instagram embed) | **These do load third-party trackers** when a gallery visitor views an embedded video. This is the strongest contradiction of "no tracking" in the codebase. Options: switch YouTube to `youtube-nocookie.com`, use click-to-load facades, or scope the promise copy to "we add no tracking." |
| **Supabase** | reactions/ratings/polls/gallery-submissions backend | Third-party infrastructure, not a tracker. Gallery submissions accept an optional email (`gallery.email` key). Fine. |

*(Buttondown newsletter noted in project memory is no longer present — no `/api/newsletter` route or Buttondown reference exists in `src/`.)*

---

## Summary Table — Files Needing Changes

| File | §1 Promise | §2 Persona | §3 Avatar | §4 Nav | §5 Tracking | Notes |
|---|:--:|:--:|:--:|:--:|:--:|---|
| `src/messages/en.json` | ✔ | ✔ | | ✔ | | intro L144; principles L205–216; persona L38/86/176/222; new `nav.community` key |
| `src/messages/ja.json` | ✔ | ✔ | | ✔ | | same keys |
| `src/messages/fr.json` | ✔ | ✔ | | ✔ | | same keys |
| `src/messages/ko.json` | ✔ | ✔ | | ✔ | | same keys |
| `src/messages/pt.json` | ✔ | ✔ | | ✔ | | same keys |
| `src/messages/es.json` | ✔ | ✔ | | ✔ | | same keys |
| `src/app/[locale]/layout.tsx` | | ✔ | | | | meta description L32 |
| `src/app/[locale]/about/page.tsx` | | ✔ | | | | meta description L16 |
| `src/app/[locale]/coming-soon/page.tsx` | | ✔ | | | | meta description L7 |
| `src/app/[locale]/collections/[slug]/page.tsx` | | ✔ | | | | "Curated by Spida-Mane" L174 |
| `src/lib/seo/jsonLd.ts` | | ✔ | | | | author name L50, L94 |
| `src/components/about/IDCardHeader.tsx` | | ✔ | ✔ | | | avatar src/alt L56–57, name L120 |
| `public/images/spida-mane-avatar.jpg` | | | ✔ | | | replace/rename asset |
| `src/components/layout/Footer.tsx` | | ✔ | | ✔ | | Discord handle L53/71; community link placement |
| `src/components/about/ArsenalPanel.tsx` | | ✔ | | | | Discord platform card L20–37 |
| `src/components/layout/Nav.tsx` | | | | ✔ | | add external community link L8–17 |
| `src/components/gallery/VideoEmbed.tsx` | | | | | ⚠ | third-party embeds vs. "no tracking" |
| `src/components/gallery/GalleryDetailView.tsx` | | | | | ⚠ | Instagram embed |
| `src/lib/engagement/fingerprint.ts` | | | | | ⚠ | unsalted IP hash vs. promise wording |
| `public/favicon.svg`, `public/spider-cursor.svg`, `public/manifest.json` | | | ⚠ | | | Spider iconography — rebrand decision |
| `docs/CONTENT_SCHEDULE.md` | | ✔ | | | | internal doc, low priority |
| Sanity Studio content | ✔? | ✔? | ✔? | | | not in repo — audit CMS documents separately |
