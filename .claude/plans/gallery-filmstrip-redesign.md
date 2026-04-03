# Gallery Lightbox Film Strip Redesign

## Problem
The current film strip is a horizontal scroll bar at the bottom of the lightbox. It:
- Doesn't look like a real film strip (just thumbnails with a repeating gradient)
- Requires horizontal scrolling (unnatural on most input devices)
- Misses the Peter Parker photography homage opportunity

## Design Goals
1. **Vertical film strip** on the right side — natural scroll with mouse wheel/touchpad/finger
2. **Authentic 35mm film strip aesthetic** — proper sprocket holes, frame numbers, rebate markings
3. **Thematic** — Pete's contact sheet / light table

## Research: Real 35mm Film Strip Anatomy
- **Sprocket holes**: 8 per frame (4 on each side), rounded rectangles ~2.8mm × 2mm
- **Perforation pitch**: 4.74mm between holes
- **Rebate**: Narrow band between sprocket holes and image frame — contains frame numbers, DX codes, film stock name
- **Frame numbers**: Small digits printed between sprocket row and image edge (e.g., "1", "2", "3A")
- **Film stock text**: e.g., "KODAK 400TX", "FUJI 400H" running along the edge

## Layout Change

### Current
```
┌───────────────────────────────────────────┐
│  [Image 62%]          │  [Info 38%]       │
│                       │                   │
├───────────────────────────────────────────┤
│  ◄ [thumb][thumb][ACTIVE][thumb][thumb] ► │  ← horizontal film strip
└───────────────────────────────────────────┘
```

### Proposed (Desktop)
```
┌────────────────────────────────────────────────────┐
│  [Image ~55%]     │  [Info ~30%]   │ ║ Film  ║     │
│                   │  Title         │ ║ Strip ║     │
│                   │  Artist →      │ ║       ║     │
│                   │  Franchise     │ ║ [img] ║     │
│                   │  Description   │ ║ 3A    ║     │
│                   │                │ ║ [img] ║     │
│                   │  Reactions     │ ║ 4     ║     │
│                   │  Share         │ ║ [ACT] ║ ← glow
│                   │  1 of 24       │ ║ 5     ║     │
│                   │                │ ║ [img] ║     │
│                   │                │ ║ 6A    ║     │
│                   │                │ ║ [img] ║     │
└────────────────────────────────────────────────────┘
```

### Proposed (Mobile)
```
┌──────────────────────┐
│  [Image - full width] │
│                       │
├──────────────────────┤
│  Info panel (compact) │
├──────────────────────┤
│  ◄ Horizontal film   │  ← keep horizontal on mobile
│    strip (smaller)  ► │     (natural thumb swipe)
└──────────────────────┘
```

## Film Strip Visual Design (Vertical)

Each "frame" in the strip:
```
   ┌──┐ ┌──────────┐ ┌──┐
   │  │ │          │ │  │   ← sprocket holes (left + right)
   │  │ │  [thumb] │ │  │
   │  │ │          │ │  │
   └──┘ └──────────┘ └──┘
   ┌──┐              ┌──┐
   │  │  3A          │  │   ← frame number in rebate
   └──┘              └──┘
   ┌──┐ ┌──────────┐ ┌──┐
   │  │ │          │ │  │
   │  │ │  [thumb] │ │  │
   │  │ │          │ │  │
   └──┘ └──────────┘ └──┘
```

### CSS Implementation Details

**Sprocket holes**: Small rounded rectangles rendered via `::before`/`::after` pseudo-elements on each frame, or via a repeating background gradient on the strip rail itself (more performant).

**Approach**: Use a repeating linear gradient on the left and right edges of the strip container to create the sprocket hole pattern. Each "hole" is a light rectangle punched into the dark film border.

```css
/* Sprocket holes via repeating gradient on left/right borders */
.film-strip-vertical {
  --film-bg: #1a1a1a;        /* Dark film base */
  --sprocket-color: #333;    /* Slightly lighter holes */
  --sprocket-size: 6px;
  --sprocket-gap: 14px;      /* Distance between holes */
  --border-width: 18px;      /* Width of the film border with sprockets */
}
```

**Frame numbers**: Rendered as small `<span>` elements between each thumbnail, styled with a monospace font at ~8px, rotated text or horizontal, mimicking Kodak/Fuji edge printing.

**Active frame glow**: The current piece gets a subtle warm backlight (like a light table illuminating that frame from behind), using `box-shadow: 0 0 20px rgba(accent)` and `brightness(1)` vs dimmed siblings.

**Film stock text**: A subtle repeated text along the left border like "SPIDAVERSE 400" or "PARKER TX 35mm" as a decorative touch — rendered via a pseudo-element with rotated text.

## Files to Modify

1. **`src/components/gallery/FilmStrip.tsx`** — Complete rewrite
   - Vertical layout with overflow-y-auto
   - Sprocket hole decorations per frame
   - Frame numbers between thumbnails
   - Active frame glow effect
   - Auto-scroll to keep active centered vertically
   - On mobile: keep horizontal (detect via CSS/media query or a prop)

2. **`src/components/gallery/GalleryLightbox.tsx`** — Layout restructure
   - Desktop: 3-column layout (image | info | film strip)
   - Mobile: stacked (image → info → horizontal film strip at bottom)
   - Move film strip from bottom to right side on desktop
   - Adjust image/info width ratios (~55% / ~30% / ~15%)

3. **`src/app/globals.css`** — Replace film strip styles
   - Remove horizontal `.film-strip::before/::after` gradient
   - Add vertical sprocket hole pattern
   - Add film border styling
   - Add frame number typography
   - Add light-table glow for active frame
   - Mobile media query to switch to horizontal

## Keyboard & Scroll Behavior
- **Arrow Up/Down**: Navigate prev/next in film strip (add to existing ArrowLeft/Right)
- **Mouse wheel over strip**: Natural vertical scroll through gallery
- **Click frame**: Navigate to that piece
- **Auto-scroll**: Active frame scrolls into view centered vertically

## Accessibility
- `role="navigation"` on strip
- `aria-label="Gallery film strip"`
- `aria-current="true"` on active frame
- Frame numbers are `aria-hidden` (decorative)
- Focus-visible ring on frames

## Implementation Order
1. Restructure GalleryLightbox layout (3-column desktop, stacked mobile)
2. Rewrite FilmStrip as vertical with real film aesthetic
3. Update globals.css with new film strip styles
4. Test keyboard nav, scroll behavior, mobile layout
