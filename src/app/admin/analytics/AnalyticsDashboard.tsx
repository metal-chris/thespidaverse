"use client";

import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PostMetric {
  article_slug: string;
  avg_score: number;
  total_ratings: number;
  poll_responses: number;
}

interface CategoryMetric {
  category: string;
  avg_score: number;
  total_ratings: number;
  total_polls: number;
}

interface DashboardData {
  posts: PostMetric[];
  categories: CategoryMetric[];
  totals: {
    totalRatings: number;
    totalPolls: number;
    avgScore: number;
    postsWithRatings: number;
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"ratings" | "score" | "slug">("ratings");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load analytics");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSort = useCallback(
    (col: "ratings" | "score" | "slug") => {
      if (sortBy === col) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(col);
        setSortDir("desc");
      }
    },
    [sortBy]
  );

  const exportCSV = useCallback(() => {
    if (!data) return;
    const rows = [
      ["Article", "Avg Score", "Total Ratings", "Poll Responses"],
      ...data.posts.map((p) => [
        p.article_slug,
        String(p.avg_score),
        String(p.total_ratings),
        String(p.poll_responses),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spidaverse-engagement-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <p className="text-red-400">{error || "No data available"}</p>
      </div>
    );
  }

  const sortedPosts = [...data.posts].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortBy === "ratings") return mul * (a.total_ratings - b.total_ratings);
    if (sortBy === "score") return mul * (a.avg_score - b.avg_score);
    return mul * a.article_slug.localeCompare(b.article_slug);
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Engagement Analytics</h1>
          <p className="text-sm text-muted-foreground">
            The Spidaverse — Community Data
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 rounded-lg bg-accent text-background text-sm font-semibold hover:opacity-90 transition-opacity self-start"
        >
          Export CSV
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Ratings"
          value={data.totals.totalRatings}
        />
        <SummaryCard
          label="Avg Community Score"
          value={data.totals.avgScore}
        />
        <SummaryCard
          label="Poll Responses"
          value={data.totals.totalPolls}
        />
        <SummaryCard
          label="Posts with Ratings"
          value={data.totals.postsWithRatings}
        />
      </div>

      {/* ── Category Breakdown ── */}
      {data.categories.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            By Category
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.categories.map((cat) => (
              <div
                key={cat.category}
                className="rounded-lg border border-border bg-card/50 p-4 space-y-1"
              >
                <p className="font-medium text-foreground">{cat.category}</p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>
                    Avg:{" "}
                    <span className="text-accent font-semibold">
                      {cat.avg_score}
                    </span>
                  </span>
                  <span>{cat.total_ratings} ratings</span>
                  <span>{cat.total_polls} poll responses</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Per-Post Table ── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Per-Post Metrics
        </h2>
        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card/50">
                <SortHeader
                  label="Article"
                  active={sortBy === "slug"}
                  dir={sortDir}
                  onClick={() => handleSort("slug")}
                />
                <SortHeader
                  label="Avg Score"
                  active={sortBy === "score"}
                  dir={sortDir}
                  onClick={() => handleSort("score")}
                  className="text-right"
                />
                <SortHeader
                  label="Ratings"
                  active={sortBy === "ratings"}
                  dir={sortDir}
                  onClick={() => handleSort("ratings")}
                  className="text-right"
                />
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">
                  Poll Resp.
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPosts.map((post) => (
                <tr
                  key={post.article_slug}
                  className="border-b border-border/50 hover:bg-card/30"
                >
                  <td className="px-4 py-2 font-medium truncate max-w-[200px]">
                    {post.article_slug}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    <span
                      className={cn(
                        "font-semibold",
                        post.avg_score >= 80
                          ? "text-green-400"
                          : post.avg_score >= 50
                            ? "text-accent"
                            : "text-red-400"
                      )}
                    >
                      {post.avg_score}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                    {post.total_ratings}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                    {post.poll_responses}
                  </td>
                </tr>
              ))}
              {sortedPosts.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No engagement data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card/50 p-4 space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
  className?: string;
}) {
  return (
    <th
      className={cn(
        "px-4 py-2 font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none",
        className
      )}
      onClick={onClick}
    >
      {label}
      {active && (
        <span className="ml-1 text-accent">
          {dir === "asc" ? "\u2191" : "\u2193"}
        </span>
      )}
    </th>
  );
}
