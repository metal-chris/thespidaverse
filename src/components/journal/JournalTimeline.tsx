"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { MediaDiaryEntry, MediaType } from "@/types";
import { formatMediaType } from "@/lib/utils";
import { WebRating } from "@/components/content/WebRating";
import { useTheme } from "@/components/theme/ThemeProvider";

// Theme-aware status colors
const STATUS_COLORS: Record<string, Record<string, string>> = {
  miles: {
    watching: "bg-blue-500 text-white",
    playing: "bg-green-500 text-white",
    listening: "bg-purple-500 text-white",
    reading: "bg-amber-500 text-white",
    completed: "bg-emerald-500 text-white",
    dropped: "bg-red-500 text-white",
  },
  peter: {
    watching: "bg-blue-500 text-white",
    playing: "bg-green-500 text-white",
    listening: "bg-purple-500 text-white",
    reading: "bg-yellow-500 text-white",
    completed: "bg-teal-500 text-white",
    dropped: "bg-red-500 text-white",
  },
  venom: {
    watching: "bg-blue-400 text-black",
    playing: "bg-green-400 text-black",
    listening: "bg-purple-400 text-black",
    reading: "bg-yellow-400 text-black",
    completed: "bg-emerald-400 text-black",
    dropped: "bg-red-400 text-black",
  },
};

const DOT_COLORS: Record<string, Record<string, string>> = {
  miles: {
    watching: "bg-blue-500",
    playing: "bg-green-500",
    listening: "bg-purple-500",
    reading: "bg-amber-500",
    completed: "bg-emerald-500",
    dropped: "bg-red-500",
  },
  peter: {
    watching: "bg-blue-500",
    playing: "bg-green-500",
    listening: "bg-purple-500",
    reading: "bg-yellow-500",
    completed: "bg-teal-500",
    dropped: "bg-red-500",
  },
  venom: {
    watching: "bg-blue-400",
    playing: "bg-green-400",
    listening: "bg-purple-400",
    reading: "bg-yellow-400",
    completed: "bg-emerald-400",
    dropped: "bg-red-400",
  },
};

const STATUS_LABELS: Record<string, string> = {
  watching: "Watching",
  playing: "Playing",
  listening: "Listening",
  reading: "Reading",
  completed: "Completed",
  dropped: "Dropped",
};

interface JournalTimelineProps {
  entries: MediaDiaryEntry[];
}

type FilterType = "all" | MediaType;
type FilterStatus = "all" | MediaDiaryEntry["status"];

