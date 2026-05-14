"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

// ── Desktop sticky sidebar ──

export function TableOfContents({ headings }: { headings: TocHeading[] }) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first heading that is intersecting (closest to top)
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [headings]);

  const handleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update URL hash without scroll jump
      window.history.replaceState(null, "", `#${id}`);
    }
  }, []);

  if (!headings.length) return null;

  return (
    <nav
      className="sticky top-24"
      aria-label="Table of contents"
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        In This Article
      </p>
      <ul className="space-y-1 text-sm">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => handleClick(e, h.id)}
                className={cn(
                  "block py-1 border-l-2 transition-colors duration-200 leading-snug",
                  h.level === 3 ? "pl-5" : "pl-3",
                  isActive
                    ? "border-accent text-accent font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

// ── Mobile collapsible TOC ──

export function MobileTOC({ headings }: { headings: TocHeading[] }) {
  if (!headings.length) return null;

  return (
    <details className="lg:hidden mb-6 rounded-lg border border-border bg-card/30 overflow-hidden">
      <summary className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors flex items-center justify-between">
        <span>Jump to section</span>
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4 transition-transform [[open]>&]:rotate-180"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </summary>
      <ul className="px-4 pb-3 space-y-1 text-sm">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                // Close details
                (e.currentTarget.closest("details") as HTMLDetailsElement)?.removeAttribute("open");
              }}
              className={cn(
                "block py-1 text-muted-foreground hover:text-accent transition-colors",
                h.level === 3 && "pl-3"
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
