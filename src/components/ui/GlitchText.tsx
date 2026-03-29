import type { ReactNode } from "react";

interface GlitchTextProps {
  children: ReactNode;
  /** Plain-text version for the pseudo-element copies. Required when children contain JSX. */
  dataText?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "span" | "p";
  className?: string;
}

/**
 * GlitchText — Spider-Verse dimension-hop glitch effect on text.
 * Uses red/blue shifted pseudo-element copies via CSS data-text attribute.
 * Subtle — glitch fires every ~6s for a brief chromatic flicker.
 * Pure CSS, no client JS needed.
 *
 * Accepts plain strings or JSX children. If children are JSX,
 * pass dataText with the plain-text equivalent for the pseudo copies.
 */
export function GlitchText({ children, dataText, as: Tag = "h1", className = "" }: GlitchTextProps) {
  const text = dataText ?? (typeof children === "string" ? children : "");
  return (
    <Tag className={`glitch-text ${className}`} data-text={text}>
      {children}
    </Tag>
  );
}
