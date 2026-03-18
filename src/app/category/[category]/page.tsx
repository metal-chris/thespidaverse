import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { ArticleGrid } from "@/components/home/ArticleGrid";

export const revalidate = 60;

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const provider = getProvider();
  const categories = await provider.getCategories();
  const category = categories.find((c) => c.slug.current === slug);

  if (!category) return { title: "Category Not Found" };

  return {
    title: category.title,
    description: category.description || `Articles in ${category.title}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category: slug } = await params;
  const provider = getProvider();

  const [categories, articles] = await Promise.all([
    provider.getCategories(),
    provider.getArticlesByCategory(slug),
  ]);

  const category = categories.find((c) => c.slug.current === slug);

  if (!category) notFound();

  return (
    <Container as="section" className="py-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">{category.title}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground text-lg">
            {category.description}
          </p>
        )}
      </header>
      <ArticleGrid articles={articles} />
    </Container>
  );
}
