"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { Article } from "@/types";

const PAGE_SIZE_OPTIONS = [6, 12, 24] as const;

interface ArticleGridProps {
  articles: Article[];
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState<number>(PAGE_SIZE_OPTIONS[0]);
  const [showAll, setShowAll] = useState(false);

  // Reset to page 1 when articles change (e.g. tag filter)
  const articleKey = articles.map((a) => a._id).join(",");
  const [prevKey, setPrevKey] = useState(articleKey);
  if (articleKey !== prevKey) {
    setPrevKey(articleKey);
    setPage(1);
  }

  const totalPages = Math.ceil(articles.length / perPage);

  const visibleArticles = useMemo(() => {
    if (showAll) return articles;
    const start = (page - 1) * perPage;
    return articles.slice(start, start + perPage);
  }, [articles, page, perPage, showAll]);

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No articles yet.</p>
        <p className="text-sm mt-1">
          Head to <a href="/studio" className="text-accent underline">/studio</a> to create your first post.
        </p>
      </div>
    );
  }

  const [featured, ...rest] = visibleArticles;

  return (
    <div className="space-y-6">
      {/* Featured article — full width */}
      {featured && (
        <ScrollReveal>
          <Card article={featured} featured={true} />
        </ScrollReveal>
      )}

      {/* Remaining articles — uniform grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((article, i) => (
            <ScrollReveal key={article._id} delay={i * 60}>
              <Card article={article} featured={false} />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Pagination controls */}
      {articles.length > PAGE_SIZE_OPTIONS[0] && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
          {/* Per-page selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Show</span>
            {PAGE_SIZE_OPTIONS.map((n) => (
              <Button
                key={n}
                variant={!showAll && perPage === n ? "active" : "ghost"}
                size="xs"
                shape="rounded"
                onClick={() => {
                  setShowAll(false);
                  setPerPage(n);
                  setPage(1);
                }}
              >
                {n}
              </Button>
            ))}
            <Button
              variant={showAll ? "active" : "ghost"}
              size="xs"
              shape="rounded"
              onClick={() => {
                setShowAll(true);
                setPage(1);
              }}
            >
              All
            </Button>
          </div>

          {/* Page navigation */}
          {!showAll && totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                shape="rounded"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 12L6 8l4-4" />
                </svg>
              </Button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "active" : "ghost"}
                  size="xs"
                  shape="rounded"
                  onClick={() => setPage(p)}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </Button>
              ))}

              <Button
                variant="ghost"
                size="xs"
                shape="rounded"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 4l4 4-4 4" />
                </svg>
              </Button>
            </div>
          )}

          {/* Article count */}
          <span className="text-xs text-muted-foreground tabular-nums">
            {showAll
              ? `${articles.length} articles`
              : `${(page - 1) * perPage + 1}–${Math.min(page * perPage, articles.length)} of ${articles.length}`}
          </span>
        </div>
      )}
    </div>
  );
}
