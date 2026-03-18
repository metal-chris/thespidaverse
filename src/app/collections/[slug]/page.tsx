import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProvider } from "@/lib/providers";
import { urlFor } from "@/lib/sanity/image";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

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

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const provider = getProvider();
  const collection = await provider.getCollectionBySlug(slug);

  if (!collection) notFound();

  const heroUrl = collection.heroImage
    ? urlFor(collection.heroImage).width(1200).height(500).url()
    : null;

  return (
    <Container className="py-8 max-w-5xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        {" / "}
        <Link href="/collections" className="hover:text-foreground">Collections</Link>
        {" / "}
        <span className="text-foreground">{collection.title}</span>
      </nav>

      {/* Hero */}
      {heroUrl && (
        <div className="relative aspect-[12/5] rounded-lg overflow-hidden mb-8">
          <Image
            src={heroUrl}
            alt={collection.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            {collection.season && (
              <span className="text-xs text-accent font-medium uppercase tracking-wider">
                {collection.season}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">{collection.title}</h1>
          </div>
        </div>
      )}

      {!heroUrl && (
        <header className="mb-8">
          {collection.season && (
            <span className="text-xs text-accent font-medium uppercase tracking-wider">
              {collection.season}
            </span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold">{collection.title}</h1>
        </header>
      )}

      {collection.description && (
        <p className="text-muted-foreground mb-8 max-w-2xl">{collection.description}</p>
      )}

      {/* Articles */}
      {collection.articles && collection.articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collection.articles.map((article) => (
            <Link key={article._id} href={`/articles/${article.slug.current}`}>
              <Card article={article} />
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-12">
          This collection is being curated. Articles coming soon.
        </p>
      )}
    </Container>
  );
}
