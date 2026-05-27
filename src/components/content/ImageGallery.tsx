"use client";

import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { cn } from "@/lib/utils";
import type { SanityImage } from "@/types";

interface ImageGalleryProps {
  images: (SanityImage & { caption?: string })[];
  layout?: "grid" | "two-col" | "three-col";
}

const LAYOUT_CLASSES: Record<string, string> = {
  grid: "grid-cols-2 md:grid-cols-3",
  "two-col": "grid-cols-1 md:grid-cols-2",
  "three-col": "grid-cols-1 md:grid-cols-3",
};

type GalleryImage = SanityImage & { caption?: string; mockUrl?: string };

/**
 * Multi-image gallery block for Portable Text.
 * Layouts: auto-grid (default), two-col, three-col.
 */
export function ImageGallery({ images, layout = "grid" }: ImageGalleryProps) {
  if (!images || images.length === 0) return null;

  return (
    <figure
      className={cn(
        "my-10 grid gap-3 not-prose",
        LAYOUT_CLASSES[layout || "grid"] || LAYOUT_CLASSES.grid
      )}
    >
      {images.map((img, idx) => {
        const galleryImg = img as GalleryImage;
        let imageUrl = "";
        try {
          imageUrl = urlFor(galleryImg).width(800).url() || "";
        } catch {
          // Mock data has fake asset refs — fall back to mockUrl
        }
        if (!imageUrl) imageUrl = galleryImg.mockUrl || "";
        if (!imageUrl) return null;

        return (
          <div
            key={idx}
            className="relative aspect-[4/3] rounded-md overflow-hidden bg-muted/20 ring-1 ring-border"
          >
            <Image
              src={imageUrl}
              alt={galleryImg.alt || ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
            {galleryImg.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                <span className="text-[11px] text-white/95 leading-tight">
                  {galleryImg.caption}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </figure>
  );
}
