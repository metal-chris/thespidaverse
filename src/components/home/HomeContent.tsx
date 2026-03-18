"use client";

import { TagFilter } from "@/components/content/TagFilter";
import { ArticleGrid } from "./ArticleGrid";
import type { Article, Tag } from "@/types";

interface HomeContentProps {
  articles: Article[];
  tags: Tag[];
}

export function HomeContent({ articles, tags }: HomeContentProps) {
  return (
    <TagFilter articles={articles} allTags={tags}>
      {(filteredArticles) => <ArticleGrid articles={filteredArticles} />}
    </TagFilter>
  );
}
