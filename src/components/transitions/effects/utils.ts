/**
 * Shared geometry utilities for transition effects.
 */

/** Evenly distribute start points around viewport perimeter (top → right → bottom → left) */
export function perimeterPoint(index: number, total: number, vw: number, vh: number): [number, number] {
  const perimeter = 2 * (vw + vh);
  const pos = (index / total) * perimeter;

  if (pos < vw) return [pos, 0];
  if (pos < vw + vh) return [vw, pos - vw];
  if (pos < 2 * vw + vh) return [vw - (pos - vw - vh), vh];
  return [0, vh - (pos - 2 * vw - vh)];
}

/** Sample a point on a quadratic bezier at parameter t */
export function quadBezier(
  t: number,
  p0x: number, p0y: number,
  cpx: number, cpy: number,
  p1x: number, p1y: number,
): [number, number] {
  const mt = 1 - t;
  return [
    mt * mt * p0x + 2 * mt * t * cpx + t * t * p1x,
    mt * mt * p0y + 2 * mt * t * cpy + t * t * p1y,
  ];
}

/** Get the tangent direction at parameter t on a quadratic bezier */
export function quadBezierTangent(
  t: number,
  p0x: number, p0y: number,
  cpx: number, cpy: number,
  p1x: number, p1y: number,
): [number, number] {
  const mt = 1 - t;
  const tx = 2 * mt * (cpx - p0x) + 2 * t * (p1x - cpx);
  const ty = 2 * mt * (cpy - p0y) + 2 * t * (p1y - cpy);
  const len = Math.sqrt(tx * tx + ty * ty) || 1;
  return [tx / len, ty / len];
}
