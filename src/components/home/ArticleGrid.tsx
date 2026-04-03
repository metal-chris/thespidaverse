"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { cn } from "@/lib/utils";
import type { Article } from "@/types";

const FIRST_PAGE_SIZE = 8; // 2 featured + 6 grid
const REST_PAGE_SIZE = 8; // 2-column grid, 4 rows

interface ArticleGridProps {
  articles: Article[];
}

/** Auto-rotating carousel for 2 featured articles. */
function FeaturedCarousel({ articles }: { articles: Article[] }) {
  const t = useTranslations("home");
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % articles.length);
    }, 6000);
  }, [articles.length]);

  useEffect(() => {
    if (articles.length <= 1) return;
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [articles.length, startTimer]);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(index);
      startTimer(); // Reset timer on manual navigation
    },
    [startTimer]
  );

  if (articles.length === 0) return null;

  return (
    <div className="relative">
      {/* Cards — crossfade */}
      <div className="relative">
        {articles.map((article, i) => (
          <div
            key={article._id}
            className={cn(
              "transition-all duration-500 ease-in-out",
              i === activeIndex
                ? "opacity-100 relative"
                : "opacity-0 absolute inset-0 pointer-events-none"
            )}
            aria-hidden={i !== activeIndex}
          >
            <Card article={article} featured={true} />
          </div>
        ))}
      </div>

      {/* Indicators */}
      {articles.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          {articles.map((_, i) => {
            const roman = ["I", "II", "III", "IV", "V"][i] || `${i + 1}`;
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={t("showFeatured", { index: i + 1 })}
                className={cn(
                  "inline-flex items-center justify-center rounded-full text-[10px] font-bold tracking-wider transition-all duration-300 border",
                  i === activeIndex
                    ? "w-8 h-8 bg-accent text-background border-accent"
                    : "w-8 h-8 bg-transparent text-muted-foreground border-muted-foreground/40 hover:border-accent/50 hover:text-foreground"
                )}
              >
                {roman}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ArticleGrid({ articles }: ArticleGridProps) {
  const t = useTranslations("home");
  const [page, setPage] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Reset to page 1 when articles change (e.g. tag filter)
  const articleKey = articles.map((a) => a._id).join(",");
  const [prevKey, setPrevKey] = useState(articleKey);
  if (articleKey !== prevKey) {
    setPrevKey(articleKey);
    setPage(1);
  }

  const isFirstPage = page === 1;

  const { featured, grid, totalPages } = useMemo(() => {
    if (isFirstPage) {
      const feat = articles.slice(0, 2);
      const g = articles.slice(2, FIRST_PAGE_SIZE);
      const remaining = Math.max(0, articles.length - FIRST_PAGE_SIZE);
      const restPages = Math.ceil(remaining / REST_PAGE_SIZE);
      return { featured: feat, grid: g, totalPages: 1 + restPages };
    } else {
      const offset = FIRST_PAGE_SIZE + (page - 2) * REST_PAGE_SIZE;
      const g = articles.slice(offset, offset + REST_PAGE_SIZE);
      const remaining = Math.max(0, articles.length - FIRST_PAGE_SIZE);
      const restPages = Math.ceil(remaining / REST_PAGE_SIZE);
      return { featured: [], grid: g, totalPages: 1 + restPages };
    }
  }, [articles, page, isFirstPage]);

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">{t("noArticlesYet")}</p>
        <p className="text-sm mt-1">
          {t("noArticlesYetCta")}
        </p>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="space-y-6 scroll-mt-24">
      {/* Featured carousel (page 1 only) */}
      {isFirstPage && featured.length > 0 && (
        <ScrollReveal>
          <FeaturedCarousel articles={featured} />
        </ScrollReveal>
      )}

      {/* Article grid — 2 columns */}
      {grid.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {grid.map((article, i) => (
            <ScrollReveal key={article._id} delay={i * 60}>
              <Card article={article} featured={false} />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="xs"
              shape="rounded"
              disabled={page <= 1}
              onClick={() => goToPage(Math.max(1, page - 1))}
              aria-label={t("previousPage")}
            >
              <svg
                viewBox="0 0 16 16"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 12L6 8l4-4" />
              </svg>
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "active" : "ghost"}
                size="xs"
                shape="rounded"
                onClick={() => goToPage(p)}
                aria-label={t("page", { page: p })}
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
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              aria-label={t("nextPage")}
            >
              <svg
                viewBox="0 0 16 16"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 4l4 4-4 4" />
              </svg>
            </Button>
          </div>

          <span className="text-xs text-muted-foreground tabular-nums">
            {t("articlesCount", { count: articles.length })}
          </span>
        </div>
      )}
    </div>
  );
}
