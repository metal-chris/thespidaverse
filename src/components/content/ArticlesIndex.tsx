"use client";

import { TagFilter } from "@/components/content/TagFilter";
import { Card } from "@/components/ui/Card";
import type { Article, Tag } from "@/types";

interface ArticlesIndexProps {
  articles: Article[];
  tags: Tag[];
}

export function ArticlesIndex({ articles, tags }: ArticlesIndexProps) {
  return (
    <TagFilter articles={articles} allTags={tags}>
      {(filtered) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <Card key={article._id} article={article} />
          ))}
        </div>
      )}
    </TagFilter>
  );
}
