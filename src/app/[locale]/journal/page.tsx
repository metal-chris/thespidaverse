import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { GlitchText } from "@/components/ui/GlitchText";
import { JournalTimeline } from "@/components/journal/JournalTimeline";

export const metadata: Metadata = {
  title: "Journal",
  description: "A timeline of everything Spida is watching, playing, reading, and listening to.",
};

export const revalidate = 60;

export default async function JournalPage() {
  const t = await getTranslations();
  const provider = getProvider();
  const entries = await provider.getJournalEntries();

  return (
    <Container className="pt-4 pb-8 md:pt-6 md:pb-12">
      <header className="mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
          {t("journal.subtitle")}
        </p>
        <GlitchText className="text-3xl md:text-4xl font-bold mb-2">{t("journal.heading")}</GlitchText>
        <p className="text-muted-foreground max-w-lg mx-auto">
          {t("journal.description")}
        </p>
      </header>

      <JournalTimeline entries={entries} />
    </Container>
  );
}
