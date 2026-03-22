"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import type { GalleryPiece } from "@/types";
import { ArtistSpotlight } from "./ArtistSpotlight";
import { GalleryFilterBar } from "./GalleryFilterBar";
import { MasonryGrid } from "./MasonryGrid";
import { GalleryLightbox } from "./GalleryLightbox";

const BATCH_SIZE = 16;

interface GalleryPageClientProps {
  initialPieces: GalleryPiece[];
  spotlight: GalleryPiece | null;
}

export function GalleryPageClient({ initialPieces, spotlight }: GalleryPageClientProps) {
  const searchParams = useSearchParams();

  const [pieces, setPieces] = useState<GalleryPiece[]>(initialPieces);
  const [activeType, setActiveType] = useState("all");
  const [lightboxPiece, setLightboxPiece] = useState<GalleryPiece | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPieces.length >= BATCH_SIZE);

  // Filter pieces client-side
  const filteredPieces = useMemo(() => {
    if (activeType === "all") return pieces;
    return pieces.filter((p) => p.pieceType === activeType);
  }, [pieces, activeType]);

  // Deep-link: open lightbox from ?piece=slug
  useEffect(() => {
    const pieceSlug = searchParams.get("piece");
    if (pieceSlug) {
      const found = pieces.find((p) => p.slug.current === pieceSlug);
      if (found) setLightboxPiece(found);
    }
  }, [searchParams, pieces]);

  const handleLoadMore = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        offset: String(pieces.length),
        limit: String(BATCH_SIZE),
      });
      const res = await fetch(`/api/gallery?${params}`);
      if (res.ok) {
        const data = await res.json();
        const newPieces: GalleryPiece[] = data.pieces || [];
        setPieces((prev) => [...prev, ...newPieces]);
        if (newPieces.length < BATCH_SIZE) setHasMore(false);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [pieces.length]);

  const handleLightboxNavigate = useCallback((piece: GalleryPiece) => {
    setLightboxPiece(piece);
  }, []);

  return (
    <>
      {/* Artist Spotlight */}
      {spotlight && (
        <ArtistSpotlight
          piece={spotlight}
          onClick={() => setLightboxPiece(spotlight)}
        />
      )}

      {/* Filters */}
      <GalleryFilterBar
        activeType={activeType}
        onTypeChange={setActiveType}
      />

      {/* Masonry Grid */}
      <MasonryGrid
        pieces={filteredPieces}
        onPieceClick={setLightboxPiece}
      />

      {/* Load More */}
      {hasMore && activeType === "all" && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 rounded-lg bg-card border border-border text-sm font-medium hover:border-accent/30 hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      {/* Lightbox */}
      {lightboxPiece && (
        <GalleryLightbox
          piece={lightboxPiece}
          pieces={filteredPieces}
          onClose={() => setLightboxPiece(null)}
          onNavigate={handleLightboxNavigate}
        />
      )}
    </>
  );
}
