import { SpidaverseSpider } from "./SpidaverseMark";

interface WebSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: 24,
  md: 48,
  lg: 72,
};

// Number of radial spokes and concentric rings for the web
const SPOKES = 12;
const RINGS = 4;

/** Round to 2 decimal places to prevent hydration mismatches */
/** Fixed-string rounding — guarantees byte-identical output on server and client */
const f = (n: number) => n.toFixed(2);
const rnd = (n: number) => parseFloat(n.toFixed(2));

// Pre-compute all geometry per size so values are stable across server/client
function computeGeometry(s: number) {
  const r = rnd(s * 0.44);
  const center = s / 2;

  // Concentric web ring paths
  const webRings: { d: string; opacity: number; ring: number }[] = [];
  for (let ring = 1; ring <= RINGS; ring++) {
    const ringR = rnd((r * ring) / RINGS);
    const opacity = rnd(0.12 + (ring / RINGS) * 0.28);
    let d = "";
    for (let spoke = 0; spoke < SPOKES; spoke++) {
      const angle1 = (spoke * 360) / SPOKES - 90;
      const angle2 = ((spoke + 1) * 360) / SPOKES - 90;
      const rad1 = (angle1 * Math.PI) / 180;
      const rad2 = (angle2 * Math.PI) / 180;
      const x1 = f(center + Math.cos(rad1) * ringR);
      const y1 = f(center + Math.sin(rad1) * ringR);
      const x2 = f(center + Math.cos(rad2) * ringR);
      const y2 = f(center + Math.sin(rad2) * ringR);
      if (spoke === 0) d += `M ${x1} ${y1} `;
      d += `A ${f(ringR)} ${f(ringR)} 0 0 1 ${x2} ${y2} `;
    }
    d += "Z";
    webRings.push({ d, opacity, ring });
  }

  // Three outer arcs
  const outerArcs = [0, 120, 240].map((startAngle) => {
    const gap = 20;
    const arcSpan = 120 - gap;
    const a1 = ((startAngle + gap / 2 - 90) * Math.PI) / 180;
    const a2 = ((startAngle + gap / 2 + arcSpan - 90) * Math.PI) / 180;
    return {
      d: `M ${f(center + Math.cos(a1) * r)} ${f(center + Math.sin(a1) * r)} A ${f(r)} ${f(r)} 0 0 1 ${f(center + Math.cos(a2) * r)} ${f(center + Math.sin(a2) * r)}`,
      startAngle,
    };
  });

  // Radial spokes — use string values for SVG attributes to prevent hydration mismatch
  const spokes = Array.from({ length: SPOKES }).map((_, i) => {
    const angle = (i * 360) / SPOKES - 90;
    const rad = (angle * Math.PI) / 180;
    return {
      x2: f(center + Math.cos(rad) * r),
      y2: f(center + Math.sin(rad) * r),
      opacity: rnd(0.15 + (i % 2 === 0 ? 0.15 : 0)),
    };
  });

  return { r, center, webRings, outerArcs, spokes };
}

// Cache geometry per size at module level
const geometryCache: Record<number, ReturnType<typeof computeGeometry>> = {};
function getGeometry(s: number) {
  if (!geometryCache[s]) geometryCache[s] = computeGeometry(s);
  return geometryCache[s];
}

export function WebSpinner({ size = "md", className = "" }: WebSpinnerProps) {
  const s = sizes[size];
  const { r, center, webRings, outerArcs, spokes } = getGeometry(s);
  const strokeThin = size === "sm" ? 0.3 : size === "md" ? 0.5 : 0.6;
  const strokeRing = size === "sm" ? 1 : size === "md" ? 1.5 : 2;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className={`animate-spin ${className}`}
      style={{ animationDuration: "3s" }}
      role="status"
      aria-label="Loading"
    >
      {/* Three outer arcs with gaps — visible spin */}
      {outerArcs.map(({ d, startAngle }) => (
        <path
          key={`arc-${startAngle}`}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeRing}
          strokeLinecap="round"
          className="text-accent"
          opacity={0.6}
        />
      ))}

      {/* Radial spokes — full lines from center to edge */}
      {spokes.map(({ x2, y2, opacity }, i) => (
        <line
          key={`spoke-${i}`}
          x1={center}
          y1={center}
          x2={x2}
          y2={y2}
          stroke="currentColor"
          strokeWidth={strokeThin}
          className="text-muted-foreground"
          opacity={opacity}
        />
      ))}

      {/* Concentric web rings — arcs connecting spokes */}
      {webRings.map(({ d, opacity, ring }) => (
        <path
          key={`ring-${ring}`}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeThin}
          className="text-muted-foreground"
          opacity={opacity}
        />
      ))}

      {/* Spider logo in center — counter-rotates to stay upright */}
      {(() => {
        // ~72% of the dial, up from ~50%. The old hand-drawn spider had long
        // sweeping legs that filled its box; the mark's legs stop at the
        // octagon it no longer draws, so at the previous size it read as a
        // small dot adrift in the web. This lands its leg tips near the inner
        // ring, which is where the web reads as something the spider is
        // sitting ON rather than floating inside.
        const spiderSize = size === "sm" ? 17 : size === "md" ? 34 : 50;
        const scale = rnd(spiderSize / 32);
        const offset = center - spiderSize / 2;
        return (
          <g
            style={{ animation: "spin 3s linear infinite reverse", transformOrigin: `${center}px ${center}px` }}
          >
            {/* The spider is the BRAND MARK, not a bespoke drawing.
                This was a hand-built spider — ellipse body, eyes, eight curved
                leg paths — that shared nothing with the site's mark but the
                idea of a spider, so the loading screen showed a different
                animal from the header. SpidaverseSpider is the mark's own
                geometry with its octagon left off, because the web arcs
                spinning around it already are the enclosure.

                The web keeps spinning; the spider does NOT. It sits still at
                the centre while the web turns around it, which is the whole
                image — and it means the mark is never shown rotated, where its
                eight legs would smear.

                Scaled 120 -> 32 to land in the same box the old spider used.
                The mark is centred at (60,60) in its own space, so the scale
                alone puts it at (16,16) here; no re-centring, and no edited
                coordinates. */}
            <g
              transform={`translate(${offset}, ${offset}) scale(${scale})`}
              className="text-accent"
            >
              {/* Pulse glow behind the spider — kept from the original. */}
              <ellipse cx="16" cy="16" rx="8" ry="9" fill="currentColor" opacity="0">
                <animate attributeName="opacity" values="0;0.15;0" dur="2s" repeatCount="indefinite" />
                <animate attributeName="rx" values="8;11;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="ry" values="9;12;9" dur="2s" repeatCount="indefinite" />
              </ellipse>
              <g transform={`scale(${32 / 120})`}>
                <SpidaverseSpider />
              </g>
            </g>
          </g>
        );
      })()}
    </svg>
  );
}
