import { getTranslations } from "next-intl/server";
import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeContent } from "@/components/home/HomeContent";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { NewsletterSignup } from "@/components/content/NewsletterSignup";
import { CurrentlyConsumingWidget } from "@/components/widgets/CurrentlyConsuming";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const revalidate = 60;

export default async function HomePage() {
  const t = await getTranslations();
  const provider = getProvider();

  const [articles, tags, consuming] = await Promise.all([
    provider.getArticles(),
    provider.getTags(),
    provider.getCurrentlyConsuming(),
  ]);

  return (
    <>
      {/* Hero + Categories — single viewport unit */}
      <HeroSection className="min-h-[calc(100vh-65px)]">
        <Container className="relative z-10 pb-6 -mt-4">
          <CategoryGrid />
        </Container>
      </HeroSection>

      {/* Currently consuming widget — generous breathing room */}
      <ScrollReveal>
        <Container as="section" className="pt-8 pb-16">
          <CurrentlyConsumingWidget data={consuming} />
        </Container>
      </ScrollReveal>

      {/* Latest articles */}
      <Container as="section" className="pt-4 pb-20">
        <ScrollReveal>
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-accent">///</span> {t("home.latest")}
            </h2>
            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              {t("home.articlesCount", { count: articles.length })}
            </span>
          </div>
        </ScrollReveal>
        <HomeContent articles={articles} tags={tags} />
      </Container>

      {/* Newsletter */}
      <ScrollReveal>
        <Container as="section" className="pb-20">
          <NewsletterSignup variant="banner" />
        </Container>
      </ScrollReveal>
    </>
  );
}
