import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProvider } from "@/lib/providers";
import { urlFor } from "@/lib/sanity/image";
import { Container } from "@/components/ui/Container";
import { GlitchText } from "@/components/ui/GlitchText";
import { CollectionCover } from "@/components/collections/CollectionCover";
import { getCollectionTemplate } from "@/lib/collections/template";
import type { Collection } from "@/types";

export const metadata: Metadata = {
  title: "Collections",
  description: "Seasonal and thematic article collections from The Spidaverse.",
};

export const revalidate = 60;

function formatThemeLabel(theme: string): string {
  return theme
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getHeroImageUrl(col: Collection): string | null {
  if (col.heroImageUrl) return col.heroImageUrl;
  if (col.heroImage) return urlFor(col.heroImage).width(1400).height(900).url() || null;
  return null;
}

export default async function CollectionsPage() {
  const provider = getProvider();
  const rawCollections = await provider.getCollections();
  const collections = rawCollections.map((c) => ({
    ...c,
    articleCount: c.articles?.length || 0,
  }));

  const featured = collections.filter((c) => c.featured);
  const regular = collections.filter((c) => !c.featured);
  const heroCollection = featured[0];
  const remainingFeatured = featured.slice(1);

  return (
    <>
      {/* ── Header + Featured Hero share 100vh ── */}
      <div className={heroCollection ? "collection-hero-viewport" : ""}>
        <Container className={heroCollection ? "pt-6 pb-4 md:pt-8 md:pb-4 flex-shrink-0" : "py-8 md:py-12"}>
          <header className={heroCollection ? "mb-0" : "mb-10"}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
              Curated
            </p>
            <GlitchText className="text-3xl md:text-4xl font-bold mb-2">Collections</GlitchText>
            <p className="text-muted-foreground max-w-lg">
              Curated groups of articles &mdash; by season, theme, or vibe. Browse the shelf.
            </p>
          </header>
        </Container>

        {heroCollection && (
          <FeaturedHero collection={heroCollection} />
        )}
      </div>

      <Container className="py-8 md:py-12">
        {/* Any additional featured collections beyond the first */}
        {remainingFeatured.length > 0 && (
          <section className="mb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {remainingFeatured.map((col, i) => (
                <CollectionCover key={col._id} collection={col} featured index={i} />
              ))}
            </div>
          </section>
        )}

        {/* All Collections — portrait cover grid */}
        {regular.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              All Collections
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {regular.map((col, i) => (
                <CollectionCover
                  key={col._id}
                  collection={col}
                  index={i + featured.length}
                />
              ))}
            </div>
          </section>
        )}

        {collections.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            No collections yet. Check back when seasonal roundups drop!
          </p>
        )}
      </Container>
    </>
  );
}

/* ── Featured Hero Component ── */
function FeaturedHero({ collection }: { collection: Collection & { articleCount?: number } }) {
  const imageUrl = getHeroImageUrl(collection);
  const template = getCollectionTemplate(collection.theme);
  const articleCount = collection.articleCount ?? collection.articles?.length ?? 0;

  return (
    <Link
      href={`/collections/${collection.slug.current}`}
      className="collection-featured-hero group"
    >
      {/* Background image */}
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={collection.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          sizes="100vw"
          priority
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-accent/15 to-accent/5" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 to-transparent" />

      {/* Content — anchored to bottom-left */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-4 md:pb-6">
          <div className="max-w-2xl">
            {/* Badges */}
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

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 leading-tight group-hover:text-accent transition-colors">
              {collection.title}
            </h2>

            {collection.description && (
              <p className="text-sm text-foreground/70 max-w-xl mb-2 line-clamp-1 md:line-clamp-2">
                {collection.description}
              </p>
            )}

            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-muted-foreground">
                {articleCount} {articleCount === 1 ? "article" : "articles"}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-accent group-hover:underline">
                Browse collection
                <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 3l5 5-5 5" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
