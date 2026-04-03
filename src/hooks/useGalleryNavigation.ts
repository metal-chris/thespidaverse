"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Gallery Navigation Hook — Split-Axis
 *
 * Vertical axis (scroll Y, swipe Y, Up/Down keys) → navigate between pieces
 * Horizontal axis (scroll X, swipe X, Left/Right keys) → navigate within carousel
 *
 * State machine per axis: idle → gesture_started → animating → cooldown → idle
 */

type NavState = "idle" | "gesture_started" | "animating" | "cooldown";
type NavDirection = "next" | "prev" | null;

interface UseGalleryNavigationOptions {
  totalPieces: number;
  initialIndex: number;
  animationDuration?: number;
  cooldownDuration?: number;
  wheelThreshold?: number;
  swipeThreshold?: number;
  gestureEndDelay?: number;
  /** Called when horizontal navigation fires (carousel prev/next) */
  onHorizontalNav?: (dir: "next" | "prev") => void;
}

interface UseGalleryNavigationReturn {
  activeIndex: number;
  previousIndex: number | null;
  direction: NavDirection;
  isAnimating: boolean;
  swipeProgress: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
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
  onHorizontalNav,
}: UseGalleryNavigationOptions): UseGalleryNavigationReturn {
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<NavDirection>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  // Vertical axis (piece navigation) state machine
  const vStateRef = useRef<NavState>("idle");
  const vGestureDirRef = useRef<number>(0);
  const vAccumulatedRef = useRef(0);
  const vGestureTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Horizontal axis (carousel navigation) state machine
  const hStateRef = useRef<NavState>("idle");
  const hGestureDirRef = useRef<number>(0);
  const hAccumulatedRef = useRef(0);
  const hGestureTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  const onHorizontalNavRef = useRef(onHorizontalNav);
  onHorizontalNavRef.current = onHorizontalNav;

  const canGoNext = activeIndex < totalPieces - 1;
  const canGoPrev = activeIndex > 0;

  // ── Vertical navigation (between pieces) ──
  const navigate = useCallback((dir: "next" | "prev") => {
    const idx = activeIndexRef.current;
    const newIndex = dir === "next" ? idx + 1 : idx - 1;
    if (newIndex < 0 || newIndex >= totalPieces) return;

    vStateRef.current = "animating";
    setPreviousIndex(idx);
    setDirection(dir);
    setIsAnimating(true);
    setActiveIndex(newIndex);

    setTimeout(() => {
      setIsAnimating(false);
      setDirection(null);
      setPreviousIndex(null);
      vStateRef.current = "cooldown";
      setTimeout(() => { vStateRef.current = "idle"; }, cooldownDuration);
    }, animationDuration);
  }, [totalPieces, animationDuration, cooldownDuration]);

  const goNext = useCallback(() => {
    if (vStateRef.current !== "idle") return;
    navigate("next");
  }, [navigate]);

  const goPrev = useCallback(() => {
    if (vStateRef.current !== "idle") return;
    navigate("prev");
  }, [navigate]);

  const goTo = useCallback((index: number) => {
    if (index < 0 || index >= totalPieces || index === activeIndexRef.current) return;
    if (vStateRef.current !== "idle") return;

    const dir = index > activeIndexRef.current ? "next" : "prev";
    vStateRef.current = "animating";
    setPreviousIndex(activeIndexRef.current);
    setDirection(dir);
    setIsAnimating(true);
    setActiveIndex(index);

    setTimeout(() => {
      setIsAnimating(false);
      setDirection(null);
      setPreviousIndex(null);
      vStateRef.current = "cooldown";
      setTimeout(() => { vStateRef.current = "idle"; }, cooldownDuration);
    }, animationDuration);
  }, [totalPieces, animationDuration, cooldownDuration]);

  // ── Horizontal navigation (carousel) ──
  const navigateHorizontal = useCallback((dir: "next" | "prev") => {
    onHorizontalNavRef.current?.(dir);

    // Brief cooldown to prevent rapid-fire
    hStateRef.current = "cooldown";
    setTimeout(() => { hStateRef.current = "idle"; }, cooldownDuration + 100);
  }, [cooldownDuration]);

  // ── Wheel handler — split Y vs X ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      const absY = Math.abs(e.deltaY);
      const absX = Math.abs(e.deltaX);

      // Determine dominant axis
      const isHorizontal = absX > absY && absX > 5;
      const isVertical = absY >= absX && absY > 2;

      if (isHorizontal) {
        // ── Horizontal → carousel ──
        e.preventDefault();
        const state = hStateRef.current;
        if (state === "animating" || state === "cooldown") return;

        const sign = e.deltaX > 0 ? 1 : -1;

        if (state === "idle") {
          hGestureDirRef.current = sign;
          hAccumulatedRef.current = absX;
          hStateRef.current = "gesture_started";
        } else if (state === "gesture_started") {
          if (sign !== hGestureDirRef.current) {
            clearTimeout(hGestureTimerRef.current);
            hGestureTimerRef.current = setTimeout(() => {
              hStateRef.current = "idle";
              hAccumulatedRef.current = 0;
            }, gestureEndDelay);
            return;
          }
          hAccumulatedRef.current += absX;
        }

        clearTimeout(hGestureTimerRef.current);
        hGestureTimerRef.current = setTimeout(() => {
          hStateRef.current = "idle";
          hAccumulatedRef.current = 0;
        }, gestureEndDelay);

        if (hAccumulatedRef.current >= wheelThreshold) {
          hAccumulatedRef.current = 0;
          navigateHorizontal(hGestureDirRef.current > 0 ? "next" : "prev");
        }
      } else if (isVertical) {
        // ── Vertical → piece navigation ──
        e.preventDefault();
        const state = vStateRef.current;
        if (state === "animating" || state === "cooldown") return;

        const delta = e.deltaY;
        const sign = delta > 0 ? 1 : -1;

        if (state === "idle") {
          vGestureDirRef.current = sign;
          vAccumulatedRef.current = absY;
          vStateRef.current = "gesture_started";
        } else if (state === "gesture_started") {
          if (sign !== vGestureDirRef.current) {
            clearTimeout(vGestureTimerRef.current);
            vGestureTimerRef.current = setTimeout(() => {
              vStateRef.current = "idle";
              vAccumulatedRef.current = 0;
            }, gestureEndDelay);
            return;
          }
          vAccumulatedRef.current += absY;
        }

        clearTimeout(vGestureTimerRef.current);
        vGestureTimerRef.current = setTimeout(() => {
          vStateRef.current = "idle";
          vAccumulatedRef.current = 0;
        }, gestureEndDelay);

        if (vAccumulatedRef.current >= wheelThreshold) {
          vAccumulatedRef.current = 0;
          navigate(vGestureDirRef.current > 0 ? "next" : "prev");
        }
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
      clearTimeout(vGestureTimerRef.current);
      clearTimeout(hGestureTimerRef.current);
    };
  }, [navigate, navigateHorizontal, wheelThreshold, gestureEndDelay]);

  // ── Touch handler — split Y vs X ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let touchStartY = 0;
    let touchStartX = 0;
    let touchAxis: "x" | "y" | null = null;
    let touchDelta = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (vStateRef.current === "animating") return;

      const touch = e.touches[0];
      touchStartY = touch.clientY;
      touchStartX = touch.clientX;
      touchAxis = null;
      touchDelta = 0;
      setSwipeProgress(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (vStateRef.current === "animating") return;

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

      if (touchAxis === "y") {
        // Vertical → piece navigation preview
        touchDelta = dy;
        const progress = Math.min(Math.abs(touchDelta) / swipeThreshold, 1);
        setSwipeProgress(progress * Math.sign(touchDelta));
        if (Math.abs(touchDelta) > 10) e.preventDefault();
      } else {
        // Horizontal → carousel (no preview animation needed)
        touchDelta = dx;
        if (Math.abs(touchDelta) > 10) e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (vStateRef.current === "animating") {
        setSwipeProgress(0);
        return;
      }

      if (Math.abs(touchDelta) >= swipeThreshold) {
        if (touchAxis === "y") {
          navigate(touchDelta > 0 ? "next" : "prev");
        } else if (touchAxis === "x") {
          navigateHorizontal(touchDelta > 0 ? "next" : "prev");
        }
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
  }, [navigate, navigateHorizontal, swipeThreshold]);

  // ── Keyboard — Up/Down for pieces, Left/Right for carousel ──
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (vStateRef.current !== "idle") return;
        e.preventDefault();
        navigate(e.key === "ArrowDown" ? "next" : "prev");
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (hStateRef.current !== "idle") return;
        e.preventDefault();
        navigateHorizontal(e.key === "ArrowRight" ? "next" : "prev");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, navigateHorizontal]);

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
