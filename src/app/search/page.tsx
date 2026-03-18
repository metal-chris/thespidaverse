import { Suspense } from "react";
import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
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
      <h1 className="text-3xl font-bold mb-6">Search</h1>
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
