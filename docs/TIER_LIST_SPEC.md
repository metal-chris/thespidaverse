# Tier List — Spec

The `tierList` Portable Text block: a classic S/A/B/… chart that grows from a
visual table of contents (Phase 0, shipped) into the article's primary reading
surface (Phase 1, this spec) and eventually the interactive "make your own"
Maker (Phase 2).

**Status:** Phase 0 live in production. **Phase 2 (Maker) built** and
click-verified on production, Aug 2026 — see "Phase 2 — as built" below.
**Phases 3–6 planned** (Aug 2026) from a side-by-side with TierlistFills'
creator flow; scope decisions are recorded there so they are not relitigated.
**Phase 1 built** (Aug 2026) —
approved from the "Tier Capsules — Design Spec" artifact with three revisions
now in the contract: the close control lives inside the dialog, the capsule
footer is previous / counter / next (left / center / right), and the sheet
header carries the entry image thumb. Verified against mock data: dialog and
sheet shells, swipe navigation, deep links, focus return, Esc/arrows, the
static Pagefind layer, and the rating badge.

---

## Phase 0 — as built (live)

- `tierList` object in the article body schema: `title`, `tiers[]` of
  `{label, color?, entries[]}`, entries `{title, year?, image?, anchor?}` with
  stable `_key`s
- Read-only renderer [`TierListChart.tsx`](../src/components/content/TierListChart.tsx):
  2:3 poster chips in tier rows, overall 1–N rank badges, chips deep-link to
  entry headings via `anchor`
- Fixed classic tier ramp (S red → F purple), per-tier `color` override
- TMDB posters uploaded as Sanity assets; footer carries the TMDB attribution

**The Phase 0 problem, named:** on mobile, tapping a chip teleports the reader
thousands of words down the page with no way back. And the article itself
remains a very long scroll — Part 3's entry write-ups alone are ~3,000 of its
~4,000 words.

---

## Phase 1 — Tier Capsules

The chart stops pointing at the article and starts *carrying* it. Each entry
opens a **capsule**: its write-up, rating, and links, in a presentation chosen
by device.

### Presentation

| Surface | Shell | Navigation |
|---|---|---|
| Mobile / tablet (`hover: none` or narrow) | **Bottom sheet** — the established house pattern from source tooltips. Drag down or scrim-tap to dismiss | Horizontal swipe or buttons for prev/next in rank order; counter "7 / 17" |
| Desktop | **Centered dialog**, two panes: poster left, scrollable content right | ← / → keys, prev/next buttons, Esc, click-outside; focus trapped, returned to the chip on close |

The reader never loses their scroll position. Flipping through all 17 entries
requires zero page scrolling on any device.

Content regions scroll behind the **line-and-dot rail** (reused from source
cards) when they overflow.

### Two modes per block

| `mode` | Body of the article | Capsule shows |
|---|---|---|
| `"index"` *(default — published Part 3 unchanged)* | Keeps the full long-form write-ups with headings | Excerpt (first paragraph) + "Read the full entry ↓" anchor jump |
| `"capsule"` | Intro + tier essays + chart + verdict. Entry write-ups **live in the entries** | The full write-up |

Index mode fixes the mobile teleport (capsule first, jump second). Capsule mode
fixes the scroll (article body shrinks ~75% on Part 3).

### Schema additions (all additive; Phase 0 blocks keep working untouched)

Block level:

| Field | Type | Purpose |
|---|---|---|
| `mode` | `"index" \| "capsule"` | Above. Defaults to `index` |
| `chipAspect` | `"poster" \| "square" \| "wide"` | 2:3 films, 1:1 albums, 16:9 games/TV key art. Per block, not per entry — mixed aspects in one chart read as a mistake |

Entry level:

| Field | Type | Purpose |
|---|---|---|
| `subtitle` | string | Generalizes `year`: "2004", "Season 2", an artist. Chart label uses `subtitle ?? year` |
| `content` | Portable Text | The capsule write-up. **Full rich text: bold, links, and source-citation cards all work inside capsules**, because it renders through the same `portableTextComponents` |
| `rating` | number | Optional per-entry Web Rating; renders the compact web in the capsule |
| `href` | string | "Full review →" link when the entry has its own article (e.g. Madame Web → One Year Later). Internal or external |

