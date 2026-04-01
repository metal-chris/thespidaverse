"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { WebShot } from "@/components/transitions/effects/WebShot";
import { buttonClasses } from "@/components/ui/Button";

/**
 * "Swing Back Home" button for the 404 page.
 *
 * Flow: dark frosted backdrop fades in → WebShot expands over it → navigate home.
 * Uses createPortal to escape the 404 page's overflow-hidden container.
 */
export function SwingHomeLink() {
  const router = useRouter();
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setActive(true);
  }, []);

  // Navigate once the web has had time to fill the screen (~2.2s into 3s reveal)
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      router.push("/");
    }, 2200);
    return () => clearTimeout(timer);
  }, [active, router]);

  const vw = typeof document !== "undefined" ? document.documentElement.clientWidth : 1280;
  const vh = typeof document !== "undefined" ? document.documentElement.clientHeight : 800;

  const overlay = active ? (
    <div className="fixed inset-0 z-[9999] pointer-events-none" aria-hidden="true">
      {/* Dark frosted backdrop — dims the white void */}
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
        style={{ animation: "fadeIn 0.4s ease-out forwards" }}
      />

      {/* WebShot expands from center — white lines on dark backdrop */}
      <WebShot vw={vw} vh={vh} strokeColor="rgba(255,255,255,0.85)" />
    </div>
  ) : null;

  return (
    <>
      <a
        href="/"
        onClick={handleClick}
        className={buttonClasses({
          variant: "primary",
          size: "lg",
          shape: "rounded",
          className:
            "!bg-black !text-white !border-transparent hover:!bg-neutral-800 active:!bg-neutral-700",
        })}
      >
        Swing Back Home
      </a>

      {mounted && overlay && createPortal(overlay, document.body)}
    </>
  );
}
