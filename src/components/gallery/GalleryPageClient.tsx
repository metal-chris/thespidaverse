"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { GalleryPiece } from "@/types";
import { GalleryFilterBar } from "./GalleryFilterBar";
import { MasonryGrid } from "./MasonryGrid";
import { GalleryDetailView } from "./GalleryDetailView";
import { Button } from "@/components/ui/Button";

const BATCH_SIZE = 16;

interface GalleryPageClientProps {
  initialPieces: GalleryPiece[];
  spotlight: GalleryPiece | null;
  totalCount: number;
}

export function GalleryPageClient({ initialPieces, spotlight, totalCount }: GalleryPageClientProps) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Merge spotlight into pieces so it's accessible in the detail viewer
  const [pieces, setPieces] = useState<GalleryPiece[]>(() => {
    if (!spotlight || initialPieces.some((p) => p._id === spotlight._id)) return initialPieces;
    return [spotlight, ...initialPieces];
  });
  const [activeType, setActiveType] = useState("all");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPieces.length >= BATCH_SIZE);

  const [activeSort, setActiveSort] = useState<"newest" | "oldest" | "a-z" | "z-a">("newest");

  // Filter + sort pieces client-side
  const filteredPieces = useMemo(() => {
    let result = activeType === "all" ? [...pieces] : pieces.filter((p) => p.pieceType === activeType);

    switch (activeSort) {
      case "oldest":
        result.sort((a, b) => (a.publishedAt || "").localeCompare(b.publishedAt || ""));
        break;
      case "a-z":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "z-a":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      // "newest" is already the default order from the API
    }

    return result;
  }, [pieces, activeType, activeSort]);

  // Grid pieces: exclude spotlight to avoid duplicate display
  const gridPieces = useMemo(() => {
    if (!spotlight) return filteredPieces;
    return filteredPieces.filter((p) => p._id !== spotlight._id);
  }, [filteredPieces, spotlight]);

  // Check if we're viewing a specific piece
  const pieceSlug = searchParams.get("piece");
  const viewerPiece = pieceSlug
    ? pieces.find((p) => p.slug.current === pieceSlug) || null
    : null;

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

  // Navigate to piece viewer
  const handlePieceClick = useCallback((piece: GalleryPiece) => {
    router.push(`/gallery?piece=${piece.slug.current}`, { scroll: false });
  }, [router]);

  // ── Detail view: full-page viewer with filmstrip ──
  if (viewerPiece) {
    return (
      <GalleryDetailView
        initialPiece={viewerPiece}
        pieces={filteredPieces}
        hasMore={hasMore && activeType === "all"}
        onLoadMore={handleLoadMore}
      />
    );
  }

  // ── Grid mode: masonry gallery ──
  return (
    <>
      <GalleryFilterBar
        activeType={activeType}
        onTypeChange={setActiveType}
        activeSort={activeSort}
        onSortChange={setActiveSort}
        pieces={pieces}
        totalCount={totalCount}
      />

      <MasonryGrid
        pieces={gridPieces}
        onPieceClick={handlePieceClick}
      />

      {hasMore && activeType === "all" && (
        <div className="flex justify-center mt-8">
          <Button
            variant="secondary"
            size="lg"
            shape="rounded"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? t("common.loading") : t("gallery.loadMore")}
          </Button>
        </div>
      )}
    </>
  );
}