### Behavior contract

- **Deep links:** opening a capsule sets `#tl-<entryKey>`; a URL carrying one
  opens that capsule on load. Shareable per-entry links, and the groundwork for
  Phase 2's URL-encoded reader arrangements
- **SEO / search — the inverse of source tooltips:** capsule `content` is
  *article content*, so it must be indexed. The block renders a static,
  semantic entry list in the document (progressive enhancement; also the
  no-JS reading path). **No `data-pagefind-ignore` here** — in capsule mode
  this static layer is the only copy of the write-ups Pagefind ever sees
- **A11y:** dialog `role="dialog"` + `aria-modal`, labelled by entry title;
  focus trap; Esc; focus returns to the opening chip; swipe affordances have
  button equivalents; counter is `aria-live="polite"`
- **Reduced motion:** sheet slide, dialog fade, and swipe transitions collapse
  to instant under `prefers-reduced-motion`
- **i18n:** all strings through next-intl, `tierList.*` namespace, all six
  locales: `open`, `close`, `previous`, `next`, `counter` ("{n} of {total}"),
  `readFull`, `fullReview`

### Phase 2 relationship (Maker — renumbered from the Phase 0 commit's "phase 1")

The capsule dialog becomes the Maker's inspection surface, and the sheet's
drag mechanics seed the drag-to-rearrange interaction. Deep-link hashes grow
into the full URL-encoded arrangement format. Nothing in Phase 1 is throwaway.

### Migration note for Part 3

Published Part 3 keeps working in `index` mode with zero changes. Migrating it
to `capsule` mode means moving the 17 write-ups from body headings into entry
`content` (scriptable — the extraction already exists) and trimming the body to
intro + tier essays + chart + The Full List + verdict. Editorial call, not a
technical one.

**Done (Aug 2026):** Part 3, the Ghibli Gauntlet, the animated-series
Gauntlet, and Marvel Rivals all run `capsule` mode. Ghibli and the animated
series were converted by script from numbered `h2`s (anchors verified against
the live page before writing); Rivals from its `Season N:` headings, with the
declared `Ranking: X-Tier` lines and the Final Ranking prose agreeing on every
placement.

---

## Phase 2 — Maker, as built (live)

[`TierMaker.tsx`](../src/components/content/TierMaker.tsx), mounted under the
chart behind a "Make your own" CTA. The reader rearranges the **author's**
entries across the **author's** tiers; nothing is added or renamed.

| Piece | Where |
|---|---|
| Tap-to-hold / tap-a-tier (touch), drag-and-drop, keyboard (tier letter places, `0` unranks, ←/→ walk, Esc drops the hold, focus follows a moved chip) | `TierMaker.tsx` |
| Share as `/articles/<slug>/r/<code>` with its own OG card; the article page stays static | `[slug]/r/[tl]/page.tsx`, `api/og/tierlist/route.tsx` |
| Compare (diff vs the author), Clear, Reset, unranked readout, `?tl=` kept in the address bar | `TierMaker.tsx` |
| One encoder/decoder for the Maker, `/r/`, the OG route and `/embed` | `src/lib/tierlist/arrangement.ts` — edge-safe, no React/Sanity/Node |
| Wire format: base-36 entry indices grouped by tier, `\|`-joined; **36-entry hard cap** (one char per index); malformed codes fall back to the author's ranking | same file, header comment is the contract |
| Strings, **8 locales** (`en es fr ja ko pt zh-CN zh-TW`) → `tierList.maker.*` | `src/messages/*.json` |

Verified on production (Aug 2026): CTA, `chipAspect` with no crop, touch
hold/place without scroll interference, drag/drop, all keyboard paths, `?tl=`
round-trip, both malformed-code guards, Compare, `/r/` + OG card, capsule
poster aspect. Two defects found and fixed in
[#70](https://github.com/metal-chris/thespidaverse/pull/70): focus fell to
`<body>` after every keyboard move (rAF fired before React committed), and
`robots.txt` was caught by the splash gate.

### Decision boundary (Aug 2026)

Reviewed against TierlistFills' create flow (format chooser, board, list
settings, per-tier editor). Decided:

