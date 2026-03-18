"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { SymbioteOverlay } from "./SymbioteOverlay";

type Theme = "miles" | "venom";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: (e?: React.MouseEvent) => void;
  setTheme: (theme: Theme) => void;
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
  const [mounted, setMounted] = useState(false);
  const [transition, setTransition] = useState<{
    direction: "to-venom" | "to-miles";
    origin: { x: number; y: number };
  } | null>(null);
  const toggleRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("spidaverse-theme") as Theme | null;
    if (stored && (stored === "miles" || stored === "venom")) {
      setThemeState(stored);
      document.documentElement.setAttribute("data-theme", stored === "venom" ? "venom" : "");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setThemeState("venom");
      document.documentElement.setAttribute("data-theme", "venom");
    }
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("spidaverse-theme", newTheme);
    document.documentElement.setAttribute(
      "data-theme",
      newTheme === "venom" ? "venom" : ""
    );
  }, []);

  const toggleTheme = useCallback(
    (e?: React.MouseEvent) => {
      const next = theme === "miles" ? "venom" : "miles";
      const direction: "to-venom" | "to-miles" = next === "venom" ? "to-venom" : "to-miles";

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
        // Instant swap for reduced motion
        setTheme(next);
        return;
      }

      // Trigger tendril animation, swap theme partway through
      setTransition({ direction, origin });

      // Swap theme at ~40% through the animation for smooth visual
      const swapDelay = direction === "to-venom" ? 250 : 200;
      setTimeout(() => setTheme(next), swapDelay);
    },
    [theme, setTheme]
  );

  const handleTransitionComplete = useCallback(() => {
    setTransition(null);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, toggleRef }}>
      {children}
      {mounted && transition && (
        <SymbioteOverlay
          direction={transition.direction}
          origin={transition.origin}
          onComplete={handleTransitionComplete}
        />
      )}
    </ThemeContext.Provider>
  );
}
