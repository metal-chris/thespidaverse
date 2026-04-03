"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { GalleryPiece } from "@/types";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "image", label: "Art" },
  { value: "video", label: "Videos" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "a-z", label: "A–Z" },
  { value: "z-a", label: "Z–A" },
];

interface GalleryFilterBarProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  activeSort: string;
  onSortChange: (sort: "newest" | "oldest" | "a-z" | "z-a") => void;
  pieces: GalleryPiece[];
  totalCount?: number;
}

export function GalleryFilterBar({
  activeType,
  onTypeChange,
  activeSort,
  onSortChange,
  pieces,
  totalCount,
}: GalleryFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {/* Type filter buttons */}
      {TYPE_OPTIONS.map((option) => {
        const count =
          option.value === "all"
            ? (totalCount ?? pieces.length)
            : pieces.filter((p) => p.pieceType === option.value).length;
        const isActive = activeType === option.value;

        return (
          <Button
            key={option.value}
            variant={isActive ? "primary" : "ghost"}
            size="xs"
            onClick={() => onTypeChange(option.value)}
            disabled={count === 0 && option.value !== "all"}
            className={cn(
              "font-semibold",
              count === 0 && option.value !== "all" && "opacity-40"
            )}
          >
            {option.label}
            <span
              className={cn(
                "text-[10px] font-medium rounded-full px-1.5 py-0.5 min-w-[20px] text-center",
                isActive
                  ? "bg-background/20 text-background"
                  : "bg-border/50 text-muted-foreground"
              )}
            >
              {count}
            </span>
          </Button>
        );
      })}

      {/* Sort dropdown */}
      <select
        value={activeSort}
        onChange={(e) => onSortChange(e.target.value as "newest" | "oldest" | "a-z" | "z-a")}
        className="ml-auto text-xs font-medium bg-card border border-border rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
        aria-label="Sort gallery"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