- The Maker **stays a reader-remix**. Readers do not bring items, add tiers,
  or rename rows. A standalone reader-facing creator was considered and not
  pursued. **The creator is the author, in Studio** — and that surface, not
  the reader Maker, is where TierlistFills' create flow (format chooser, tier
  editor, palette, preview, templates) maps. It gets the depth (Phase 3).
- **No per-list visual settings** — background image/color, border and
  highlight colors, row highlight. The three-theme system stays authoritative
  and the chart stays on the site palette. Per-tier `color` remains the only
  color control, author-side.
- Four things carry forward as Phases 3–6: **authoring versatility** in
  Studio, **remix polish**, a per-article **Poll**, and a **Numbered** format. Timed *Live* polls are deferred; if
  wanted they are a window on top of Phase 5, not a separate build.

---

## Phase 3 — Authoring versatility (Studio)

The creator is the author. Studio today is stock Sanity 5 — `structureTool` +
`visionTool`, default array forms, no custom inputs, no document views, no
templates, no actions — which is why a `B+` tier rendered grey and nobody
could see it until it was on the page. Sanity 5 supports all four extension
points; this phase uses them. Everything here is additive and backwards
compatible; no stored data changes shape.

**The B+ lesson, named:** `tierColor()` knew seven labels. Anything else fell
to `#8A8A8A` silently. The fix is not "add B+"; it is that grade-shaped labels
should never need an override, and labels that do need one should be flagged
in Studio and previewable there.

| | Item | Size | Contract |
|---|---|---|---|
| **A1** ✅ #77 | **Grade-aware ramp** | XS | `TIER_COLORS` in `arrangement.ts` grows to the 21 explicit entries `S+ S S- A+ A A- … F+ F F-` (predictable; no interpolation guesswork). Free-form labels ("Untouchable", "Skip") still fall to grey and are what A3 warns about. All seven `tierColor()` call sites — chart, Maker, OG route — pick it up. Ships alone, first |
| **A2** ✅ | **Color swatches** | S | Custom string input for `tier.color`: the ramp swatches plus a custom-hex field, writing the same string it does today. A live badge preview beside the label shows the resolved color (override, or ramp, or grey) |
| **A3** ✅ | **Validation warnings** | S–M | Studio *warnings*, never errors: label resolves to grey and has no override; more than 36 entries (the wire-format cap); duplicate labels; index mode and an `anchor` matching no `slugify(h2)` in the body (validation has document context, so this is a real check); numbered mode with grade labels (which are ignored) |
| **A4** ✅ | **Chart preview** | M | `sanity/components/TierListInput.tsx`: a compact static render **above** the block's fields — rails in the exact color `tierColor()` gives the site, flat rank badges, poster/square/wide thumbs from the CDN (built from the asset ref, no `next/image`), title-text chips when there is no art, an over-cap flag past 36. Free-form labels widen the rail rather than clip. Deliberately not the production `TierListChart`, which would drag `next/image` and `next-intl` into Studio. Takes CDN config as a prop so it renders outside Studio: verified by rendering it against the live Ghibli and Rivals blocks with headless Chrome. The collapsed block in the Portable Text editor also gained a subtitle (`6 tiers · 24 entries · capsule · poster`) |
| **A5** ✅ #78 + A2 | **Presets** | XS | Two halves, because Sanity 5.13's `insertMenu` has no per-type template menu: (1) the block's `initialValue` scaffolds S–F on insert (#78, also flips the `mode` default to `capsule`); (2) a "Start from" row in the custom `tiers` input offers S–F / S–D / S–C / S·A·B and asks before replacing non-empty rows. Every preset label is on the ramp. "Numbered" waits for Phase 6's `listType`; without it, rows labelled 1/2/3 render grey and mean nothing |
| **A6** ✅ | **Populate from headings** | M | `sanity/lib/tierHeadings.ts` + a panel in the block input. Parses two real shapes — `3. Title (1988)` / `9. Title (2017-2020)` → title + year, and `Season 6: Night at the Museum` → title + subtitle — ignoring essay sections. Anchors are `slugify(headingText)`, the same thing `PortableTextComponents.tsx` puts on the rendered `<h2 id>`. Orders by rank when every heading has one (articles number both 1→N and N→1), document order otherwise. New entries land in **one tier the author picks**, because headings carry an ordering but not tier cut lines, and inferring those would be inventing the author's judgement. Idempotent on anchor. **Note:** it reads the *body*, so it only helps a list that has not been converted to capsule mode yet — converted articles have no numbered headings left. That is the normal authoring order (populate, then convert) |
| **A7** ✅ | **Fetch poster** | M | `sanity/components/TierEntryImageInput.tsx` above the entry's image field: search TMDB by the sibling title (year auto-filled from `year`, or a 4-digit year inside `subtitle`), see up to 8 candidates as poster + exact TMDB title + year, click one, it uploads at `w500` and sets `image`. Movie/TV toggle defaults from the article's `mediaType` (anime → tv). Only the **search** is proxied (`/api/studio/tmdb`, holding `TMDB_API_KEY`); poster bytes are fetched straight from image.tmdb.org, which sends `access-control-allow-origin: *`, and uploaded with Studio's own authenticated client — so no server route ever handles a caller-supplied URL and there is no SSRF surface. Seeing the candidate before choosing is the point: by script, "Monster" matched a 2025 music video and TMDB's own English title for Nausicaä is "Warriors of the Wind". **The route is unauthenticated** (`/api/` bypasses the splash gate), same posture as `/api/admin/analytics`; it reads and writes nothing, inputs are clamped, and the only cost of abuse is TMDB quota. Anime/games via AniList/Steam still open |
| **A8** | **Maker as the Studio input** | L | Mount the reader board as the `tierList` object's input: dragging between tiers writes `tiers[].entries` patches. The author arranges exactly the way readers remix. Studio arrays make cross-tier moves painful today; this removes that. Last, and can slip behind Phase 4 |

