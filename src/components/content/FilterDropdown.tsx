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

  // Sort tags by usage count, show top N
  const sortedTags = useMemo(() => {
    if (!articles || articles.length === 0) return allTags.slice(0, MAX_VISIBLE_TAGS);

    const counts = new Map<string, number>();
    for (const article of articles) {
      for (const tag of article.tags ?? []) {
        counts.set(tag.slug.current, (counts.get(tag.slug.current) || 0) + 1);
      }
    }

    return [...allTags]
      .sort((a, b) => (counts.get(b.slug.current) || 0) - (counts.get(a.slug.current) || 0))
      .slice(0, MAX_VISIBLE_TAGS);
  }, [allTags, articles]);

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

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 w-64 max-h-72 overflow-y-auto rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl shadow-black/20 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 pt-1 pb-2">
            Tags
          </p>
          <div className="space-y-0.5">
            {sortedTags.map((tag) => {
              const isActive = selectedTags.has(tag.slug.current);
              return (
                <button
                  key={tag._id}
                  onClick={() => onToggleTag(tag.slug.current)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-accent/15 text-accent font-medium"
                      : "text-foreground/80 hover:bg-muted/50"
                  )}
                  role="option"
                  aria-selected={isActive}
                >
                  <span>{capitalizeTag(tag.title)}</span>
                  {isActive && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>
              );
            })}
          </div>
          {hasMoreTags && (
            <Link
              href="/search"
              className="block text-center text-xs text-muted-foreground hover:text-accent transition-colors pt-2 pb-1 border-t border-border mt-2"
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
