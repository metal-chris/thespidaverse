# Theme Transitions & Animations

Technical reference for all theme transition animations and the early access confirmation flow in The Spidaverse.

---

## Architecture Overview

### Provider Stack (src/app/layout.tsx)

```
ThemeProvider          ← manages theme state, triggers SymbioteOverlay
  TransitionProvider   ← manages page transition toggle (footer switch)
    Header / Main / Footer
```

- **ThemeProvider** (`src/components/theme/ThemeProvider.tsx`) — holds `theme` state, `toggleTheme()` function, and renders `SymbioteOverlay` during transitions
- **TransitionProvider** (`src/components/transitions/TransitionProvider.tsx`) — holds `transitionsEnabled` toggle and renders `GlitchOverlay` on page navigation
- The transition toggle preference is stored in `localStorage` as `spidaverse-transitions` (`"true"` or `"false"`)

### Theme Cycle Order

```
miles → peter → venom → miles
```

Each theme has a corresponding transition direction: `to-miles`, `to-peter`, `to-venom`.

### Theme Persistence

- Stored in `localStorage` as `spidaverse-theme` (`"miles"`, `"peter"`, `"venom"`)
- Applied to `<html>` as `data-theme=""` (miles/default), `data-theme="peter"`, or `data-theme="venom"`
- An inline `<script>` in layout.tsx reads localStorage before React hydrates to prevent flash of wrong theme
- The coming soon page reads and writes the same `spidaverse-theme` key, keeping palettes in sync

---

## Theme Transition System

**File:** `src/components/theme/SymbioteOverlay.tsx`

### Transition Modes

| Mode | Trigger | Duration | Behavior |
|------|---------|----------|----------|
| **Full** | Transitions toggle ON | 4000ms | Character animation (3s) + WebSpinner loading screen (1s) |
| **Quick** | Transitions toggle OFF | 1000ms | WebSpinner loading screen only (no character animation) |
| **Instant** | `prefers-reduced-motion: reduce` | 0ms | Theme swaps immediately, no overlay |

### Full Transition Timeline (4000ms)

```
0ms        Phase: "animate" — character animation + circle wipe begin
           SVG strokes draw on screen (Miles/Venom) or web reveals (Peter)
           Circle wipe slowly expands from click origin

3000ms     Phase: "hold" — character animation removed
           Circle wipe covers full screen in character color
           WebSpinner appears centered

3200ms     Theme swap happens (data-theme changes, localStorage updates)

3600ms     Phase: "fade" — wipe + spinner fade out (opacity 0)

4000ms     Phase: "done" — overlay removed from DOM, onComplete() fires
```

### Quick Transition Timeline (1000ms)

```
0ms        Phase: "hold" — skips directly to loading screen
           Circle wipe instantly covers screen
           WebSpinner appears centered

500ms      Theme swap happens

600ms      Phase: "fade" — wipe + spinner fade out

1000ms     Phase: "done" — overlay removed
```

### Per-Direction Configuration

| Direction | Stroke Color | Wipe Color | Spinner Color | Total Duration |
|-----------|-------------|------------|---------------|----------------|
| `to-miles` | `#FFD700` (gold) | `#FFD700` | `rgba(0,0,0,0.5)` | 4000ms |
| `to-peter` | `#FFFFFF` (white) | `#FFFFFF` | `rgba(0,0,0,0.4)` | 4000ms |
| `to-venom` | `#0A0A0A` (black) | `#0A0A0A` | `rgba(255,255,255,0.6)` | 4000ms |

### Theme Swap Delays

| Mode | Swap Delay |
|------|-----------|
| Full (all directions) | 3200ms |
| Quick | 500ms |
| Reduced motion | 0ms (instant) |

---

## Character Animations

### Miles — Fractal Lightning (edges → center)

**Algorithm:** Recursive midpoint displacement

Given two points, the algorithm finds the midpoint, displaces it perpendicular to the segment by a random amount proportional to the segment length (30% displacement factor), then recurses on each half. Recursion depth is 5, producing 2^5 = 32 line segments per bolt.

