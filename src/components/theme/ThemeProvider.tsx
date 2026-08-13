"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { TransitionOverlay } from "@/components/transitions/TransitionOverlay";
import { PALETTE_KEY, MODE_KEY, readPref, writePref } from "@/lib/theme-cookie";

type Theme = "miles" | "peter" | "venom";
/** The second axis. Surface lightness, independent of accent palette. */
export type Mode = "dark" | "light";
type TransitionDirection = "to-venom" | "to-miles" | "to-peter";

/** Theme swaps during spinner hold phase (after 3s character animation) */
const SWAP_DELAYS: Record<TransitionDirection, number> = {
  "to-venom": 3200,
  "to-miles": 3200,
  "to-peter": 3200,
};

/** When transitions are disabled, just show a quick loading screen */
const QUICK_SWAP_DELAY = 500;

interface ThemeContextValue {
  theme: Theme;
  /** Surface lightness — the axis that used to be tangled into `theme`. */
  mode: Mode;
  toggleTheme: (e?: React.MouseEvent) => void;
  setTheme: (theme: Theme) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  toggleRef: React.RefObject<HTMLElement | null>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("miles");
  const [mode, setModeState] = useState<Mode>("dark");
  const [mounted, setMounted] = useState(false);
  const [transition, setTransition] = useState<{
    direction: TransitionDirection;
    origin: { x: number; y: number };
    quick: boolean;
  } | null>(null);
  const toggleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Palette: prefer the shared cookie (a sibling site under
    // .thespidaverse.com may have set it), then this origin's localStorage
    // for anyone who chose before the cookie existed.
    const cookiePalette = readPref(PALETTE_KEY);
    const stored = (cookiePalette ?? localStorage.getItem(PALETTE_KEY)) as Theme | null;
    if (stored === "miles" || stored === "peter" || stored === "venom") {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored === "miles" ? "" : stored);
      if (!cookiePalette) writePref(PALETTE_KEY, stored);
    }

    // Mode: an explicit choice wins; otherwise follow the OS. Every surface
    // was dark before this axis existed, so an unset preference must NOT
    // silently flip a returning visitor to light — only the OS asking for
    // light does that.
    const storedMode = readPref(MODE_KEY) ?? localStorage.getItem(MODE_KEY);
    const resolved: Mode =
      storedMode === "light" || storedMode === "dark"
        ? storedMode
        : window.matchMedia("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark";
    setModeState(resolved);
    document.documentElement.setAttribute("data-mode", resolved);
    setMounted(true);
  }, []);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    localStorage.setItem(MODE_KEY, next);
    writePref(MODE_KEY, next);
    document.documentElement.setAttribute("data-mode", next);
  }, []);

  const toggleMode = useCallback(() => {
    // Deliberately instant. The palette swap runs a character transition
    // because changing accent is a statement; flipping lightness is a comfort
    // control, and making someone sit through 3.2s of animation to dim a
    // screen would be hostile.
    setMode(mode === "dark" ? "light" : "dark");
  }, [mode, setMode]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(PALETTE_KEY, newTheme);
    writePref(PALETTE_KEY, newTheme);
    document.documentElement.setAttribute(
      "data-theme",
      newTheme === "miles" ? "" : newTheme
    );
  }, []);

  const toggleTheme = useCallback(
    (e?: React.MouseEvent) => {
      // Cycle: miles → peter → venom → miles
      const next = theme === "miles" ? "peter" : theme === "peter" ? "venom" : "miles";
      const direction = `to-${next}` as TransitionDirection;

      // Get origin from click event or toggle button position
      let origin = { x: window.innerWidth / 2, y: 40 };
      if (e) {
        origin = { x: e.clientX, y: e.clientY };
      } else if (toggleRef.current) {
        const rect = toggleRef.current.getBoundingClientRect();
        origin = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }

      // Check reduced motion preference
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        setTheme(next);
        return;
      }

      // Check if transitions are enabled (read directly from localStorage)
      const transitionsOn = localStorage.getItem("spidaverse-transitions") !== "false";

      if (transitionsOn) {
        // Full character animation + loading screen
        setTransition({ direction, origin, quick: false });
        setTimeout(() => setTheme(next), SWAP_DELAYS[direction]);
      } else {
        // Quick loading screen only (1s)
        setTransition({ direction, origin, quick: true });
        setTimeout(() => setTheme(next), QUICK_SWAP_DELAY);
      }
    },
    [theme, setTheme]
  );

  const handleTransitionComplete = useCallback(() => {
    setTransition(null);
  }, []);

  return (
    <ThemeContext.Provider
      value={{ theme, mode, toggleTheme, setTheme, setMode, toggleMode, toggleRef }}
    >
      {children}
      {mounted && transition && (
        <TransitionOverlay
          direction={transition.direction}
          origin={transition.origin}
          quick={transition.quick}
          onComplete={handleTransitionComplete}
        />
      )}
    </ThemeContext.Provider>
  );
}
