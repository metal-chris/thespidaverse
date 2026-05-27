import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { GlitchText } from "@/components/ui/GlitchText";
import { Card } from "@/components/ui/Card";
import { ArticlesIndex } from "@/components/content/ArticlesIndex";

export const metadata: Metadata = {
  title: "Articles",
  description:
    "All articles from The Spidaverse — reviews, breakdowns, and takes across movies, TV, games, anime, books, and music.",
};

export const revalidate = 60;

export default async function ArticlesPage() {
  const t = await getTranslations();
  const provider = getProvider();

  const [articles, tags] = await Promise.all([
    provider.getArticles(),
    provider.getTags(),
  ]);

  const sorted = [...articles].sort((a, b) => {
    const aDate = a.publishedAt || a._createdAt || "";
    const bDate = b.publishedAt || b._createdAt || "";
    return bDate.localeCompare(aDate);
  });

  const spotlight = sorted[0];
  const rest = sorted.slice(1);

  return (
    <Container className="pt-4 pb-8 md:pt-6 md:pb-12">
      <header className="mb-8 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
          {t("articles.subtitle")}
        </p>
        <GlitchText className="text-3xl md:text-4xl font-bold mb-2">
          {t("articles.heading")}
        </GlitchText>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {t("articles.description")}
        </p>
      </header>

      {spotlight && (
        <section className="mb-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            {t("articles.spotlight")}
          </h2>
          <Card article={spotlight} featured />
        </section>
      )}

      {rest.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            {t("articles.all")}
          </h2>
          <ArticlesIndex articles={rest} tags={tags} />
        </section>
      )}

      {articles.length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          {t("articles.empty")}
        </p>
      )}
    </Container>
  );
}
