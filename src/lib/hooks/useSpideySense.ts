"use client";

import { useCallback, useRef, useEffect } from "react";

interface SpideySenseOptions {
  /** When to trigger the animation */
  triggerOn?: "hover" | "focus" | "both";
  /** Whether the effect is active (default: true) */
  active?: boolean;
}

/**
 * Hook that applies the spidey-sense hover/focus animation to any element.
 * Returns a ref callback to attach to the target element.
 *
 * @example
 * const senseRef = useSpideySense({ triggerOn: 'both' });
 * <button ref={senseRef}>Click me</button>
 */
export function useSpideySense(options: SpideySenseOptions = {}) {
  const { triggerOn = "both", active = true } = options;
  const elementRef = useRef<HTMLElement | null>(null);

  const refCallback = useCallback(
    (node: HTMLElement | null) => {
      // Clean up previous element
      if (elementRef.current) {
        elementRef.current.classList.remove("spidey-sense-hover");
      }

      elementRef.current = node;

      if (node && active) {
        node.classList.add("spidey-sense-hover");

        if (triggerOn === "hover") {
          node.dataset.spideySense = "hover";
        } else if (triggerOn === "focus") {
          node.dataset.spideySense = "focus";
        } else {
          node.dataset.spideySense = "both";
        }
      }
    },
    [active, triggerOn]
  );

  // Update class when active changes
  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (active) {
      el.classList.add("spidey-sense-hover");
    } else {
      el.classList.remove("spidey-sense-hover");
    }
  }, [active]);

  return refCallback;
}
