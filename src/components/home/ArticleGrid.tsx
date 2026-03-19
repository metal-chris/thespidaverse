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

  const [featured, ...rest] = articles;

  return (
    <div className="space-y-5">
      {/* Featured article - full width */}
      {featured && <Card article={featured} featured={true} />}
      
      {/* Remaining articles - grid layout */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {rest.map((article) => (
            <Card key={article._id} article={article} featured={false} />
          ))}
        </div>
      )}
    </div>
  );
}
