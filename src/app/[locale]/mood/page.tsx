import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { MoodSelector } from "@/components/mood/MoodSelector";

export const metadata: Metadata = {
  title: "What's Your Mood?",
  description: "Pick a vibe and get personalized media recommendations from The Spidaverse.",
};

export const revalidate = 60;

export default async function MoodPage() {
  const t = await getTranslations();
  const provider = getProvider();

  const [articles, moodTags] = await Promise.all([
    provider.getArticles(),
    provider.getMoods(),
  ]);

  return (
    <Container className="py-8">
      <header className="mb-8 text-center">
        <h1 className="glitch-text text-3xl font-bold mb-2" data-text={t("mood.heading")}>{t("mood.heading")}</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {t("mood.description")}
        </p>
      </header>

      <MoodSelector articles={articles} availableMoods={moodTags} />
    </Container>
  );
}