**Branching forks:** During recursion, actual displaced midpoints at depth 0-2 are collected. After the main bolt is generated, 1-2 fork branches are created from randomly selected midpoints. Each fork:
- Angles off 25-70 degrees from the main bolt direction
- Has length 80-200px
- Uses fractal subdivision at depth 3 (8 segments)
- Starts drawing when the main bolt's stroke animation reaches that midpoint's position (`delay + t * STROKE_DURATION`)

**Rendering:** Each bolt produces 2 SVG `<path>` elements:
1. **Glow layer** — same path, `strokeWidth: bolt.width + 4`, `stroke: rgba(255,215,0,0.3)` (behind)
2. **Core layer** — `strokeWidth: 1.5-2.5px`, `stroke: #FFD700`

Forks render similarly but thinner (0.4-0.6x core width).

**Counts & timing:**
- 8 main bolts, evenly distributed around the viewport perimeter
- Each targets a different point near the center (60px scatter radius)
- 120ms stagger between bolts
- Stroke animation: `tendril-draw` keyframe, 2500ms duration, ease-out

**CSS keyframe** (`globals.css`):
```css
@keyframes tendril-draw {
  0%   { stroke-dashoffset: 1200; opacity: 0.8; }
  30%  { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}
```

Uses `strokeDasharray={1200}` / `strokeDashoffset={1200}` animated to 0.

---

### Peter — Geometric Spider Web (center → edges)

**Algorithm:** Deterministic polar coordinate web, revealed progressively

Unlike Miles and Venom, Peter's web is NOT stroke-animated. The entire web is pre-rendered as static SVG paths and revealed from center outward via a JavaScript-driven expanding `clip-path: circle()`.

**Web structure:**
- **12 radial spokes** — straight lines from viewport center (`vw/2, vh/2`) outward to 55% of the viewport diagonal. Each angle has ±1.7 degrees of random jitter for organic feel.
- **5 concentric rings** — quadratic bezier curves connecting adjacent spokes at each ring radius. Ring radii use exponential bias (`t^2 * 0.4 + t * 0.6`) for tighter spacing near center, matching the coming-soon page's `SpiderWebRenderer`.
- **Concave scallop curves** — between each pair of adjacent spokes, the ring curve's control point is pulled inward toward the center. Sag ratio is 22-29.5% (inner rings sag slightly more proportionally). This creates the iconic concave scallop shape of real spider webs.

**Reveal animation:** Driven by `requestAnimationFrame`, not CSS:
- A `webReveal` state value animates from 0 to 1 over 3000ms
- Easing: cubic ease-out (`1 - Math.pow(1 - t, 3)`)
- Applied as `clipPath: circle(${webReveal * diagonal * 0.6}px at ${vw/2}px ${vh/2}px)` on the SVG container

**Rendering:**
- Spokes: `strokeWidth: 2`, `opacity: 0.9`
- Rings: `strokeWidth: 1.5`, `opacity: 0.7`
- All strokes: `stroke: #FFFFFF`, `strokeLinecap: round`

---

### Venom — Tapered Symbiote Tendrils (edges → center)

**Algorithm:** Filled tapered shapes generated from quadratic bezier centerlines

Each tendril is a closed polygon (filled, not stroked) that tapers from a wide base at the screen edge to a pointed tip near the center.

**Centerline generation:**
- 16 tendrils evenly distributed around the viewport perimeter via `perimeterPoint()`
- Each targets a different point in the center area (50-120px scatter radius, angled to avoid convergence)
- Single quadratic bezier from edge to center with a gentle arc (30-80px perpendicular displacement, alternating left/right per tendril)

**Taper shape generation:**
- 20 sample points along the quadratic bezier centerline
- At each sample, the tangent direction and perpendicular normal are computed
- Half-width at each sample: `baseWidth * (1 - t)^2` where `t` goes from 0 (base) to 1 (tip)
- This cubic falloff creates a fat base that narrows quickly, with a long thin pointed tip
- `baseWidth`: 10-16px (half-width), so total width at base is 20-32px

**Outline construction:**
- Left edge points: centerline + normal * halfWidth
- Right edge points: centerline - normal * halfWidth
- Path: left edge forward → tip point → right edge backward → close (Z)

