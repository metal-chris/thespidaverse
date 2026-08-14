import { SpidaverseMark } from "./SpidaverseMark";
import { cn } from "@/lib/utils";

interface WebSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /**
   * Rotate. True for loading states, false where this is a static icon —
   * the theme toggle uses the same mark and must not spin.
   */
  spin?: boolean;
}

const sizes = { sm: 24, md: 48, lg: 72 } as const;

/**
 * The site's spider, wherever one is needed — loading screens, the theme
 * toggle, empty states.
 *
 * This used to be its OWN drawing: a twelve-spoke web with a hand-drawn
 * spider inside it, ellipse body and eight curved leg paths, sharing nothing
 * with the brand mark but the idea of a spider. Two spiders on one site is one
 * too many, and the drawn one was the weaker of them — it had eyes, curved
 * legs and no frame, so it read as a mascot next to a mark that is none of
 * those things.
 *
 * It is now SpidaverseMark. One geometry, whose containment and head-clearance
 * are proven by its generator, appearing at every size the site needs. The web
 * rings went with the old drawing on purpose: the mark carries its own
 * octagon, and a web behind a framed spider is two enclosures fighting.
 *
 * Rotation is the whole animation. It replaces a bespoke ring-draw sequence,
 * and it respects `prefers-reduced-motion` through the utility class rather
 * than a media query here.
 */
export function WebSpinner({ size = "md", className, spin = true }: WebSpinnerProps) {
  const px = sizes[size];
  return (
    <SpidaverseMark
      className={cn(spin && "animate-web-spin motion-reduce:animate-none", className)}
      style={{ width: px, height: px }}
    />
  );
}