Studio code lives in `sanity/components/` (inputs) and `sanity/lib/` (pure
presets + validators, both importable from `@/lib/tierlist/arrangement` and
`@/lib/utils` because `next-sanity` bundles Studio through Next). Validation
runs against the four live lists produced zero warnings before shipping, so
the rules do not cry wolf on existing data. `@sanity/ui@3.1.13` is now a
direct dependency (it was only nested under `sanity/`).

**Done when:** A1 lands as its own PR with a before/after on the Rivals B+
row (its manual `#E8AF4F` override becomes removable); A2–A5 verified in the
embedded Studio at `/studio` against a draft; A6 and A7 verified by
regenerating one existing list from scratch and getting the same entries and
posters back; A8 verified by re-tiering a draft and confirming the published
chart matches. No stored document changes shape at any point.

---

## Phase 4 — Remix polish (small)

What TierlistFills' board offers that a remix can use without authoring
power. No schema change, no backend, share codes untouched. One PR.

| Item | Contract |
|---|---|
| **Undo / redo** | History stack of arrangements, capped at 50. Buttons in the control bar beside Clear/Reset; ⌘Z / ⇧⌘Z (Ctrl on Windows) while focus is inside the board. Clear and Reset are undoable. History is not encoded in the URL |
| **Sign your ranking** | Optional display name on the Share panel (plain text, ≤ 24 chars, control chars stripped) carried as `?by=` on the `/r/` URL only. The OG card headline becomes "*Name*'s ranking" instead of "A reader's ranking". The OG route clips and never renders it as markup. Absent → today's copy |
| **Share preview** | The Share panel shows the OG card inline (an `<img>` of `/api/og/tierlist?…`), so a reader sees exactly what they are posting before they copy |
| **Empty-row hint** | Rows with no chips show muted "Drag here or tap to place" text — verify against the current board first; may already exist |
| **± label shortcuts** | Keyboard shortcuts key on a label's first character, so with `B+` and `B` on one board, pressing **B** always lands in whichever comes first and the other is unreachable by keyboard (found on Marvel Rivals after A1). Pressing the letter again should cycle through the tiers that share it — B+ → B → B- → B+ — with the target announced to the readout |
| *Optional:* `/tier-lists` index | "Browse" from the TierlistFills landing: every article carrying a `tierList`, its OG card as thumbnail, link. Cheap; not yet decided |

