import { Card } from "@/components/ui/Card";
import type { Article } from "@/types";

interface ArticleGridProps {
  articles: Article[];
}

export function ArticleGrid({ articles }: ArticleGridProps) {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {articles.map((article, i) => (
        <Card key={article._id} article={article} featured={i === 0} />
      ))}
    </div>
  );
}
