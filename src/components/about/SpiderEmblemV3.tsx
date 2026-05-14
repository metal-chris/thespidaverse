"use client";

/**
 * Spider Emblem V3 — Parametric Generation
 *
 * Each spider is defined by parameters (body shape, joint angles,
 * segment lengths) and the SVG paths are computed mathematically.
 * This ensures precise symmetry, proper joint articulation, and
 * consistent proportions.
 */

interface EmblemProps {
  size?: number;
  className?: string;
}

// ── Math helpers ──

const rad = (deg: number) => (deg * Math.PI) / 180;
const px = (n: number) => Math.round(n * 100) / 100;

interface LegParams {
  /** Angle from body center (0 = right, 90 = up) */
  angle: number;
  /** Length of first segment (femur) */
  seg1: number;
  /** Angle change at first joint (positive = bend outward) */
  joint1: number;
  /** Length of second segment (tibia) */
  seg2: number;
  /** Angle change at second joint */
  joint2?: number;
  /** Length of third segment (tarsus) — optional */
  seg3?: number;
  /** Width at body attachment */
  widthBase: number;
  /** Width at tip */
  widthTip: number;
}

interface SpiderParams {
  cx: number;
  cy: number;
  /** Body as SVG path string */
  bodyPath: string;
  /** Leg definitions — only need left side, right is mirrored */
  legs: LegParams[];
}

function buildLegPath(
  cx: number, cy: number, attachY: number,
  leg: LegParams, side: "left" | "right"
): string {
  const mirror = side === "left" ? -1 : 1;
  const baseAngle = leg.angle * mirror;

  // Compute joint positions
  const a1 = rad(90 - baseAngle);
  const x0 = cx + mirror * 2; // slight offset from center
  const y0 = cy + attachY;

  const x1 = x0 + Math.cos(a1) * leg.seg1 * mirror;
  const y1 = y0 - Math.sin(a1) * leg.seg1;

  const a2 = rad(90 - baseAngle - leg.joint1 * mirror);
  const x2 = x1 + Math.cos(a2) * leg.seg2 * mirror;
  const y2 = y1 - Math.sin(a2) * leg.seg2;

  let x3 = x2, y3 = y2;
  if (leg.seg3 && leg.joint2 !== undefined) {
    const a3 = rad(90 - baseAngle - leg.joint1 * mirror - leg.joint2 * mirror);
    x3 = x2 + Math.cos(a3) * leg.seg3 * mirror;
    y3 = y2 - Math.sin(a3) * leg.seg3;
  }

  // Build filled polygon with taper
  const wb = leg.widthBase;
  const wm = (leg.widthBase + leg.widthTip) / 2;
  const wt = leg.widthTip;

  const perpAngle1 = a1 + Math.PI / 2;
  const perpAngle2 = a2 + Math.PI / 2;

  // Outer edge (going out)
  const ox0 = px(x0 + Math.cos(perpAngle1) * wb);
  const oy0 = px(y0 - Math.sin(perpAngle1) * wb);
  const ox1 = px(x1 + Math.cos(perpAngle1) * wm);
  const oy1 = px(y1 - Math.sin(perpAngle1) * wm);
  const ox2 = px(x2 + Math.cos(perpAngle2) * wt);
  const oy2 = px(y2 - Math.sin(perpAngle2) * wt);

  // Inner edge (coming back)
  const ix0 = px(x0 - Math.cos(perpAngle1) * wb);
  const iy0 = px(y0 + Math.sin(perpAngle1) * wb);
  const ix1 = px(x1 - Math.cos(perpAngle1) * wm);
  const iy1 = px(y1 + Math.sin(perpAngle1) * wm);
  const ix2 = px(x2 - Math.cos(perpAngle2) * wt);
  const iy2 = px(y2 + Math.sin(perpAngle2) * wt);

  if (leg.seg3 && leg.joint2 !== undefined) {
    const perpAngle3 = rad(90 - baseAngle - leg.joint1 * mirror - leg.joint2 * mirror) + Math.PI / 2;
    const ox3 = px(x3 + Math.cos(perpAngle3) * (wt * 0.3));
    const oy3 = px(y3 - Math.sin(perpAngle3) * (wt * 0.3));
    const ix3 = px(x3 - Math.cos(perpAngle3) * (wt * 0.3));
    const iy3 = px(y3 + Math.sin(perpAngle3) * (wt * 0.3));
    return `M${ox0},${oy0} L${ox1},${oy1} L${ox2},${oy2} L${ox3},${oy3} L${ix3},${iy3} L${ix2},${iy2} L${ix1},${iy1} L${ix0},${iy0} Z`;
  }

  // Tip point (sharp)
  const tipX = px(leg.seg3 ? x3 : x2);
  const tipY = px(leg.seg3 ? y3 : y2);

  return `M${ox0},${oy0} L${ox1},${oy1} L${ox2},${oy2} L${tipX},${tipY} L${ix2},${iy2} L${ix1},${iy1} L${ix0},${iy0} Z`;
}

