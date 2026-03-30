import type { Metadata } from "next";
import { Suspense } from "react";
import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { GlitchText } from "@/components/ui/GlitchText";
import { GalleryPageClient } from "@/components/gallery/GalleryPageClient";
import { GallerySpotlightSection } from "@/components/gallery/GallerySpotlightSection";
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
    <>
      {/* Page header + Spotlight — share 100vh, same pattern as Collections */}
      <div className={spotlight ? "collection-hero-viewport" : ""}>
        <Container className={spotlight ? "pt-6 pb-4 md:pt-8 md:pb-4 flex-shrink-0" : "py-8 md:py-12"}>
          <header className={spotlight ? "mb-0" : "mb-10"}>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
              Curated
            </p>
            <GlitchText className="text-3xl md:text-4xl font-bold mb-2">Gallery</GlitchText>
            <p className="text-muted-foreground max-w-lg">
              The best fan art, posters, and videos from across the Spider-Verse
              and beyond. Every piece links back to the original artist.
            </p>
          </header>
        </Container>

        {spotlight && (
          <Suspense>
            <GallerySpotlightSection spotlight={spotlight} />
          </Suspense>
        )}
      </div>

      {/* Filters + Grid + Load More — below the fold */}
      <Container className="pb-12">
        <Suspense>
          <GalleryPageClient initialPieces={pieces} spotlight={spotlight} />
        </Suspense>

        <SubmissionForm />
      </Container>
    </>
  );
}
