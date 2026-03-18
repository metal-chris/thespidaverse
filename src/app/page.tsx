import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { HeroSection } from "@/components/home/HeroSection";
import { HomeContent } from "@/components/home/HomeContent";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { NewsletterSignup } from "@/components/content/NewsletterSignup";
import { CurrentlyConsumingWidget } from "@/components/widgets/CurrentlyConsuming";

export const revalidate = 60;

export default async function HomePage() {
  const provider = getProvider();

  const [articles, tags, consuming] = await Promise.all([
    provider.getArticles(),
    provider.getTags(),
    provider.getCurrentlyConsuming(),
  ]);

  return (
    <>
      <HeroSection />

      {/* Category grid */}
      <Container as="section" className="pb-10 -mt-4">
        <CategoryGrid />
      </Container>

      {/* Currently consuming widget */}
      <Container as="section" className="pb-10">
        <CurrentlyConsumingWidget data={consuming} />
      </Container>

      {/* Latest articles */}
      <Container as="section" className="pb-10">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest</h2>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            {articles.length} articles
          </span>
        </div>
        <HomeContent articles={articles} tags={tags} />
      </Container>

      {/* Newsletter */}
      <Container as="section" className="pb-16">
        <NewsletterSignup variant="banner" />
      </Container>
    </>
  );
}
