# Tier List — Spec

The `tierList` Portable Text block: a classic S/A/B/… chart that grows from a
visual table of contents (Phase 0, shipped) into the article's primary reading
surface (Phase 1, this spec) and eventually the interactive "make your own"
Maker (Phase 2).

**Status:** Phase 0 live in production. **Phase 1 built** (Aug 2026) —
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
