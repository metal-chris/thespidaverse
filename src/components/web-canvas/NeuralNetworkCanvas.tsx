"use client";

import { useEffect, useRef, useCallback } from "react";
import { SpiderWebRenderer } from "./SpiderWebRenderer";
import type { Palette } from "./particle-config";

interface SpiderWebCanvasProps {
  reducedMotion: boolean;
  palette: Palette;
  onRendererReady?: (trigger: (x: number, y: number) => void) => void;
}

export function SpiderWebCanvas({ reducedMotion, palette, onRendererReady }: SpiderWebCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<SpiderWebRenderer | null>(null);
  const onRendererReadyRef = useRef(onRendererReady);
  onRendererReadyRef.current = onRendererReady;

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    rendererRef.current?.resize();
  }, []);

  // Sync palette changes into the renderer
  useEffect(() => {
    rendererRef.current?.setPalette(palette);
  }, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const renderer = new SpiderWebRenderer(canvas, reducedMotion, palette);
    rendererRef.current = renderer;
    renderer.start();

    onRendererReadyRef.current?.((x: number, y: number) => renderer.triggerStrike(x, y));

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      renderer.setMousePosition(e.clientX - r.left, e.clientY - r.top);
    };
    const handleMouseLeave = () => renderer.clearMouse();

    // Unified pointer event on window — canvas is behind content overlay
    // so we listen globally, same as mousemove
    const handlePointerDown = (e: PointerEvent) => {
      // Don't trigger strike when clicking interactive elements (buttons, inputs, links)
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "BUTTON" || tag === "INPUT" || tag === "A" || tag === "LABEL") return;
      const r = canvas.getBoundingClientRect();
      renderer.triggerStrike(e.clientX - r.left, e.clientY - r.top);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const r = canvas.getBoundingClientRect();
        renderer.setMousePosition(
          e.touches[0].clientX - r.left,
          e.touches[0].clientY - r.top
        );
      }
    };
    const handleTouchEnd = () => renderer.clearMouse();

    const handleVisibility = () => {
      if (document.hidden) renderer.stop();
      else renderer.start();
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      renderer.destroy();
      rendererRef.current = null;
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reducedMotion, resizeCanvas, palette]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Animated spider web background with electric effects"
      className="absolute inset-0 w-full h-full"
      style={{ display: "block" }}
    />
  );
}
