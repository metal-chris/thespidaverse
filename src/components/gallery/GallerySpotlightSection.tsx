"use client";

import { useRouter } from "@/i18n/navigation";
import { ArtistSpotlight } from "./ArtistSpotlight";
import type { GalleryPiece } from "@/types";

interface GallerySpotlightSectionProps {
  spotlight: GalleryPiece;
}

export function GallerySpotlightSection({ spotlight }: GallerySpotlightSectionProps) {
  const router = useRouter();

  return (
    <ArtistSpotlight
      piece={spotlight}
      onClick={() => router.push(`/gallery?piece=${spotlight.slug.current}`, { scroll: false })}
    />
  );
}