**Animation:** CSS `venom-grow` keyframe with `transform-origin` set to each tendril's start point on the edge:
```css
@keyframes venom-grow {
  0%   { opacity: 0; transform: scale(0); }
  10%  { opacity: 1; }
  100% { opacity: 1; transform: scale(1); }
}
```
- Duration: 2500ms
- Easing: `cubic-bezier(0.2, 0, 0.3, 1)` — starts slow (creeping), accelerates
- Stagger: 150ms between tendrils

**Rendering:** Single filled `<path>` per tendril, `fill: #0A0A0A`

---

## Circle Wipe Portal

Present in both theme transitions and the coming-soon early access flow.

### Theme Transition Wipe

A `<div>` covering the full viewport with `clip-path: circle()` that transitions from 0% to 150% radius.

- **Origin:** Click position on the theme toggle button (or button center if no click event)
- **Color:** Character's wipe color (gold / white / black)
- **Expansion:** CSS transition `clip-path 3s cubic-bezier(0.4, 0, 0.2, 1)` during animate phase
- **Fade-out:** CSS transition `opacity 0.4s ease-out` during fade phase
- **Quick mode:** Instantly at 150% (no expansion animation)

### Coming Soon Portal Wipe

**File:** `src/app/coming-soon/coming-soon.css`

```css
@keyframes cs-portal-wipe {
  0%   { clip-path: circle(0% at 50% 50%); opacity: 1; }
  100% { clip-path: circle(150% at 50% 50%); opacity: 1; }
}
.cs-portal-wipe {
  animation: cs-portal-wipe 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

- Always expands from viewport center (not click origin)
- Color: current palette's accent color
- Animation delay: 2.2s (after the "Access Granted" text has been visible)

---

## WebSpinner Loading Screen

**File:** `src/components/ui/WebSpinner.tsx`

An SVG spider web spinner used as both the theme toggle button icon and the loading indicator during transitions.

**Structure:**
- 12 radial spokes from center to edge
- 4 concentric rings (circular arcs connecting spokes)
- 3 outer arcs with 20-degree gaps (visible spin indicator)
- Spider logo in center (counter-rotates to stay upright)
- Spider has pulsing glow animation behind it

**Sizes:** `sm` (24px), `md` (48px), `lg` (72px)

**Animation:** `animate-spin` at 3s duration. Spider counter-rotates at same speed.

**During theme transitions:** Rendered at `lg` size, centered on screen, colored by `spinnerColor` from direction config. Visible during the `hold` and `fade` phases.

---

## Early Access Confirmation Animation

**Files:**
- `src/components/coming-soon/ComingSoonContent.tsx`
- `src/components/coming-soon/ComingSoonPage.tsx`
- `src/app/coming-soon/coming-soon.css`

### Timeline (3200ms total)

```
0ms        API returns OK → accessStatus = "success"
           onAccessGranted() fires:
             - accessGranted state set to true
             - 8 canvas strikes fire radially from viewport center (60ms apart)
           Card gets cs-access-glow animation (accent color box-shadow pulse)
           "Access Granted" glitch text appears (cs-glitch-access + cs-access-reveal)
           "Welcome to the web." subtitle shows

2200ms     Portal wipe overlay starts expanding from viewport center
           (cs-portal-wipe with 2.2s animation-delay, 1s duration)

