import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProvider } from "@/lib/providers";
import { urlFor } from "@/lib/sanity/image";
import { formatDate } from "@/lib/utils";
import { Container } from "@/components/ui/Container";
import { GlitchText } from "@/components/ui/GlitchText";
import { WebRating } from "@/components/content/WebRating";
import {
  getCollectionTemplate,
  getArticlesLabel,
  getArticleNumberPrefix,
} from "@/lib/collections/template";
import type { Article, SanityImage } from "@/types";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = getProvider();
  const collection = await provider.getCollectionBySlug(slug);

  if (!collection) return { title: "Not Found" };

  return {
    title: collection.title,
    description: collection.description || `${collection.title} — The Spidaverse Collection`,
  };
}

function formatThemeLabel(theme: string): string {
  return theme
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getHeroUrl(collection: { heroImage?: SanityImage; heroImageUrl?: string }): string | null {
  if (collection.heroImageUrl) return collection.heroImageUrl;
  if (collection.heroImage) return urlFor(collection.heroImage).width(1200).height(800).url() || null;
  return null;
}

function getArticleImageUrl(article: Article): string | null {
  if (article.heroImageUrl) return article.heroImageUrl;
  if (article.heroImage) return urlFor(article.heroImage).width(120).height(68).url() || null;
  return null;
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const provider = getProvider();
  const collection = await provider.getCollectionBySlug(slug);

  if (!collection) notFound();

  const template = getCollectionTemplate(collection.theme);
  const articlesLabel = getArticlesLabel(template);
  const numberPrefix = getArticleNumberPrefix(template);
  const heroUrl = getHeroUrl(collection);
  const articles = collection.articles ?? [];

  return (
    <>
      {/* ── Hero viewport: nav + breadcrumb + cover = 100vh ── */}
      <div className="collection-detail-hero">
        <Container className="pt-3 pb-3 flex-shrink-0 relative z-10">
          <nav className="text-sm text-muted-foreground flex items-center gap-1.5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span className="text-muted-foreground/50">/</span>
            <Link href="/collections" className="hover:text-foreground transition-colors">Collections</Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground truncate">{collection.title}</span>
          </nav>
        </Container>

        {/* Hero cover — fills remaining viewport */}
        <div className="collection-detail-cover" data-template={template}>
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={collection.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-accent/15 to-accent/5" />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />

          {/* Content anchored at bottom */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <Container className="pb-6 md:pb-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  {collection.season && (
                    <span className="text-xs font-semibold text-accent uppercase tracking-wider">
                      {collection.season}
                    </span>
                  )}
                  {collection.theme && (
                    <span className="px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-white/10 text-white/80 border border-white/15 backdrop-blur-sm">
                      {formatThemeLabel(collection.theme)}
                    </span>
                  )}
                </div>

                <GlitchText className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {collection.title}
                </GlitchText>

                {collection.description && (
                  <p className="text-sm md:text-base text-foreground/70 max-w-xl mt-2 line-clamp-2">
                    {collection.description}
                  </p>
                )}

                <p className="text-xs font-mono text-muted-foreground mt-3">
                  {articles.length} {articles.length === 1 ? "article" : "articles"}
                </p>
              </div>
            </Container>
          </div>
        </div>
      </div>

      {/* ── Content below the fold ── */}
      <Container className="pt-8 pb-0 md:pt-12 md:pb-0 max-w-5xl">
        {/* Article list */}
        {articles.length > 0 ? (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
              {articlesLabel}
              <span className="text-[10px] font-mono text-muted-foreground/60">
                ({articles.length})
              </span>
            </h2>

            <div className="border-t border-border">
              {articles.map((article, i) => (
                <ArticleRow
                  key={article._id}
                  article={article}
                  index={i + 1}
                  numberPrefix={numberPrefix}
                />
              ))}
            </div>
          </section>
        ) : (
          <p className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl">
            This collection is being curated. Articles coming soon.
          </p>
        )}

        {/* Footer meta */}
        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">
            {articles.length} {articles.length === 1 ? "article" : "articles"}
          </span>
          <span>Curated by Spida Mane</span>
        </div>
      </Container>
    </>
  );
}

/* ── Article row component ── */
function ArticleRow({
  article,
  index,
  numberPrefix,
}: {
  article: Article;
  index: number;
  numberPrefix: string;
}) {
  const imageUrl = getArticleImageUrl(article);
  const label = numberPrefix ? `${numberPrefix} ${index}` : `${index}`;

  return (
    <Link
      href={`/articles/${article.slug.current}`}
      className="collection-article-row group"
    >
      {/* Number */}
      <span className="collection-article-number">{label}</span>

      {/* Thumbnail */}
      {imageUrl && (
        <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
          <Image
            src={imageUrl}
            alt=""
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="48px"
            unoptimized
          />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium truncate group-hover:text-accent transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
          {article.category && (
            <>
              <span>{article.category.title}</span>
              <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
            </>
          )}
          {article.readingTime && <span>{article.readingTime} min</span>}
        </div>
      </div>

      {/* Rating */}
      {article.webRating != null && (
        <WebRating score={article.webRating} variant="inline" className="flex-shrink-0" />
      )}
    </Link>
  );
}
