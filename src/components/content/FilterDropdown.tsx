"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn, capitalizeTag } from "@/lib/utils";
import { SlidersHorizontal, X, Check } from "lucide-react";
import type { Tag } from "@/types";

interface FilterDropdownProps {
  allTags: Tag[];
  selectedTags: Set<string>;
  onToggleTag: (slug: string) => void;
  onClear: () => void;
}

export function FilterDropdown({ allTags, selectedTags, onToggleTag, onClear }: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
            {allTags.map((tag) => {
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
        </div>
      )}
    </div>
  );
}
