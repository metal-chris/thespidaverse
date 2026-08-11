# Source Tooltip — Spec

Hover/tap card on body links that surfaces full context for a source — publication,
date, type, context, and media — so readers can judge a citation without
leaving the page.

**Status: BUILT** (Aug 2026), for both `article` and `story`, with markdown
authoring. Interactive mocks accompany this doc (artifact: "Source Tooltip —
Design Spec") and remain the visual source of truth.

### What shipped

| Piece | Where |
|-------|-------|
| Shared `link` annotation (11 optional fields, collapsed fieldset) | `sanity/schemas/objects/sourceLink.ts`, imported by `article.ts` + `story.ts` |
| Card component, scroll rail, spoiler cover, bottom sheet | `src/components/content/SourceLink.tsx` |
| Mark serializer wiring | `src/components/content/PortableTextComponents.tsx` |
| Citation counting (`Cited N×`) | `SourceCitationsProvider`, mounted in `ArticleBody.tsx` + `StoryBody.tsx` |
| Link + rail styling | `src/app/globals.css` (`.source-link`, `.source-scroll`, `.source-rail-dot`) |
| Messages, 6 locales | `src/messages/{en,es,fr,ja,ko,pt}.json` → `source.*` |
| Markdown authoring | `scripts/convert-to-sanity.ts` — `extractSourceDefs()` + `[text][^key]` |
| og: hydration | `scripts/hydrate-sources.ts` — fills `name`/`title`/`date`, `--images` uploads `og:image` |
| Positioning | `@floating-ui/react` ^0.27 |
| Local fixtures | `happy-path.scenario.ts` (`source`, `sourceSpoiler`, `link` marks), `DATA_PROVIDER=mock` |

### Markdown syntax (authored)

```markdown
Cretton [told Feige he wasn't the right fit][^cretton].

[^cretton]: https://example.com/interview
  name: ComicBasics
  title: Why he turned down Doomsday
  type: interview          # reporting|interview|review|data|primary|reference
  date: 2026-08-04
  access: paywalled        # free|metered|paywalled
  archive: https://web.archive.org/…
  credit: Art: @handle
  duration: 2:38
  spoiler: true
  image: image-abc123-1200x630-jpg   # written by a future hydrate-sources.ts
  context: Wrapped continuation lines
    are folded into one paragraph.
```

Several links may share one key; that is what `Cited N×` counts. Unknown `type`
and `access` values are dropped with a warning. An undefined `[^key]` degrades
to plain text with a warning. Definition blocks are stripped from the prose.

### Verified

Production build compiles; `tsc --noEmit` clean. Converter output is
byte-identical to its pre-change baseline across all 55 existing articles, so no
back-catalog drift. In-browser against mock data: dotted underline overrides the
`prose` rule, `target=_blank` + `rel="noopener noreferrer"`, `role="tooltip"`,
`aria-describedby` resolving, keyboard Tab opens the card, Escape dismisses,
rail dot tracks 0%→100%, spoiler cover reveals to fully readable text, and the
bottom sheet interpolates the host into its CTA while the card footer drops the
duplicate open link.

---

## 1. What already exists

`marks.link` in [`PortableTextComponents.tsx:88`](../src/components/content/PortableTextComponents.tsx)
already detects external links, sets `target="_blank"` + `rel="noopener noreferrer"`,
and applies the `spidey-sense-hover` treatment. **"Opens in a new tab" is done.**
The work is the card.

The link annotation is a single `href` field in **two** schemas:

| Schema | Line |
|--------|------|
| `sanity/schemas/article.ts` | 151–164 |
| `sanity/schemas/story.ts` | 71 |

Infrastructure already in place:

- **Portal precedent** — [`SwingHomeLink.tsx`](../src/components/content/SwingHomeLink.tsx)
  (`createPortal` + `mounted` guard for SSR).
- **Theming is free** — card colors come from `--color-card` / `--color-border` /
  `--color-muted-foreground` / `--color-accent`. All three themes — **Miles**
  (default `:root`, black/red), **Peter** (red ground, blue accent), **Venom**
  (black/white) — redefine them, so the card themes itself. Note Miles sets *no*
  `data-theme` attribute; it is the `:root` fallback.
- **og: hydration precedent** — [`hydrate-gallery.ts`](../../Projects/Spidaverse/scripts/hydrate-gallery.ts)
  already fetches og:image from source URLs and uploads to Sanity. v2's media
  support is this exact pattern pointed at citations.
- `PortableTextComponents.tsx` is already `"use client"`.

---

## 2. Schema changes (v2)

Add to the `link` annotation in **both** article.ts and story.ts. Everything is
optional — every existing link keeps working untouched and renders no card.
Enrich only what you care about.

### Authored fields

| Field | Type | Purpose |
|-------|------|---------|
| `sourceName` | string | Publication or creator. "Deadline", "@gc50art" |
| `sourceTitle` | string | Headline of the cited piece. Hydratable from og:title |
| `context` | text | Why this source is cited and what it says. **No practical length limit** — the card body scrolls past ~6 lines (§4.3) |
| `sourceDate` | date | When the source published |
| `sourceType` | string list | `reporting` \| `interview` \| `review` \| `data` \| `primary` \| `reference` — drives icon + label |
| `sourceImage` | image (hotspot) | og:image, cover art, poster, or a frame. Hydratable |
| `duration` | string | For video sources: "2:38". Renders on the play affordance |
| `access` | string list | `free` \| `metered` \| `paywalled` — renders a chip so readers aren't surprised |
| `archiveUrl` | url | Wayback snapshot. Link-rot insurance for a long-lived blog |
| `spoilerSource` | boolean | The *citation itself* is a spoiler (e.g. "ending explained" pieces). Card context renders blurred until tapped, reusing the house spoiler pattern |
| `artistCredit` | string | For art/photo sources: attribution line under the image, mirroring the gallery pipeline's `artistName` culture |

### Derived at render (never authored)

| Value | From |
|-------|------|
| Hostname | `href` — the anti-phishing signal, always shown |
| Media kind | `href` matches YouTube/Vimeo → video (play affordance); otherwise image if `sourceImage` set |
| Image aspect → layout slot | Sanity stores asset dimensions. Landscape ≥ 3:2 → full-width **banner** slot; roughly square → **side** slot; portrait (comic covers, posters) → **side** slot at 2:3. No aspect field to author |
| "Cited N×" | Walk the body's markDefs once, group by `href`. Shown when N > 1 |

Also add `preview.select` on the annotation so Studio's annotation list shows
`sourceName` instead of a generic "Link" row.

---

## 3. The authoring problem (unchanged, still load-bearing)

Articles are markdown → `convert-to-sanity.ts` → Sanity, and the converter emits
only `href` ([line 239](../../Projects/Spidaverse/scripts/convert-to-sanity.ts)).
Studio-only enrichment is **wiped by the next `createOrReplace` import**.

- **Option A — Studio-only.** Zero converter work; lost on re-import. A trap.
- **Option B — markdown footnote syntax** the converter reads. Survives re-import;
  source of truth stays in markdown. Moderate converter work.
- **Option C — `hydrate-sources.ts`** fetching og:site_name / og:title /
  og:image / article:published_time, modeled on hydrate-gallery.ts. Machine
  fills `sourceName`, `sourceTitle`, `sourceDate`, `sourceImage`; you write
  `context`.

**Recommendation: B + C.** B for the judgment fields, C for the fetchable ones.
With v2's media, C earns its keep — image hydration by hand is the tedious part.

---

## 4. Rendering

### 4.1 Component

`src/components/content/SourceLink.tsx`, consumed by `marks.link`. Card renders
only when enrichment exists (`context || sourceName || sourceImage`). Plain links
stay plain.

### 4.2 Media slots

Aspect decides the slot; the slot decides the layout. No authored choice.

| Media | Slot | Treatment |
|-------|------|-----------|
| Landscape image (og:image, stills) | **Banner** — full card width, top | Reserved aspect box before load (no card jump), lazy, hotspot crop |
| Video (YouTube/Vimeo href) | **Banner** + play affordance | Thumbnail + centered play glyph + `duration` chip. **Never an iframe in the tooltip** — heavy, layout-shifting, and a focus trap. Click follows the link; a later phase may open the existing `VideoEmbed` in a lightbox instead |
| Square image (album art) | **Side** — left rail thumb ~4.5rem | Text wraps beside it; the card stays short |
| Portrait image (comic covers, posters) | **Side** at 2:3 ~5.5rem | Same side layout |
| Art/photo with credit | any | `artistCredit` line under the image, small, muted |
| No media | — | Card is text-only; exactly v1 |

### 4.3 Scrollable context — line-and-dot rail

`context` has no practical length limit. The body region:

- `max-height: ~8.5rem; overflow-y: auto`, native scrollbar hidden
- **line-and-dot rail replaces the scrollbar**: a hairline track on the right
  edge with an accent dot that mirrors scroll progress. The rail renders
  whenever the region overflows — the "there's more" cue exists *before* the
  user scrolls, not only after
- fade mask at the clipped edge, cleared at scroll end
- `tabindex="0"` so keyboard users can scroll it; visible focus ring
- the region is inside the hover-safe area, so scrolling doesn't dismiss

**Affordance rule (applies to every feature, not just scroll):** each capability
ships with its own visible cue — dotted underline for carded links, rail for
overflow, play badge + duration for video, icon chips (never color alone) for
paywall/archive, a labeled button for the spoiler cover. A feature without its
cue is incomplete.

### 4.4 Positioning

Same as v1: portal + **`@floating-ui/react`** (flip, shift, safe-polygon,
`useDismiss`, `useRole`, focus management). The mock's hand-rolled 40 lines are
for design evaluation only — no safe-polygon, which is the argument for the dep.

---

## 5. Interaction model

**Pointer:** 400ms open / 150ms close, safe-polygon, card hoverable and
selectable, scroll region scrollable in place.

**Keyboard:** link focusable (already), open on `:focus-visible`, `Escape`
dismisses, `aria-describedby` → card, `role="tooltip"`, scroll region focusable.

**Touch — bottom sheet, not a floating card.** At `(hover: none)`, the card
renders as a bottom sheet: drag-handle, backdrop scrim, swipe-down or
scrim-tap to dismiss. **One action, stated once:** inside the sheet the card
drops its footer open-link, and the single full-width CTA carries the hostname
("Open on {host} ↗") so the destination stays visible. First tap opens the
sheet and suppresses navigation. Detect via `matchMedia("(hover: none)")`,
never user-agent.

**Reduced motion:** drop fade/scale, dot transition, and sheet slide under
`prefers-reduced-motion` (globals.css already honors it elsewhere).

**Spoiler sources — stacked cover, i18n-safe.** When `spoilerSource`, the card
content blurs behind a cover that is a real stacked DOM block: an eye-off icon,
a header-style label line ("Spoiler-adjacent source"), and a **full-width
"Reveal source" button**. Full-width because translated strings change length
and a stacked layout absorbs that; a centered inline string does not. No UI
string may live in CSS `content:` — the catalog can't reach it. The blurred
content carries `aria-hidden` until revealed. Reveal state is per-card, not
persisted.

**i18n.** The site already runs next-intl with `[locale]` routing. All card
strings ship as a message namespace: `source.spoilerHeader`, `source.reveal`,
`source.openNewTab`, `source.openOn` ("Open on {host}"), `source.paywall`,
`source.archived`, `source.cited` ("Cited {n}×").

---

## 6. Edge cases and gotchas

- **Pagefind indexes card text.** Build runs `npx pagefind --site .next`; the
  site currently uses zero `data-pagefind-*` attributes. Card wrapper needs
  `data-pagefind-ignore` or search excerpts fill with citation context. Most
  likely thing to ship broken.
- **Re-import destroys Studio-only enrichment** (§3).
- **Sourced links must look different from plain links** — `ArticleBody.tsx:54`
  styles all prose links identically. Mock resolves this: dotted underline (T1).
- **Compose with `spidey-sense-hover`, don't stack two hover effects.**
- **Spoiler blocks:** the nested `components` pass-through bug is **fixed**
  (Aug 2026) — links inside spoilers now render through `marks.link`, so cards
  work there. A `spoilerSource` card inside a `SpoilerBlock` double-blurs;
  acceptable, but don't "fix" one blur by removing the other.
- **SSR:** card markup client-only (`mounted` guard).
- **RSS unaffected** — `rss.xml/route.ts` serializes `excerpt` only.
- **Images:** always through `urlFor()` with width caps (mock uses ~640px
  ceiling); alt text from `sourceTitle` fallback `sourceName`.
- **Miles has no `data-theme` attr** — any theme-conditional CSS must treat the
  absent attribute as Miles, matching `ThemeProvider` (`stored === "miles" ? "" : stored`).

---

## 7. Phasing (v2)

| Phase | Scope | Size |
|-------|-------|------|
| **1** | Schema fields (both schemas) + `SourceLink.tsx` with Floating UI: text card, scrollable context, hover/focus, `data-pagefind-ignore`. Enrich the three Brand New Day articles in Studio as the test case | ~1 day |
| **2** | Touch bottom sheet, `Escape`/safe-polygon tuning, reduced motion, spoiler-source blur, access + archive chips | ~½ day |
| **3** | Media slots: banner/side layouts, video play affordance, aspect derivation, reserved boxes, artist credit | ~½ day |
| **4** | Markdown authoring (converter footnote syntax) — makes enrichment survive re-import | ~1 day |
| **5** | `hydrate-sources.ts`: og:title/site_name/published_time/**image** prefill; optional Wayback SPN for `archiveUrl` | ~½ day |

1–3 are independently shippable. 4 is what makes the feature sustainable. 5 is
what makes it cheap to use.

---

## 8. Decisions needed

1. ~~Floating UI or hand-rolled?~~ **Floating UI** (v1 decision, unchanged).
2. ~~Inline treatment?~~ **T1 dotted underline** (v1 decision, mock-validated).
3. ~~Card direction?~~ **Rail + Panel's hostname footer** — v2 mock evolves this
   with media slots; confirm against the updated mock.
4. **Article only, or article + story?** Same cost; recommend both.
5. ~~**Backfill policy**~~ — **rule established (Aug 2026): cite only where the
   prose already names its source.** The 2025 research notes in
   `/research/**` contain **zero URLs**, so there is no record of which sources
   were actually consulted. Going and finding a plausible URL for an unattributed
   claim would fabricate provenance in Chris's voice. Where the writing already
   says "87% from critics on RT" or "Rotten Tomatoes: 11%", linking makes an
   existing attribution clickable — that is the whole permitted move.
   26 posts name a source in prose and are eligible on that basis; Daredevil and
   Madame Web are done. **Going forward, record source URLs in the research doc
   while researching** — that is what makes richer backfill possible later.
6. **Phase 4 now or later?** Determines whether Brand New Day enrichment is
   throwaway or permanent.
7. **New (v2): lightbox playback?** Should video sources eventually play in-page
   via the existing `VideoEmbed` in a modal, or always click through? Ship
   click-through first either way.