**Done when:** strings in all 8 locales; keyboard shortcuts verified on
production; `arrangement.ts` untouched; existing `/r/` links unaffected.

---

## Phase 5 — Poll: "Where readers put it" (medium)

The private remix becomes an aggregate. A reader submits their arrangement;
the article shows the crowd's board against the author's.

### Data

New table `tier_list_responses`:

| Column | Notes |
|---|---|
| `article_slug`, `block_key` | `block_key` so one article can carry more than one list |
| `code` | The raw `?tl=` code, **not** decoded placement — see below |
| `list_type` | `tiers` \| `numbered` (Phase 6 reuses this table unchanged) |
| `ip_hash`, `created_at`, `updated_at` | `hashIP` from `lib/engagement/fingerprint` |
| unique `(article_slug, block_key, ip_hash)` | **Upsert on resubmit** — latest wins. The site's existing polls return 409 `already_answered`; a tier list is something you revise, so that would fight the reader |

Why not reuse `poll_responses`: its RPC aggregates by distinct `answer`
string, which for tier codes would count identical *whole arrangements*, not
per-entry placement. Why store the raw code: decoding against the *current*
block at read time means an entry the author adds later lands "unranked" for
old submissions — the same guarantee share links already give — and no
migration is needed when Phase 6 arrives.

### API

`POST /api/engagement/tierlist/[slug]` — `{blockKey, code, honeypot}`.
Reuses `isBot`, `getClientIP`, `hashIP`, `supabaseAdmin`, the RPC pattern.
Fetches the block server-side and rejects 400 if `decodeArrangement` returns
null. Upserts. Returns `{success, count}`. Partial boards are allowed: an
unranked entry is an abstention *for that entry*, not a vote.

`GET /api/engagement/tierlist/[slug]?block=` — decodes every stored code
against the live block and returns
`{count, undecodable, perEntry: {entryKey: {tierKey: n}}, crowd: {entryKey: tierKey}}`
where `crowd` is the mode tier (median tier index as tiebreak). Cached ~60s.
Below `MIN_RESPONSES` (5) returns `{count, belowThreshold: true}` and no
aggregate — five people is where "consensus" stops being one person's opinion
plus noise.

### UI

- **Maker control bar:** "Submit to the poll" beside Share. After: "You're one
  of *N*" and a link to the Readers view. Submitting the author's ranking
  unchanged is allowed — agreement is a data point.
- **Chart** (above the Maker), once count ≥ 5: segmented control
  **Author \| Readers \| Both**. *Readers* renders the crowd's board with the
  same `TierListChart`. *Both* is the author's board with a small badge on any
  chip the crowd placed differently ("↑A", "↓C").
- **Compare panel:** "vs readers" beside the existing "vs the author".
- **Studio:** `poll: boolean` on `tierList`; `undefined` reads as `true` so
  the four live lists collect without re-saving. Any list can opt out.
- *Follow-on (4b):* "Readers' ranking" OG card variant, `/api/og/tierlist?…&crowd=1`.

### Known limits, accepted

IP-hash dedup collides on shared networks (dorms, offices) — the site's
existing polls already accept this. Small-*N* noise is handled by the
threshold. Spam: honeypot as today; add a per-IP rate limit on the POST if it
becomes a problem. If the author *removes* an entry, older codes stop decoding
and drop out of the aggregate — `undecodable` is returned so that is visible
rather than silent.

**Done when:** migration in `supabase/migrations/`; both routes; Maker submit,
chart control, Compare tab; strings ×8; verified on production past the
threshold (a `MIN_RESPONSES` env override for staging so it can be exercised
without five real people).

---

## Phase 6 — Numbered format (large)

TierlistFills' "Numbered — ordered 1, 2, 3…, ties grouped into buckets", as a
per-list author choice. The smallest model that works:

### Model

- **Schema:** `listType: "tiers" | "numbered"` on `tierList`, default
  `tiers`. Additive; every live block is unaffected.
