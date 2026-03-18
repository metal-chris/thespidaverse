import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getProvider } from "@/lib/providers";
import { urlFor } from "@/lib/sanity/image";
import { Container } from "@/components/ui/Container";
import type { SanityImage } from "@/types";

export const metadata: Metadata = {
  title: "Collections",
  description: "Seasonal and thematic article collections from The Spidaverse.",
};

export const revalidate = 60;

interface CollectionListItem {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  heroImage?: SanityImage;
  season?: string;
  theme?: string;
  featured?: boolean;
  articleCount: number;
}

export default async function CollectionsPage() {
  const provider = getProvider();
  const rawCollections = await provider.getCollections();
  const collections: CollectionListItem[] = rawCollections.map((c) => ({
    ...c,
    articleCount: c.articles?.length || 0,
  }));

  const featured = collections.filter((c) => c.featured);
  const regular = collections.filter((c) => !c.featured);

  return (
    <Container className="py-8 md:py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
          Curated
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Collections</h1>
        <p className="text-muted-foreground max-w-lg">
          Curated groups of articles &mdash; by season, theme, or vibe.
        </p>
      </header>

      {/* Featured Collections */}
      {featured.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-accent mb-4">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featured.map((col) => (
              <CollectionCard key={col._id} collection={col} featured />
            ))}
          </div>
        </section>
      )}

      {/* All Collections */}
      {regular.length > 0 && (
        <section>
          {featured.length > 0 && (
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              All Collections
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {regular.map((col) => (
              <CollectionCard key={col._id} collection={col} />
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
  );
}

function CollectionCard({
  collection,
  featured = false,
}: {
  collection: CollectionListItem;
  featured?: boolean;
}) {
  const imageUrl = collection.heroImage
    ? urlFor(collection.heroImage).width(800).height(400).url()
    : null;

  return (
    <Link
      href={`/collections/${collection.slug.current}`}
      className={`group block rounded-xl border border-border bg-card overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 hover:border-accent/30 ${
        featured ? "md:col-span-1" : ""
      }`}
    >
      {imageUrl ? (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={imageUrl}
            alt={collection.title}
            fill
            className="object-cover group-hover:scale-[1.06] transition-transform duration-500"
            sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-accent/10 to-accent/5 flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-10 h-10 text-accent/20" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {collection.season && (
            <span className="text-[11px] font-semibold text-accent uppercase tracking-wider">{collection.season}</span>
          )}
          {collection.theme && (
            <span className="text-[11px] text-muted-foreground">{collection.theme}</span>
          )}
        </div>
        <h3 className="font-bold text-lg group-hover:text-accent transition-colors">
          {collection.title}
        </h3>
        {collection.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{collection.description}</p>
        )}
        <p className="text-[11px] text-muted-foreground mt-3 font-mono">
          {collection.articleCount} article{collection.articleCount !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}
