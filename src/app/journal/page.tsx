import type { Metadata } from "next";
import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { JournalTimeline } from "@/components/journal/JournalTimeline";

export const metadata: Metadata = {
  title: "Journal",
  description: "A timeline of everything Spida is watching, playing, reading, and listening to.",
};

export const revalidate = 60;

export default async function JournalPage() {
  const provider = getProvider();
  const entries = await provider.getJournalEntries();

  return (
    <Container className="py-8 md:py-12">
      <header className="mb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
          Media Diary
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Journal</h1>
        <p className="text-muted-foreground max-w-lg">
          Everything I&rsquo;m consuming &mdash; tracked, rated, and timestamped.
        </p>
      </header>

      <JournalTimeline entries={entries} />
    </Container>
  );
}
