"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

/**
 * Surface lightness — the second of the three shared settings (palette, mode,
 * language), presented the way Kumo Club's teaser presents it so a visitor
 * meets one vocabulary across both sites.
 *
 * Separate from ThemeToggle on purpose. ThemeToggle cycles the ACCENT palette
 * and runs a full transition animation, because changing accent is a
 * statement. This is a comfort control: it flips instantly, with no overlay.
 * Making someone sit through 3.2s of character animation to dim a screen
 * would be hostile.
 *
 * The icon shows the mode you will GET, not the one you are in — a sun means
 * "go light". That is the convention Kumo's teaser uses, and a toggle that
 * shows its current state instead reads as a status light and gets clicked by
 * mistake.
 */
export function ModeToggle({ className }: { className?: string }) {
  const { mode, toggleMode } = useTheme();
  const goingTo = mode === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={toggleMode}
      aria-label={`Switch to ${goingTo} mode`}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
        className
      )}
    >
      {mode === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
