"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import type { Article, Category, Tag } from "@/types";

interface SearchPageClientProps {
  articles: Article[];
  categories: Category[];
  tags: Tag[];
}

const FORMATS = [
  { value: "first-bite", label: "First Bite" },
  { value: "the-full-web", label: "The Full Web" },
  { value: "spin-the-block", label: "Spin the Block" },
  { value: "the-sinister-six", label: "The Sinister Six" },
  { value: "the-gauntlet", label: "The Gauntlet" },
  { value: "versus", label: "Versus" },
  { value: "the-daily-bugle", label: "The Daily Bugle" },
  { value: "spida-sense", label: "Spida Sense" },
  { value: "the-web-sling", label: "The Web Sling" },
  { value: "state-of-the-game", label: "State of the Game" },
  { value: "the-rotation", label: "The Rotation" },
  { value: "one-year-later", label: "One Year Later" },
];

export function SearchPageClient({ articles, categories, tags }: SearchPageClientProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [selectedMood, setSelectedMood] = useState<string>("");

  // Collect all unique mood tags from articles
  const allMoods = useMemo(() => {
    const moods = new Set<string>();
    articles.forEach((a) => a.moodTags?.forEach((m) => moods.add(m)));
    return Array.from(moods).sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    let results = articles;

    // Text search (title, excerpt, tags, category)
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      results = results.filter((a) => {
        const searchable = [
          a.title,
          a.excerpt || "",
          a.category?.title || "",
          ...(a.tags?.map((t) => t.title) || []),
          ...(a.moodTags || []),
        ]
          .join(" ")
          .toLowerCase();
        return searchable.includes(q);
      });
    }

    // Category filter
    if (selectedCategory) {
      results = results.filter((a) => a.category?.slug?.current === selectedCategory);
    }

    // Format filter
    if (selectedFormat) {
      results = results.filter((a) => a.format === selectedFormat);
    }

    // Mood filter
    if (selectedMood) {
      results = results.filter((a) => a.moodTags?.includes(selectedMood));
    }

    return results;
  }, [articles, query, selectedCategory, selectedFormat, selectedMood]);

  const hasFilters = query || selectedCategory || selectedFormat || selectedMood;

  function clearAll() {
    setQuery("");
    setSelectedCategory("");
    setSelectedFormat("");
    setSelectedMood("");
  }

  return (
    <div>
      {/* Search input */}
      <div className="relative mb-6">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("search.placeholder")}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          autoFocus
        />
      </div>

      {/* Facet filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Category */}
        {categories.length > 0 && (
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label={t("search.filterByCategory")}
          >
            <option value="">{t("search.allCategories")}</option>
            {categories.map((c) => (
              <option key={c._id} value={c.slug.current}>
                {c.title}
              </option>
            ))}
          </select>
        )}

        {/* Format */}
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="text-sm px-3 py-1.5 rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          aria-label={t("search.filterByFormat")}
        >
          <option value="">{t("search.allFormats")}</option>
          {FORMATS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>

        {/* Mood */}
        {allMoods.length > 0 && (
          <select
            value={selectedMood}
            onChange={(e) => setSelectedMood(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-md border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            aria-label={t("search.filterByMood")}
          >
            <option value="">{t("search.allMoods")}</option>
            {allMoods.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        )}

        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("search.clearAll")}
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        {query
          ? t("search.resultCountForQuery", { count: filteredArticles.length, query })
          : t("search.resultCount", { count: filteredArticles.length })}
      </p>

      {/* Results grid */}
      {filteredArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <Card key={article._id} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">{t("search.noResults")}</p>
          {hasFilters && (
            <button
              onClick={clearAll}
              className="mt-2 text-accent text-sm hover:underline"
            >
              {t("search.clearFilters")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
