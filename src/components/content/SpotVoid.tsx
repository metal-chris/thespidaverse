"use client";

/**
 * SpotVoid — Animated background inspired by Spot from Spider-Man: Across the Spider-Verse.
 *
 * Renders floating black spots (interdimensional portals) drifting across a white void.
 * A couple of "portal" spots glow faintly with the site's accent color, hinting at
 * a way back to the user's home dimension.
 *
 * Pure CSS animations (no canvas/RAF) — follows codebase patterns.
 */

const DRIFT_ANIMATIONS = [
  "spot-drift-1",
  "spot-drift-2",
  "spot-drift-3",
  "spot-drift-4",
];

interface Spot {
  id: number;
  size: number;
  x: number; // % from left
  y: number; // % from top
  drift: string;
  driftDuration: number; // seconds
  delay: number; // seconds
  pulse: boolean;
  glow: boolean;
  opacity: number;
}

// Deterministic spots — no useEffect/useState needed, avoids hydration mismatch
const spots: Spot[] = [
  // Large portal spots (with glow)
  { id: 1, size: 72, x: 15, y: 25, drift: DRIFT_ANIMATIONS[0], driftDuration: 18, delay: 0, pulse: true, glow: true, opacity: 0.9 },
  { id: 2, size: 56, x: 78, y: 60, drift: DRIFT_ANIMATIONS[2], driftDuration: 22, delay: -3, pulse: true, glow: true, opacity: 0.85 },
  // Medium spots
  { id: 3, size: 44, x: 55, y: 15, drift: DRIFT_ANIMATIONS[1], driftDuration: 20, delay: -5, pulse: false, glow: false, opacity: 0.8 },
  { id: 4, size: 38, x: 30, y: 70, drift: DRIFT_ANIMATIONS[3], driftDuration: 24, delay: -8, pulse: true, glow: false, opacity: 0.75 },
  { id: 5, size: 48, x: 85, y: 20, drift: DRIFT_ANIMATIONS[0], driftDuration: 19, delay: -2, pulse: false, glow: false, opacity: 0.7 },
  { id: 6, size: 32, x: 10, y: 55, drift: DRIFT_ANIMATIONS[2], driftDuration: 26, delay: -10, pulse: false, glow: false, opacity: 0.65 },
  { id: 7, size: 40, x: 65, y: 80, drift: DRIFT_ANIMATIONS[1], driftDuration: 21, delay: -4, pulse: true, glow: false, opacity: 0.7 },
  // Small spots — scattered filler
  { id: 8, size: 20, x: 42, y: 40, drift: DRIFT_ANIMATIONS[3], driftDuration: 16, delay: -6, pulse: false, glow: false, opacity: 0.5 },
  { id: 9, size: 16, x: 90, y: 45, drift: DRIFT_ANIMATIONS[0], driftDuration: 28, delay: -12, pulse: false, glow: false, opacity: 0.45 },
  { id: 10, size: 12, x: 25, y: 10, drift: DRIFT_ANIMATIONS[2], driftDuration: 30, delay: -7, pulse: false, glow: false, opacity: 0.4 },
  { id: 11, size: 24, x: 72, y: 35, drift: DRIFT_ANIMATIONS[1], driftDuration: 17, delay: -1, pulse: false, glow: false, opacity: 0.55 },
  { id: 12, size: 14, x: 5, y: 85, drift: DRIFT_ANIMATIONS[3], driftDuration: 25, delay: -9, pulse: false, glow: false, opacity: 0.35 },
  { id: 13, size: 10, x: 50, y: 90, drift: DRIFT_ANIMATIONS[0], driftDuration: 32, delay: -14, pulse: false, glow: false, opacity: 0.3 },
  { id: 14, size: 18, x: 35, y: 50, drift: DRIFT_ANIMATIONS[2], driftDuration: 23, delay: -11, pulse: false, glow: false, opacity: 0.5 },
  { id: 15, size: 8, x: 60, y: 5, drift: DRIFT_ANIMATIONS[1], driftDuration: 34, delay: -16, pulse: false, glow: false, opacity: 0.25 },
  { id: 16, size: 28, x: 48, y: 65, drift: DRIFT_ANIMATIONS[3], driftDuration: 20, delay: -3, pulse: false, glow: false, opacity: 0.6 },
  { id: 17, size: 10, x: 18, y: 42, drift: DRIFT_ANIMATIONS[0], driftDuration: 27, delay: -13, pulse: false, glow: false, opacity: 0.3 },
];

export function SpotVoid() {
  return (
    <div className="spot-void absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {spots.map((spot) => {
        const animations: string[] = [
          `${spot.drift} ${spot.driftDuration}s ease-in-out infinite`,
        ];
        if (spot.pulse) {
          animations.push(`spot-pulse ${spot.driftDuration * 0.3}s ease-in-out infinite`);
        }
        if (spot.glow) {
          animations.push(`spot-glow ${spot.driftDuration * 0.4}s ease-in-out infinite`);
        }

        return (
          <div
            key={spot.id}
            data-spot
            style={{
              position: "absolute",
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              width: spot.size,
              height: spot.size,
              borderRadius: "50%",
              // Radial gradient gives the portal depth — solid center fading to feathered edge
              background: `radial-gradient(circle, rgba(0,0,0,${spot.opacity}) 0%, rgba(0,0,0,${spot.opacity * 0.8}) 50%, rgba(0,0,0,0) 70%)`,
              animation: animations.join(", "),
              animationDelay: `${spot.delay}s`,
              willChange: "transform",
            }}
          />
        );
      })}
    </div>
  );
}
