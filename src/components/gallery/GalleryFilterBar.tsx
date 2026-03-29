"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { GalleryPiece } from "@/types";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "image", label: "Art" },
  { value: "video", label: "Videos" },
];

interface GalleryFilterBarProps {
  activeType: string;
  onTypeChange: (type: string) => void;
  pieces: GalleryPiece[];
}

export function GalleryFilterBar({
  activeType,
  onTypeChange,
  pieces,
}: GalleryFilterBarProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {TYPE_OPTIONS.map((option) => {
        const count =
          option.value === "all"
            ? pieces.length
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
    </div>
  );
}
