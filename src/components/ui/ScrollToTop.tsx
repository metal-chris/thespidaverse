"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  const handleScroll = useCallback(() => {
    // Show after scrolling 400px
    setVisible(window.scrollY > 400);

    // Detect near-bottom (within 120px of the bottom)
    const scrollBottom = window.scrollY + window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    setAtBottom(docHeight - scrollBottom < 120);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      className={`
        fixed z-40
        right-[2px] md:right-[6px]
        w-8 h-8 md:w-7 md:h-7
        rounded-full
        bg-card/80 backdrop-blur-sm
        border border-border/60
        text-muted-foreground hover:text-accent hover:border-accent/40 hover:bg-card
        shadow-md shadow-black/15
        transition-all duration-300 ease-out
        flex items-center justify-center
        spidey-sense-hover
        ${visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}
        ${atBottom ? "bottom-20" : "bottom-6"}
      `}
    >
      <ArrowUp className="w-3.5 h-3.5 md:w-3 md:h-3" strokeWidth={2.5} />
    </button>
  );
}