- In numbered mode `tiers[]` are **buckets**, not grades. Labels are ignored
  for display and derived from position: bucket rank = 1 + entries in earlier
  buckets, so a two-entry first bucket is a tie for 1st and the next bucket
  is 3rd. An author can give every entry its own bucket (strict order) or
  group ties. **The existing Gauntlets convert with no re-authoring** — their
  flat order already is the numbered ranking.
- The `Arrangement` type is unchanged (`Record<bucketKey, entryKey[]>`), so
  Maker state, `move()`, Compare, and URL sync all carry over.
- **Encoding:** the same `\|`-joined base-36 groups. In numbered mode the
  decoder drops the `groups.length === tiers.length` guard (bucket count is
  free) and keeps every-index-once and `< N`. Reader-created buckets get
  synthetic keys and are encoded/decoded positionally. No prefix: the block's
  `listType` tells the decoder which rules apply. Caveat, documented: flipping
  a live list from tiers to numbered reinterprets already-shared codes as
  buckets (S/A/B → 1st/4th/9th…). 36-entry cap unchanged.

### Rendering

- **`TierListChart`:** no colored rails — a ranked list with a large numeral,
  chip, title, subtitle; ties share a numeral on one row. Capsules unchanged.
- **Maker board:** rows are buckets; a drop zone *between* rows creates a new
  bucket ("its own rank"), a drop *onto* a row ties. Empty buckets collapse.
  Tap-to-hold then tap a row or a gap. Keyboard: ↑/↓ move the focused chip a
  bucket, `=` ties it with the bucket above, `0` unranks, ←/→ still walk.
  Tier-letter shortcuts do not apply.
- **Compare:** rank delta per entry (+3 / −2) instead of tier → tier.
- **OG card:** a numbered branch in `api/og/tierlist/route.tsx` — two columns
  of "N. Title", ties as "N. A · B".
- **`/r/` and `/embed`:** already share `arrangement.ts`; decode with the
  block's `listType`.
- **Poll:** per-entry mean/median rank → crowd ordering. The Phase 5 table
  needs no change.

**Done when:** schema + Studio radio; `arrangement.ts` numbered decode with a
round-trip check (encode → decode → encode identity over random arrangements,
as `scripts/verify-arrangement.ts` — there is no test runner in the repo, and
this pure module is shared by four surfaces, so it is the one place a script
earns its keep); chart, Maker, OG, Compare; strings ×8; verified on production
with a real numbered list — Ghibli is the natural first, its 1–24 order is
already in the prose.

---

## Sequencing

**3 → 4 → 5 → 6.**

- Phase 3 first: the author touches every list, readers remix some of them.
  A1 (the ramp) is the B+ fix and ships on its own immediately; A3/A4 are what
  Phase 6's Studio side needs anyway (a `listType` radio with no preview or
  validation would repeat the B+ mistake at larger scale). Ships as several
  small PRs, roughly A1 → A5 → A2+A3 → A4 → A6+A7 → A8.
- Phase 4 second: touches `TierMaker.tsx`, messages, and the OG route (for
  `by`) only. No schema, no backend, one PR, ships in a day.
- Phase 5 third: adds value to all four live lists at once; the pipe exists;
  the design calls (threshold, upsert, partial boards) are settled above.
- Phase 6 last: the largest, needs interaction design for the numbered board,
  and benefits from Phase 5 storing raw codes so numbered aggregation is a
  query change, not a migration.

6 before 5 only if a numbered list is needed for upcoming content; nothing
on the calendar demands it, and Poll aggregation must handle both anyway.
A8 (Maker as the Studio input) can slip behind Phase 4 without blocking
anything — it is a payoff item, not a dependency.

### Cross-cutting

- Every string in **all 8** locale files, in the same PR as the feature.
- `arrangement.ts` stays edge-safe. Every wire-format change must keep every
  already-shared link valid; the file header is the contract.
- Verify on **production** with the Browser pane, not the local dev server
  (its a11y tree is empty and layout reads are unreliable). `.click()` reaches
  React in production; do focus checks in a single evaluation; scroll the
  Maker into view before hydration probes.
