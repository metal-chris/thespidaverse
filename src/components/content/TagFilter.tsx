"use client";

import { useState, useMemo } from "react";
import { cn, capitalizeTag } from "@/lib/utils";
import { FilterDropdown } from "./FilterDropdown";
import type { Article, Tag } from "@/types";

interface TagFilterProps {
  articles: Article[];
  allTags: Tag[];
  children: (filteredArticles: Article[]) => React.ReactNode;
}

export function TagFilter({ articles, allTags, children }: TagFilterProps) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const filteredArticles = useMemo(() => {
    if (selectedTags.size === 0) return articles;
    return articles.filter((article) => {
      if (!article.tags) return false;
      const articleTagSlugs = new Set(article.tags.map((t) => t.slug.current));
      // AND logic: article must have ALL selected tags
      return Array.from(selectedTags).every((slug) => articleTagSlugs.has(slug));
    });
  }, [articles, selectedTags]);

  function toggleTag(slug: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
      }
      return next;
    });
  }

  function clearAll() {
    setSelectedTags(new Set());
  }

  if (allTags.length === 0) return <>{children(articles)}</>;

  return (
    <div>
      <div className="mb-6">
        <FilterDropdown
          allTags={allTags}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onClear={clearAll}
        />
      </div>

      {filteredArticles.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No articles match all selected tags.
        </p>
      ) : (
        children(filteredArticles)
      )}
    </div>
  );
}

/** Tag cloud component showing tag frequency via font size. */
interface TagCloudProps {
  tags: { tag: Tag; count: number }[];
  className?: string;
}

export function TagCloud({ tags, className }: TagCloudProps) {
  if (tags.length === 0) return null;

  const maxCount = Math.max(...tags.map((t) => t.count));
  const minCount = Math.min(...tags.map((t) => t.count));
  const range = maxCount - minCount || 1;

  return (
    <div className={cn("flex flex-wrap gap-2", className)} aria-label="Tag cloud">
      {tags.map(({ tag, count }) => {
        // Scale font size from 0.75rem to 1.5rem based on frequency
        const scale = (count - minCount) / range;
        const fontSize = 0.75 + scale * 0.75;
        return (
          <a
            key={tag._id}
            href={`/tags/${tag.slug.current}`}
            className="text-muted-foreground hover:text-accent transition-colors"
            style={{ fontSize: `${fontSize}rem` }}
            title={`${count} article${count !== 1 ? "s" : ""}`}
          >
            {capitalizeTag(tag.title)}
          </a>
        );
      })}
    </div>
  );
}
