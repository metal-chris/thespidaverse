"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
  /** Set only when a section opener follows this heading — an image placed
      directly beneath it. Most headings have none, and most articles have
      none at all, so every consumer treats this as absent by default. */
  imageUrl?: string;
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

  const hasAnyImage = headings.some((h) => h.imageUrl);
  const activeImage = headings.find((h) => h.id === activeId)?.imageUrl;

  if (!headings.length) return null;

  return (
    /* The list has to scroll inside its own column. Sticky pins this nav 96px
       from the top and it grows to whatever the heading count needs — 720px
       for an 18-heading article — so on any viewport under about 820px the
       bottom entries sat below the fold with no way to reach them. Scrolling
       the page does not help: sticky holds the same offset, so the clipped
       entries stayed clipped no matter where you were in the article.

       8rem rather than the 6rem of `top-24` so the list ends clear of the
       bottom edge instead of flush against it. `overscroll-contain` keeps a
       scroll that reaches the end of the list from continuing on to the
       article behind it. */
    <nav
      className="sticky top-24 flex max-h-[calc(100vh-8rem)] flex-col"
      aria-label="Table of contents"
    >
      <p className="flex-none text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        In This Article
      </p>

      {/* The section opener for wherever you currently are.
          One slot, not a thumbnail per row: the list is already 720px on an
          18-heading article, and a thumbnail on each of the seven rows that
          have one would push it past the viewport again.

          Rendered only when the article has openers at all, so the 53 of 55
          articles with none are untouched. The box keeps its height whether or
          not the active section has an image, because appearing and
          disappearing would shove the list up and down as you read. */}
      {hasAnyImage && (
        <div className="mb-3 flex-none overflow-hidden rounded border border-border bg-muted/20 aspect-video">
          {activeImage ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={activeImage}
              src={activeImage}
              alt=""
              className="h-full w-full object-cover animate-in fade-in duration-300"
            />
          ) : null}
        </div>
      )}

      <ul className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain text-sm">
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