function ParametricSpider({ params, size = 80, className = "" }: { params: SpiderParams; size?: number; className?: string }) {
  const { cx, cy, bodyPath, legs } = params;

  const legPaths: string[] = [];
  legs.forEach((leg, i) => {
    // Compute attachment Y offset based on leg index
    const attachOffsets = [-10, -4, 4, 10]; // spread along body
    const attachY = attachOffsets[i] || 0;

    legPaths.push(buildLegPath(cx, cy, attachY, leg, "left"));
    legPaths.push(buildLegPath(cx, cy, attachY, leg, "right"));
  });

  return (
    <svg viewBox="0 0 80 80" width={size} height={size} className={className} fill="currentColor" aria-hidden="true">
      <path d={bodyPath} />
      {legPaths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </svg>
  );
}

// ── Spider Definitions ──

/** V3-A: Civil War style — unified body, pass-through leg lines */
const civilWarParams: SpiderParams = {
  cx: 40, cy: 38,
  bodyPath: "M40 14 C47 14 50 20 50 28 L48 40 L44 52 L40 58 L36 52 L32 40 L30 28 C30 20 33 14 40 14 Z",
  legs: [
    { angle: 55, seg1: 16, joint1: -30, seg2: 18, widthBase: 1.8, widthTip: 0.6 },
    { angle: 20, seg1: 18, joint1: -15, seg2: 20, widthBase: 1.4, widthTip: 0.5 },
    { angle: -15, seg1: 18, joint1: 20, seg2: 18, widthBase: 1.4, widthTip: 0.5 },
    { angle: -50, seg1: 16, joint1: 35, seg2: 18, widthBase: 1.8, widthTip: 0.6 },
  ],
};

/** V3-B: Iron Spider — angular head, diamond body, aggressive zigzag */
const ironSpiderParams: SpiderParams = {
  cx: 40, cy: 38,
  bodyPath: "M40 12 L48 22 L40 28 L32 22 Z M40 32 L46 42 L40 56 L34 42 Z M38 28 L42 28 L42 32 L38 32 Z",
  legs: [
    { angle: 60, seg1: 14, joint1: -40, seg2: 12, joint2: -20, seg3: 8, widthBase: 2.2, widthTip: 0.5 },
    { angle: 25, seg1: 16, joint1: -25, seg2: 14, joint2: 15, seg3: 6, widthBase: 1.6, widthTip: 0.4 },
    { angle: -20, seg1: 16, joint1: 30, seg2: 12, joint2: -15, seg3: 6, widthBase: 1.6, widthTip: 0.4 },
    { angle: -55, seg1: 14, joint1: 40, seg2: 12, joint2: 20, seg3: 8, widthBase: 2.2, widthTip: 0.5 },
  ],
};

/** V3-C: Miles PS5 — unified body with waist, fangs, connected legs */
const milesParams: SpiderParams = {
  cx: 40, cy: 38,
  bodyPath: "M40 10 L43 14 L46 12 L44 18 C48 22 48 26 46 30 L44 34 C46 36 48 40 48 44 L46 54 C44 60 42 62 40 64 C38 62 36 60 34 54 L32 44 C32 40 34 36 36 34 L34 30 C32 26 32 22 36 18 L34 12 L37 14 L40 10 Z",
  legs: [
    { angle: 58, seg1: 14, joint1: -35, seg2: 14, widthBase: 2.0, widthTip: 0.5 },
    { angle: 22, seg1: 16, joint1: -20, seg2: 16, widthBase: 1.5, widthTip: 0.4 },
    { angle: -18, seg1: 16, joint1: 25, seg2: 14, widthBase: 1.5, widthTip: 0.4 },
    { angle: -52, seg1: 14, joint1: 38, seg2: 16, widthBase: 2.0, widthTip: 0.5 },
  ],
};

/** V3-D: No Way Home — heart head, teardrop body, sharp jagged legs */
const nwhParams: SpiderParams = {
  cx: 40, cy: 38,
  bodyPath: "M40 12 C46 12 52 16 52 22 C52 26 48 30 40 32 C32 30 28 26 28 22 C28 16 34 12 40 12 Z M40 36 C44 36 46 40 46 44 L44 52 C42 58 41 60 40 62 C39 60 38 58 36 52 L34 44 C34 40 36 36 40 36 Z",
  legs: [
    { angle: 60, seg1: 12, joint1: -45, seg2: 10, joint2: -25, seg3: 10, widthBase: 1.8, widthTip: 0.4 },
    { angle: 25, seg1: 14, joint1: -20, seg2: 12, joint2: 25, seg3: 8, widthBase: 1.3, widthTip: 0.3 },
    { angle: -20, seg1: 14, joint1: 25, seg2: 12, joint2: -20, seg3: 8, widthBase: 1.3, widthTip: 0.3 },
    { angle: -55, seg1: 12, joint1: 45, seg2: 10, joint2: 25, seg3: 10, widthBase: 1.8, widthTip: 0.4 },
  ],
};

/** V3-E: The Spidaverse — our signature hybrid */
const spidaverseParams: SpiderParams = {
  cx: 40, cy: 38,
  bodyPath: "M40 13 C46 13 49 20 48 28 C47 34 46 40 44 48 C43 53 41 58 40 60 C39 58 37 53 36 48 C34 40 33 34 32 28 C31 20 34 13 40 13 Z",
  legs: [
    { angle: 58, seg1: 14, joint1: -38, seg2: 12, joint2: -18, seg3: 8, widthBase: 2.0, widthTip: 0.4 },
    { angle: 22, seg1: 16, joint1: -18, seg2: 14, joint2: 12, seg3: 6, widthBase: 1.4, widthTip: 0.3 },
    { angle: -18, seg1: 16, joint1: 22, seg2: 14, joint2: -12, seg3: 6, widthBase: 1.4, widthTip: 0.3 },
    { angle: -54, seg1: 14, joint1: 38, seg2: 12, joint2: 18, seg3: 8, widthBase: 2.0, widthTip: 0.4 },
  ],
};

// ── Exported Components ──

export function SpiderV3A(props: EmblemProps) {
  return <ParametricSpider params={civilWarParams} {...props} />;
}
export function SpiderV3B(props: EmblemProps) {
  return <ParametricSpider params={ironSpiderParams} {...props} />;
}
export function SpiderV3C(props: EmblemProps) {
  return <ParametricSpider params={milesParams} {...props} />;
}
export function SpiderV3D(props: EmblemProps) {
  return <ParametricSpider params={nwhParams} {...props} />;
}
export function SpiderV3E(props: EmblemProps) {
  return <ParametricSpider params={spidaverseParams} {...props} />;
}

/** Preview grid */
export function SpiderEmblemV3Preview() {
  const variants = [
    { name: "V3-A: Civil War", Component: SpiderV3A, desc: "Unified body, articulated taper" },
    { name: "V3-B: Iron Spider", Component: SpiderV3B, desc: "Angular head+diamond, 3-joint zigzag" },
    { name: "V3-C: Miles PS5", Component: SpiderV3C, desc: "Fangs, waist, connected legs" },
    { name: "V3-D: No Way Home", Component: SpiderV3D, desc: "Heart head, teardrop, jagged 3-joint" },
    { name: "V3-E: The Spidaverse", Component: SpiderV3E, desc: "Signature hybrid, best of all" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {variants.map(({ name, Component, desc }) => (
        <div key={name} className="rounded-xl border border-border bg-card p-6 text-center space-y-4">
          <h3 className="font-mono text-xs uppercase tracking-wider text-accent">{name}</h3>
          <p className="text-[10px] text-muted-foreground">{desc}</p>
          <div className="flex items-center justify-center gap-4">
            <div className="text-foreground">
              <Component size={80} />
              <span className="block text-[9px] text-muted-foreground mt-1">80px</span>
            </div>
            <div className="text-foreground">
              <Component size={32} />
              <span className="block text-[9px] text-muted-foreground mt-1">32px</span>
            </div>
            <div className="text-foreground">
              <Component size={16} />
              <span className="block text-[9px] text-muted-foreground mt-1">16px</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 bg-accent/10 rounded-lg p-3">
            <div className="text-accent"><Component size={48} /></div>
            <div className="text-white bg-black rounded-lg p-2"><Component size={32} /></div>
            <div className="text-black bg-white rounded-lg p-2"><Component size={32} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}
