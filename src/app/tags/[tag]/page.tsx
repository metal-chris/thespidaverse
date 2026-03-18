import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { ArticleGrid } from "@/components/home/ArticleGrid";
import { capitalizeTag } from "@/lib/utils";

export const revalidate = 60;

interface Props {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag: slug } = await params;
  const provider = getProvider();
  const tags = await provider.getTags();
  const tagData = tags.find((t) => t.slug.current === slug);

  if (!tagData) return { title: "Tag Not Found" };

  return {
    title: `#${capitalizeTag(tagData.title)}`,
    description: `Articles tagged with ${capitalizeTag(tagData.title)}`,
  };
}

export default async function TagPage({ params }: Props) {
  const { tag: slug } = await params;
  const provider = getProvider();

  const [tags, articles] = await Promise.all([
    provider.getTags(),
    provider.getArticlesByTag(slug),
  ]);

  const tagData = tags.find((t) => t.slug.current === slug);

  if (!tagData) notFound();

  return (
    <Container as="section" className="py-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">#{capitalizeTag(tagData.title)}</h1>
      </header>
      <ArticleGrid articles={articles} />
    </Container>
  );
}
