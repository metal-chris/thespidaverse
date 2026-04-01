"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn, capitalizeTag } from "@/lib/utils";
import { SlidersHorizontal, X, Check } from "lucide-react";
import type { Article, Tag } from "@/types";

const MAX_VISIBLE_TAGS = 15;

interface FilterDropdownProps {
  allTags: Tag[];
  articles?: Article[];
  selectedTags: Set<string>;
  onToggleTag: (slug: string) => void;
  onClear: () => void;
}

export function FilterDropdown({ allTags, articles, selectedTags, onToggleTag, onClear }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Count tag usage and sort by frequency
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (!articles) return counts;
    for (const article of articles) {
      for (const tag of article.tags ?? []) {
        counts.set(tag.slug.current, (counts.get(tag.slug.current) || 0) + 1);
      }
    }
    return counts;
  }, [articles]);

  const sortedTags = useMemo(() => {
    return [...allTags]
      .sort((a, b) => (tagCounts.get(b.slug.current) || 0) - (tagCounts.get(a.slug.current) || 0))
      .slice(0, MAX_VISIBLE_TAGS);
  }, [allTags, tagCounts]);

  const hasMoreTags = allTags.length > MAX_VISIBLE_TAGS;

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const activeCount = selectedTags.size;

  if (allTags.length === 0) return null;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger button */}
      <Button
        variant={activeCount > 0 ? "active" : "ghost"}
        size="sm"
        shape="rounded"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Filter</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-accent text-background text-[10px] font-bold">
            {activeCount}
          </span>
        )}
      </Button>

      {/* Clear button — shown inline when filters active */}
      {activeCount > 0 && (
        <Button
          variant="text"
          size="sm"
          shape="rounded"
          onClick={onClear}
          className="ml-1"
        >
          <X className="w-3 h-3" />
          Clear
        </Button>
      )}

      {/* Dropdown panel — 3 rows × 5 columns grid */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl shadow-black/20 p-3 w-[min(90vw,640px)]">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1">
            {sortedTags.map((tag, i) => {
              const isActive = selectedTags.has(tag.slug.current);
              const count = tagCounts.get(tag.slug.current) || 0;
              return (
                <button
                  key={tag._id}
                  onClick={() => onToggleTag(tag.slug.current)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs transition-colors text-left",
                    isActive
                      ? "bg-accent/15 text-accent font-medium"
                      : "text-foreground/80 hover:bg-muted/50"
                  )}
                  role="option"
                  aria-selected={isActive}
                >
                  <span className="text-muted-foreground/50 tabular-nums text-[10px] w-4 text-right shrink-0">
                    {i + 1}.
                  </span>
                  <span className="truncate">{capitalizeTag(tag.title)}</span>
                  <span className="text-muted-foreground/40 tabular-nums text-[10px] shrink-0">
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
          {hasMoreTags && (
            <Link
              href="/search"
              className="block text-center text-xs text-muted-foreground hover:text-accent transition-colors pt-2 mt-2 border-t border-border"
              onClick={() => setOpen(false)}
            >
              All tags →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
