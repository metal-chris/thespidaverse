"use client";

import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "image", label: "Art" },
  { value: "video", label: "Videos" },
];

interface GalleryFilterBarProps {
  activeType: string;
  onTypeChange: (type: string) => void;
}

export function GalleryFilterBar({
  activeType,
  onTypeChange,
}: GalleryFilterBarProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {TYPE_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onTypeChange(option.value)}
          className={cn(
            "px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200",
            activeType === option.value
              ? "bg-accent text-background"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
