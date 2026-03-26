"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Gallery Navigation Hook
 *
 * Converts all input types (mouse wheel, trackpad, touch swipe, keyboard)
 * into discrete "next/prev" navigation events via a gesture state machine.
 *
 * State machine: idle → gesture_started → animating → cooldown → idle
 *
 * Key behaviors:
 * - Direction locking: once a gesture starts in one direction, opposite deltas are ignored
 * - Inertia absorption: trackpad inertia is consumed after the first navigation fires
 * - Animation gating: no input accepted while transitioning
 * - Touch preview: optional drag feedback before committing to navigation
 */

type NavState = "idle" | "gesture_started" | "animating" | "cooldown";
type NavDirection = "next" | "prev" | null;

interface UseGalleryNavigationOptions {
  totalPieces: number;
  initialIndex: number;
  /** Duration of the crossfade/slide transition in ms */
  animationDuration?: number;
  /** Cooldown after animation completes before accepting input again */
  cooldownDuration?: number;
  /** Accumulated wheel delta needed to trigger navigation */
  wheelThreshold?: number;
  /** Minimum touch swipe distance in px to trigger navigation */
  swipeThreshold?: number;
  /** Time in ms without wheel events before gesture is considered ended */
  gestureEndDelay?: number;
}

interface UseGalleryNavigationReturn {
  activeIndex: number;
  previousIndex: number | null;
  direction: NavDirection;
  isAnimating: boolean;
  /** Percentage of swipe progress (0-1) for touch drag preview */
  swipeProgress: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
  /** Attach to the gallery container element ref */
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function useGalleryNavigation({
  totalPieces,
  initialIndex,
  animationDuration = 300,
  cooldownDuration = 80,
  wheelThreshold = 60,
  swipeThreshold = 50,
  gestureEndDelay = 150,
}: UseGalleryNavigationOptions): UseGalleryNavigationReturn {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<NavDirection>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Refs for state machine (not reactive — used in event handlers)
  const stateRef = useRef<NavState>("idle");
  const gestureDirectionRef = useRef<number>(0); // +1 = next, -1 = prev
  const accumulatedRef = useRef(0);
  const gestureEndTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const activeIndexRef = useRef(activeIndex);

  // Keep index ref in sync
  activeIndexRef.current = activeIndex;

  const canGoNext = activeIndex < totalPieces - 1;
  const canGoPrev = activeIndex > 0;

  // ── Core navigation function ──
  const navigate = useCallback((dir: "next" | "prev") => {
    const idx = activeIndexRef.current;
    const newIndex = dir === "next" ? idx + 1 : idx - 1;

    if (newIndex < 0 || newIndex >= totalPieces) return;

    stateRef.current = "animating";
    setPreviousIndex(idx);
    setDirection(dir);
    setIsAnimating(true);
    setActiveIndex(newIndex);

    // After animation completes → cooldown → idle
    setTimeout(() => {
      setIsAnimating(false);
      setDirection(null);
      setPreviousIndex(null);
      stateRef.current = "cooldown";

      setTimeout(() => {
        stateRef.current = "idle";
      }, cooldownDuration);
    }, animationDuration);
  }, [totalPieces, animationDuration, cooldownDuration]);

  const goNext = useCallback(() => {
    if (stateRef.current !== "idle") return;
    navigate("next");
  }, [navigate]);

  const goPrev = useCallback(() => {
    if (stateRef.current !== "idle") return;
    navigate("prev");
  }, [navigate]);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= totalPieces || index === activeIndexRef.current) return;
    if (stateRef.current !== "idle") return;

    const dir = index > activeIndexRef.current ? "next" : "prev";
    stateRef.current = "animating";
    setPreviousIndex(activeIndexRef.current);
    setDirection(dir);
    setIsAnimating(true);
    setActiveIndex(index);

    setTimeout(() => {
      setIsAnimating(false);
      setDirection(null);
      setPreviousIndex(null);
      stateRef.current = "cooldown";

      setTimeout(() => {
        stateRef.current = "idle";
      }, cooldownDuration);
    }, animationDuration);
  }, [totalPieces, animationDuration, cooldownDuration]);

  // ── Wheel handler (mouse + trackpad) ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      const state = stateRef.current;

      // Reject input during animation or cooldown
      if (state === "animating" || state === "cooldown") return;

      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (Math.abs(delta) < 2) return; // ignore micro-events

      const sign = delta > 0 ? 1 : -1;

      if (state === "idle") {
        // Start new gesture
        gestureDirectionRef.current = sign;
        accumulatedRef.current = Math.abs(delta);
        stateRef.current = "gesture_started";
      } else if (state === "gesture_started") {
        // Direction lock: ignore opposite deltas (inertia bounce-back)
        if (sign !== gestureDirectionRef.current) {
          // Reset gesture end timer but don't accumulate
          clearTimeout(gestureEndTimerRef.current);
          gestureEndTimerRef.current = setTimeout(() => {
            stateRef.current = "idle";
            accumulatedRef.current = 0;
          }, gestureEndDelay);
          return;
        }

        accumulatedRef.current += Math.abs(delta);
      }

      // Reset gesture-end timer on every event
      clearTimeout(gestureEndTimerRef.current);
      gestureEndTimerRef.current = setTimeout(() => {
        stateRef.current = "idle";
        accumulatedRef.current = 0;
      }, gestureEndDelay);

      // Check if threshold reached
      if (accumulatedRef.current >= wheelThreshold) {
        accumulatedRef.current = 0;
        const dir = gestureDirectionRef.current > 0 ? "next" : "prev";
        navigate(dir as "next" | "prev");
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      clearTimeout(gestureEndTimerRef.current);
    };
  }, [navigate, wheelThreshold, gestureEndDelay]);

  // ── Touch handler (mobile/tablet swipe) ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let touchStartX = 0;
    let touchAxis: "x" | "y" | null = null;
    let touchDelta = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (stateRef.current !== "idle") return;

      const touch = e.touches[0];
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
      touchAxis = null;
      touchDelta = 0;
      setSwipeProgress(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (stateRef.current !== "idle") return;

      const touch = e.touches[0];
      const dy = touchStartY - touch.clientY;
      const dx = touchStartX - touch.clientX;

      // Lock axis on first significant movement
      if (!touchAxis) {
        if (Math.abs(dy) > 10 || Math.abs(dx) > 10) {
          touchAxis = Math.abs(dy) > Math.abs(dx) ? "y" : "x";
        } else {
          return;
        }
      }

      touchDelta = touchAxis === "y" ? dy : dx;

      // Preview progress (clamped 0-1)
      const progress = Math.min(Math.abs(touchDelta) / swipeThreshold, 1);
      setSwipeProgress(progress * Math.sign(touchDelta));

      // Prevent native scroll
      if (Math.abs(touchDelta) > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (stateRef.current !== "idle") {
        setSwipeProgress(0);
        return;
      }

      if (Math.abs(touchDelta) >= swipeThreshold) {
        const dir = touchDelta > 0 ? "next" : "prev";
        navigate(dir);
      }

      setSwipeProgress(0);
      touchAxis = null;
      touchDelta = 0;
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate, swipeThreshold]);

  // ── Keyboard handler ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stateRef.current !== "idle") return;

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        navigate("next");
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        navigate("prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return {
    activeIndex,
    previousIndex,
    direction,
    isAnimating,
    swipeProgress,
    canGoNext,
    canGoPrev,
    goNext,
    goPrev,
    goTo,
    containerRef,
  };
}