3200ms     window.location.href = "/" — redirects to main site
```

### CSS Animations

**Card glow** (`cs-access-glow`, 1.4s):
```
0%   → no shadow
40%  → 30px + 60px accent color box-shadow (peak)
100% → 20px subtle glow (hold)
```

**Glitch text** (`cs-glitch-access-red` / `cs-glitch-access-blue`, 0.8s):
- Red/blue chromatic pseudo-elements via `::before`/`::after`
- Rapid position jitter (±4px) for first 300ms
- Fade to transparent by 800ms
- Clipped top/bottom halves via `clip-path: inset()`

**Text reveal** (`cs-access-reveal`, 0.8s):
```
0%   → opacity 0, scale 0.8
50%  → opacity 1, scale 1.05 (overshoot)
100% → opacity 1, scale 1
```
Easing: `cubic-bezier(0.34, 1.56, 0.64, 1)` (spring bounce)

**Portal wipe** (`cs-portal-wipe`, 1s):
```
0%   → circle(0% at 50% 50%)
100% → circle(150% at 50% 50%)
```

### Canvas Strikes

The `SpiderWebRenderer` in the coming-soon page has a `triggerStrike(x, y)` method. On access granted, 8 strikes fire in a radial burst from viewport center (80px radius), staggered 60ms apart. The renderer reference is passed up from `NeuralNetworkCanvas` → `ComingSoonPage` via an `onRendererReady` callback (stored in a ref to avoid useEffect dependency issues).

---

## Coming Soon ↔ Main Site Theme Sync

**File:** `src/components/coming-soon/ComingSoonPage.tsx`

The coming soon page has its own palette state (`miles`/`peter`/`venom`) independent of `ThemeProvider`. To keep them in sync:

- **On mount:** reads `localStorage.getItem("spidaverse-theme")` and initializes palette
- **On palette toggle:** writes to `localStorage.setItem("spidaverse-theme", palette)`
- **On redirect:** the main site's inline script in `layout.tsx` reads the same key and applies `data-theme` before React hydrates

This means if a user picks "Peter Mode" on the coming-soon page, the main site loads in Peter theme after entering the early access code.

---

## Reduced Motion Support

### Theme Transitions
- `prefers-reduced-motion: reduce` → instant theme swap, no overlay rendered at all

### Coming Soon Animations
All coming-soon keyframes have reduced-motion overrides in `coming-soon.css`:
```css
@media (prefers-reduced-motion: reduce) {
  @keyframes cs-access-glow { 0%, 100% { box-shadow: none; } }
  @keyframes cs-glitch-access-red { 0%, 100% { transform: none; opacity: 0; } }
  @keyframes cs-glitch-access-blue { 0%, 100% { transform: none; opacity: 0; } }
  @keyframes cs-portal-wipe { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes cs-access-reveal { 0% { opacity: 0; } 100% { opacity: 1; } }
}
```

### Global
`globals.css` has a blanket reduced-motion rule:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## File Reference

| File | Purpose |
|------|---------|
| `src/components/theme/ThemeProvider.tsx` | Theme state, toggle logic, swap delays, renders SymbioteOverlay |
| `src/components/theme/SymbioteOverlay.tsx` | All character animations, circle wipe, WebSpinner hold |
| `src/components/theme/ThemeToggle.tsx` | Toggle button (renders WebSpinner at `sm` size) |
| `src/components/ui/WebSpinner.tsx` | SVG spider web spinner component |
| `src/components/transitions/TransitionProvider.tsx` | Page transition toggle state |
| `src/components/coming-soon/ComingSoonPage.tsx` | Coming soon wrapper, palette sync, canvas strike trigger, portal wipe overlay |
| `src/components/coming-soon/ComingSoonContent.tsx` | Early access form, success state, redirect timer |
| `src/components/coming-soon/NeuralNetworkCanvas.tsx` | Canvas wrapper, exposes triggerStrike via onRendererReady |
| `src/components/coming-soon/SpiderWebRenderer.ts` | Canvas-based web renderer with strike animation |
| `src/app/globals.css` | `tendril-draw`, `venom-creep`, `venom-grow`, `spin` keyframes |
| `src/app/coming-soon/coming-soon.css` | `cs-access-glow`, `cs-glitch-access-*`, `cs-portal-wipe`, `cs-access-reveal` keyframes |

---

## CSS Keyframe Summary

| Keyframe | File | Duration | Used By |
|----------|------|----------|---------|
| `tendril-draw` | globals.css | 2500ms | Miles lightning strokes |
| `venom-creep` | globals.css | 2500ms | (available, currently unused — replaced by venom-grow) |
| `venom-grow` | globals.css | 2500ms | Venom tapered tendril scale animation |
| `spin` | globals.css | varies | WebSpinner rotation |
| `cs-access-glow` | coming-soon.css | 1400ms | Early access card border glow |
| `cs-glitch-access-red` | coming-soon.css | 800ms | "Access Granted" red chromatic shift |
| `cs-glitch-access-blue` | coming-soon.css | 800ms | "Access Granted" blue chromatic shift |
| `cs-access-reveal` | coming-soon.css | 800ms | "Access Granted" text entrance |
| `cs-portal-wipe` | coming-soon.css | 1000ms | Early access circle wipe to main site |
