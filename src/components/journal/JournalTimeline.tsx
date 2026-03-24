"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { MediaDiaryEntry, MediaType } from "@/types";
import { formatMediaType } from "@/lib/utils";
import { useTheme } from "@/components/theme/ThemeProvider";

// Theme-aware status colors for optimal visibility and distinction
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

// Dot colors for timeline (theme-aware)
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
  
  const statusColors = STATUS_COLORS[theme] || STATUS_COLORS.miles;
  const dotColors = DOT_COLORS[theme] || DOT_COLORS.miles;

  const filtered = entries.filter((e) => {
    if (typeFilter !== "all" && e.mediaType !== typeFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    return true;
  });

  // Group by month
  const grouped = new Map<string, MediaDiaryEntry[]>();
  for (const entry of filtered) {
    const date = entry.startedAt || entry._createdAt;
    const key = date ? date.slice(0, 7) : "unknown"; // YYYY-MM
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  const mediaTypes: FilterType[] = ["all", "movie", "tv", "game", "anime", "manga", "music"];
  const statuses: FilterStatus[] = ["all", "watching", "playing", "listening", "reading", "completed", "dropped"];

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Type</label>
          <div className="flex flex-wrap gap-1">
            {mediaTypes.map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  typeFilter === t
                    ? "bg-accent text-background border-accent"
                    : "border-border text-muted-foreground hover:border-accent/50"
                }`}
              >
                {t === "all" ? "All" : formatMediaType(t)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">Status</label>
          <div className="flex flex-wrap gap-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                  statusFilter === s
                    ? "bg-accent text-background border-accent"
                    : "border-border text-muted-foreground hover:border-accent/50"
                }`}
              >
                {s === "all" ? "All" : STATUS_LABELS[s] || s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground mb-6">
        {filtered.length} entr{filtered.length !== 1 ? "ies" : "y"}
      </p>

      {/* Timeline */}
      {Array.from(grouped.entries()).map(([month, items]) => {
        const monthLabel = month === "unknown"
          ? "Undated"
          : new Date(month + "-01").toLocaleDateString("en-US", { year: "numeric", month: "long" });

        return (
          <div key={month} className="mb-8">
            <h3 className="text-lg font-bold mb-4 sticky top-16 bg-background/90 backdrop-blur-sm py-2 z-10">
              {monthLabel}
            </h3>
            <div className="space-y-3 relative before:absolute before:left-3 before:top-0 before:bottom-0 before:w-px before:bg-border">
              {items.map((entry) => (
                <div key={entry._id} className="flex gap-4 pl-8 relative">
                  {/* Timeline dot */}
                  <div
                    className={`absolute left-1.5 top-3 w-3 h-3 rounded-full ${dotColors[entry.status] || "bg-muted"}`}
                    title={STATUS_LABELS[entry.status]}
                  />

                  {/* Card */}
                  <div className="flex-1 flex gap-3 p-3 rounded-lg border border-border bg-card hover:border-accent/30 transition-colors">
                    {entry.media?.posterUrl && (
                      <div className="relative w-12 h-16 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={entry.media.posterUrl}
                          alt={entry.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium text-sm text-foreground">{entry.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatMediaType(entry.mediaType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusColors[entry.status] || "bg-muted text-muted-foreground"}`}>
                          {STATUS_LABELS[entry.status]}
                        </span>
                        {entry.rating != null && (
                          <span className="text-xs text-accent font-medium">{entry.rating}/100</span>
                        )}
                        {entry.startedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{entry.notes}</p>
                      )}
                      {entry.linkedArticle && (
                        <Link
                          href={`/articles/${entry.linkedArticle.slug.current}`}
                          className="text-xs text-accent hover:underline mt-1 inline-block"
                        >
                          Read review &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <p className="text-center text-muted-foreground py-12">No entries match your filters.</p>
      )}
    </div>
  );
}
