import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { urlFor } from "@/lib/sanity/image";
import { getCategoryConfig } from "@/lib/categories";
import { cn } from "@/lib/utils";
import type { Article } from "@/types";

interface RelatedArticlesProps {
  articles: Article[];
}

export function RelatedArticles({ articles }: RelatedArticlesProps) {
  if (!articles.length) return null;

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">
        Read Next
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {articles.map((article) => {
          const sanityUrl = article.heroImage
            ? urlFor(article.heroImage).width(400).height(225).url()
            : null;
          const imageUrl = article.heroImageUrl || sanityUrl || null;
          const catConfig = article.category
            ? getCategoryConfig(article.category.title)
            : null;

          return (
            <Link
              key={article._id}
              href={`/articles/${article.slug.current}`}
              className="group rounded-lg border border-border bg-card/30 overflow-hidden hover:border-accent/40 transition-colors"
            >
              {/* Thumbnail */}
              {imageUrl && (
                <div className="relative aspect-video overflow-hidden bg-muted/20">
                  <Image
                    src={imageUrl}
                    alt={article.heroImage?.alt || article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-3 space-y-1.5">
                {catConfig && (
                  <span
                    className={cn(
                      "inline-block px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-full border",
                      catConfig.pill
                    )}
                  >
                    {article.category.title}
                  </span>
                )}
                <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                  {article.title}
                </h3>
                {article.readingTime && (
                  <p className="text-[10px] text-muted-foreground">
                    {article.readingTime} min read
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
