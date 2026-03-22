import type { Metadata } from "next";
import { Suspense } from "react";
import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { GalleryPageClient } from "@/components/gallery/GalleryPageClient";
import { SubmissionForm } from "@/components/gallery/SubmissionForm";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Curated fan art, posters, and videos from across the Spider-Verse and beyond. Every piece links back to the original artist.",
};

export const revalidate = 60;

export default async function GalleryPage() {
  const provider = getProvider();

  const [pieces, spotlight] = await Promise.all([
    provider.getGalleryPieces({ limit: 16 }),
    provider.getGallerySpotlight(),
  ]);

  return (
    <Container className="py-8 md:py-12">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
          Curated
        </p>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Gallery</h1>
        <p className="text-muted-foreground max-w-lg">
          The best fan art, posters, and videos from across the Spider-Verse
          and beyond. Every piece links back to the original artist.
        </p>
      </header>

      <Suspense>
        <GalleryPageClient initialPieces={pieces} spotlight={spotlight} />
      </Suspense>

      <SubmissionForm />
    </Container>
  );
}
