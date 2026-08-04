/**
 * Kumo Club's orb-web mark — three rings, eight radials, one dew-drop node.
 *
 * Kumo Club is the community branch of The Spidaverse; this is its identity
 * mark, reproduced here so the nav/footer link to it carries the real brand
 * instead of a generic lucide glyph. The canonical source is
 * `mc-v4/src/components/ui/logo.tsx` (WebMark) — keep the geometry in sync
 * if that changes. Deliberately NOT added to this site's own icon set.
 *
 * Radials stop ON the outer ring with butt caps: extending past it with
 * round caps reads as a ship's wheel rather than a web.
 *
 * SMALL-SIZE VARIANT: two rings, not the three of the full mark. At the 16px
 * this renders at in the nav, three rings sit ~0.75px apart and merge into a
 * red blob — the mark stops being a web. Dropping the innermost ring is the
 * standard reduction and keeps the silhouette honest.
 *
 * Shaped like a lucide icon (currentColor stroke, sized by className) so it
 * drops straight into the nav's `icon` slot.
 */

const RADIALS = Array.from({ length: 8 }, (_, i) => {
  const a = (Math.PI / 4) * i + Math.PI / 8;
  return {
    x2: (12 + Math.cos(a) * 9.4).toFixed(2),
    y2: (12 + Math.sin(a) * 9.4).toFixed(2),
  };
});

export function KumoWebMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.4" />
      <circle cx="12" cy="12" r="5" />
      {RADIALS.map((r, i) => (
        <line key={i} x1="12" y1="12" x2={r.x2} y2={r.y2} />
      ))}
      <circle cx="15.5" cy="8.5" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
