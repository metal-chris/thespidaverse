"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme, toggleRef } = useTheme();
  const isVenom = theme === "venom";

  return (
    <button
      onClick={(e) => toggleTheme(e)}
      ref={toggleRef as React.RefObject<HTMLButtonElement>}
      className="spider-toggle spidey-sense-hover relative w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
      aria-label={`Switch to ${isVenom ? "Miles" : "Venom"} mode`}
      title={`Switch to ${isVenom ? "Miles" : "Venom"} mode`}
    >
      <svg
        viewBox="0 0 40 40"
        className="w-7 h-7"
        fill="currentColor"
        aria-hidden="true"
      >
        {isVenom ? (
          /* Venom spider — angular, aggressive */
          <g>
            <ellipse cx="20" cy="16" rx="5" ry="6" />
            <ellipse cx="20" cy="27" rx="4" ry="5" />
            <rect x="19" y="21" width="2" height="3" />
            {/* Legs */}
            <line x1="15" y1="14" x2="4" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="25" y1="14" x2="36" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="14" y1="17" x2="2" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="26" y1="17" x2="38" y2="16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="15" y1="20" x2="3" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="25" y1="20" x2="37" y2="26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="27" x2="5" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="24" y1="27" x2="35" y2="35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        ) : (
          /* Miles spider — classic, rounder */
          <g>
            <ellipse cx="20" cy="15" rx="4.5" ry="5.5" />
            <ellipse cx="20" cy="26" rx="3.5" ry="5" />
            <rect x="19" y="20" width="2" height="2" rx="0.5" />
            {/* Legs — curved */}
            <path d="M16 13 Q10 8 5 7" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M24 13 Q30 8 35 7" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M15 16 Q8 14 3 15" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M25 16 Q32 14 37 15" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M15 19 Q9 23 4 25" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M25 19 Q31 23 36 25" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M17 26 Q11 31 6 34" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            <path d="M23 26 Q29 31 34 34" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </button>
  );
}
