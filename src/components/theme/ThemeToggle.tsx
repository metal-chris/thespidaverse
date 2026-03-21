"use client";

import { useTheme } from "./ThemeProvider";
import { WebSpinner } from "@/components/ui/WebSpinner";

export function ThemeToggle() {
  const { theme, toggleTheme, toggleRef } = useTheme();
  const nextTheme = theme === "miles" ? "Peter" : theme === "peter" ? "Venom" : "Miles";

  return (
    <button
      onClick={(e) => toggleTheme(e)}
      ref={toggleRef as React.RefObject<HTMLButtonElement>}
      className="spider-toggle spidey-sense-hover relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <WebSpinner size="sm" className="text-foreground" />
    </button>
  );
}
