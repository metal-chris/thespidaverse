"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { WebRating } from "@/components/content/WebRating";
import type { WebRatingStats } from "@/types";

interface CommunityWebRatingProps {
  slug: string;
  initialStats?: WebRatingStats;
  existingScore: number | null; // from localStorage
  onSubmit: (score: number) => Promise<{
    success: boolean;
    aggregated?: WebRatingStats;
    reason?: string;
    existingScore?: number;
  }>;
}

export function CommunityWebRating({
  initialStats,
  existingScore,
  onSubmit,
}: CommunityWebRatingProps) {
  const [sliderValue, setSliderValue] = useState(existingScore ?? 1);
  const [stats, setStats] = useState<WebRatingStats | undefined>(initialStats);
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">(
    existingScore != null ? "submitted" : "idle"
  );
  const [userScore, setUserScore] = useState<number | null>(existingScore);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (status !== "idle") return;
    setStatus("submitting");
    setError(null);

    try {
      const result = await onSubmit(sliderValue);

      if (result.success) {
        setUserScore(sliderValue);
        setStats(result.aggregated);
        setStatus("submitted");
      } else if (result.reason === "already_rated") {
        setUserScore(result.existingScore ?? sliderValue);
        setStats(result.aggregated);
        setStatus("submitted");
      } else {
        setError("Something went wrong. Try again.");
        setStatus("idle");
      }
    } catch {
      setError("Something went wrong. Try again.");
      setStatus("idle");
    }
  }, [sliderValue, status, onSubmit]);

  const totalRatings = stats?.totalRatings ?? 0;
  const hasStats = totalRatings > 0;

  return (
    <div>
      {/* ── Rating Input (pre-submit) ── */}
      {status !== "submitted" && (
        <>
          {/* Collapsed: tap to expand */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between py-1 group cursor-pointer"
            aria-expanded={expanded}
          >
            <span className="text-sm font-medium text-foreground">
              Your Web Rating
            </span>
            <div className="flex items-center gap-2">
              {!expanded && (
                <span className="text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                  Rate this →
                </span>
              )}
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cn(
                  "w-4 h-4 text-muted-foreground transition-transform duration-200",
                  expanded && "rotate-180"
                )}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>

          {/* Expanded: slider + submit */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              expanded ? "max-h-[300px] opacity-100 mt-3" : "max-h-0 opacity-0"
            )}
          >
            <div className="space-y-3">
              {/* Score display */}
              <div className="flex items-center justify-end gap-2">
                <WebRating score={sliderValue} variant="compact" />
                <span
                  className={cn(
                    "text-2xl font-bold tabular-nums transition-colors",
                    sliderValue >= 80
                      ? "text-green-400"
                      : sliderValue >= 50
                        ? "text-accent"
                        : "text-red-400"
                  )}
                >
                  {sliderValue}
                </span>
              </div>

              {/* Slider */}
              <div className="relative">
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={sliderValue}
                  onChange={(e) => setSliderValue(Number(e.target.value))}
                  className="web-rating-slider w-full h-2 rounded-full appearance-none cursor-pointer bg-card border border-border"
                  aria-label="Your web rating score from 1 to 100"
                  disabled={status === "submitting"}
                />
                {/* Track fill */}
                <div
                  className="absolute top-0 left-0 h-2 rounded-full bg-accent/60 pointer-events-none"
                  style={{ width: `${sliderValue}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>1</span>
                <span>100</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={status === "submitting"}
                className={cn(
                  "w-full py-2.5 rounded-full text-sm font-semibold transition-all",
                  "bg-accent text-background hover:opacity-90",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {status === "submitting" ? "Submitting..." : "Stick Your Rating"}
              </button>

              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Post-submit confirmation ── */}
      {status === "submitted" && userScore != null && (
        <div className="text-center space-y-1 py-2">
          <p className="text-sm text-foreground">
            You rated this a{" "}
            <span className="font-bold text-accent">{userScore}</span>
          </p>
          {hasStats && (
            <p className="text-xs text-muted-foreground">
              Community average:{" "}
              <span className="font-semibold text-accent">
                {stats?.avgScore}
              </span>{" "}
              ({totalRatings} rating{totalRatings !== 1 ? "s" : ""})
            </p>
          )}
        </div>
      )}

      {/* ── Distribution bars (post-submit) ── */}
      {status === "submitted" && hasStats && stats?.distribution && (
        <div className="space-y-1.5 mt-3">
          {(["81-100", "61-80", "41-60", "21-40", "1-20"] as const).map(
            (bucket) => {
              const count = stats.distribution[bucket] ?? 0;
              const pct = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              return (
                <div key={bucket} className="flex items-center gap-2 text-xs">
                  <span className="w-12 text-muted-foreground text-right tabular-nums">
                    {bucket}
                  </span>
                  <div className="flex-1 h-1.5 bg-card border border-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent/60 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}
