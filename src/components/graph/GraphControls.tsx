"use client";

import { cn } from "@/lib/utils";

const filterLabels: Record<string, string> = {
  article: "ARTICLE",
  media: "MEDIA",
  collection: "COLLECTION",
  category: "CATEGORY",
  tag: "TAG",
};

interface GraphControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  categories: string[];
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function GraphControls({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  categories,
  onZoomIn,
  onZoomOut,
  onReset,
}: GraphControlsProps) {
  return (
    <div className="px-4 flex flex-col sm:flex-row gap-3 pointer-events-none">
      {/* Search */}
      <div className="pointer-events-auto">
        <input
          type="text"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full sm:w-64 px-3 py-2 text-sm rounded-lg border border-border bg-card/90 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-1.5 pointer-events-auto">
        <button
          onClick={() => onFilterChange(null)}
          className={cn(
            "px-2.5 py-1 text-xs font-medium rounded-full border transition-colors",
            !activeFilter
              ? "bg-accent text-background border-accent"
              : "bg-card/90 backdrop-blur-sm border-border text-muted-foreground hover:text-foreground"
          )}
        >
          ALL
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onFilterChange(cat === activeFilter ? null : cat)}
            className={cn(
              "px-2.5 py-1 text-xs font-medium rounded-full border transition-colors",
              cat === activeFilter
                ? "bg-accent text-background border-accent"
                : "bg-card/90 backdrop-blur-sm border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {filterLabels[cat] || cat}
          </button>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="flex gap-1 ml-auto pointer-events-auto">
        <button
          onClick={onZoomIn}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur-sm border border-border text-foreground hover:bg-muted transition-colors text-sm font-bold"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={onZoomOut}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur-sm border border-border text-foreground hover:bg-muted transition-colors text-sm font-bold"
          aria-label="Zoom out"
        >
          &minus;
        </button>
        <button
          onClick={onReset}
          className="h-8 px-2 flex items-center justify-center rounded-lg bg-card/90 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground transition-colors text-xs"
          aria-label="Reset view"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
