import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { GlitchText } from "@/components/ui/GlitchText";
import { SearchPageClient } from "@/components/search/SearchPageClient";
import { getProvider } from "@/lib/providers";

export const metadata: Metadata = { title: "Search" };

export const revalidate = 60;

export default async function SearchPage() {
  const provider = getProvider();

  const [categories, tags, articles] = await Promise.all([
    provider.getCategories(),
    provider.getTags(),
    provider.getArticles(),
  ]);

  return (
    <Container className="py-8">
      <header className="text-center mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
          Explore
        </p>
        <GlitchText className="text-3xl md:text-4xl font-bold mb-2">Search</GlitchText>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Find articles by keyword, category, format, or mood.
        </p>
      </header>
      <Suspense fallback={<div className="text-muted-foreground">Loading search...</div>}>
        <SearchPageClient
          articles={articles}
          categories={categories}
          tags={tags}
        />
      </Suspense>
    </Container>
  );
}