export function JournalTimeline({ entries }: JournalTimelineProps) {
  const { theme } = useTheme();
  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const statusColors = STATUS_COLORS[theme] || STATUS_COLORS.miles;
  const dotColors = DOT_COLORS[theme] || DOT_COLORS.miles;

  const filtered = useMemo(
    () =>
      entries.filter((e) => {
        if (typeFilter !== "all" && e.mediaType !== typeFilter) return false;
        if (statusFilter !== "all" && e.status !== statusFilter) return false;
        return true;
      }),
    [entries, typeFilter, statusFilter]
  );

  // Group by month and sort chronologically (newest first)
  const grouped = useMemo(() => {
    const map = new Map<string, MediaDiaryEntry[]>();
    for (const entry of filtered) {
      const date = entry.startedAt || entry._createdAt;
      const key = date ? date.slice(0, 7) : "unknown";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }
    // Sort keys descending (newest month first)
    const sorted = [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
    return sorted;
  }, [filtered]);

  const mediaTypes: FilterType[] = [
    "all",
    "movie",
    "tv",
    "game",
    "anime",
    "books",
    "music",
  ];
  const statuses: FilterStatus[] = [
    "all",
    "watching",
    "playing",
    "listening",
    "reading",
    "completed",
    "dropped",
  ];

  const hasActiveFilters = typeFilter !== "all" || statusFilter !== "all";

  return (
    <div>
      {/* Filter bar — compact toggle */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
            hasActiveFilters
              ? "border-accent/50 text-accent bg-accent/10"
              : "border-border text-muted-foreground hover:border-accent/30"
          )}
        >
          <svg
            viewBox="0 0 16 16"
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round" />
          </svg>
          Filter
          {hasActiveFilters && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          )}
        </button>

        <span className="text-xs text-muted-foreground tabular-nums">
          {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}
        </span>
      </div>

      {/* Expandable filter panel */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          filtersOpen ? "max-h-[200px] opacity-100 mb-6" : "max-h-0 opacity-0"
        )}
      >
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-border bg-card/50">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
              Type
            </label>
            <div className="flex flex-wrap gap-1">
              {mediaTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-full border transition-colors",
                    typeFilter === t
                      ? "bg-accent text-background border-accent"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  )}
                >
                  {t === "all" ? "All" : formatMediaType(t)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider block mb-1.5">
              Status
            </label>
            <div className="flex flex-wrap gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    "px-2.5 py-1 text-xs rounded-full border transition-colors",
                    statusFilter === s
                      ? "bg-accent text-background border-accent"
                      : "border-border text-muted-foreground hover:border-accent/50"
                  )}
                >
                  {s === "all" ? "All" : STATUS_LABELS[s] || s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline — single continuous line */}
      <div className="relative">
        {/* Continuous timeline line */}
        <div className="absolute left-[11px] top-0 bottom-0 w-0.5" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} aria-hidden="true" />
      {grouped.map(([month, items]) => {
        const monthLabel =
          month === "unknown"
            ? "Undated"
            : new Date(month + "-01").toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              });

        return (
          <div key={month} className="mb-6">
            <h3 className="text-lg font-bold mb-3 sticky top-16 bg-background/90 backdrop-blur-sm py-2 z-10 pl-8">
              {monthLabel}
            </h3>
            <div className="space-y-3">
              {items.map((entry) => {
                const isCompleted = entry.status === "completed";

                return (
                  <div key={entry._id} className="flex gap-4 pl-8 relative">
                    {/* Timeline dot — vertically centered to the card */}
                    <div
                      className={cn(
                        "absolute left-1 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-background",
                        dotColors[entry.status] || "bg-muted"
                      )}
                      title={STATUS_LABELS[entry.status]}
                    />

                    {/* Card */}
                    <div className="flex-1 flex gap-3 p-3 rounded-lg border border-border bg-card hover:border-accent/30 transition-colors">
                      {/* Poster — larger for better recognition */}
                      {entry.media?.posterUrl && (
                        <div className="relative w-14 h-20 md:w-16 md:h-22 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={entry.media.posterUrl}
                            alt={entry.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-medium text-sm text-foreground">
                            {entry.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatMediaType(entry.mediaType)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className={cn(
                              "text-xs px-1.5 py-0.5 rounded font-medium",
                              statusColors[entry.status] ||
                                "bg-muted text-muted-foreground"
                            )}
                          >
                            {STATUS_LABELS[entry.status]}
                          </span>
                          {entry.rating != null && isCompleted ? (
                            <WebRating
                              score={entry.rating}
                              variant="inline"
                            />
                          ) : entry.rating != null ? (
                            <span className="text-xs text-accent font-medium">
                              {entry.rating}/100
                            </span>
                          ) : null}
                          {entry.startedAt && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(entry.startedAt).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" }
                              )}
                            </span>
                          )}
                        </div>
                        {entry.notes && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {entry.notes}
                          </p>
                        )}
                        {entry.linkedArticle && (
                          <Link
                            href={`/articles/${entry.linkedArticle.slug.current}`}
                            className="inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
                          >
                            Read review
                            <span aria-hidden="true">&rarr;</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <svg
            viewBox="0 0 24 24"
            className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
            />
          </svg>
          <p className="text-muted-foreground text-sm">
            No entries match your filters.
          </p>
          <button
            onClick={() => {
              setTypeFilter("all");
              setStatusFilter("all");
            }}
            className="mt-2 text-xs text-accent hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
