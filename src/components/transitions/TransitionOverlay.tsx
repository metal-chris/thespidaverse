"use client";

import { TransitionShell } from "./TransitionShell";
import { VenomStrike } from "./effects/VenomStrike";
import { WebShot } from "./effects/WebShot";
import { Venom } from "./effects/Venom";

export type TransitionDirection = "to-venom" | "to-miles" | "to-peter";

/** Per-direction visual configuration */
const DIRECTION_CONFIG: Record<
  TransitionDirection,
  {
    strokeColor: string;
    wipeColor: string;
    spinnerColor: string;
    totalDuration: number;
  }
> = {
  "to-miles": { strokeColor: "#FFD700", wipeColor: "#FFD700", spinnerColor: "rgba(0,0,0,0.5)", totalDuration: 4000 },
  "to-peter": { strokeColor: "#FFFFFF", wipeColor: "#FFFFFF", spinnerColor: "rgba(0,0,0,0.4)", totalDuration: 4000 },
  "to-venom": { strokeColor: "#0A0A0A", wipeColor: "#0A0A0A", spinnerColor: "rgba(255,255,255,0.6)", totalDuration: 4000 },
};

interface TransitionOverlayProps {
  direction: TransitionDirection;
  origin: { x: number; y: number };
  quick?: boolean;
  onComplete: () => void;
}

/**
 * Drop-in replacement for the old SymbioteOverlay.
 * Maps direction → effect component and wraps in TransitionShell.
 */
export function TransitionOverlay({ direction, origin, quick = false, onComplete }: TransitionOverlayProps) {
  const config = DIRECTION_CONFIG[direction];

  return (
    <TransitionShell
      origin={origin}
      quick={quick}
      wipeColor={config.wipeColor}
      spinnerColor={config.spinnerColor}
      totalDuration={config.totalDuration}
      onComplete={onComplete}
    >
      {({ phase, vw, vh }) => {
        if (phase !== "animate") return null;

        switch (direction) {
          case "to-miles":
            return <VenomStrike vw={vw} vh={vh} strokeColor={config.strokeColor} />;
          case "to-peter":
            return <WebShot vw={vw} vh={vh} strokeColor={config.strokeColor} />;
          case "to-venom":
            return <Venom vw={vw} vh={vh} fillColor={config.strokeColor} />;
        }
      }}
    </TransitionShell>
  );
}
