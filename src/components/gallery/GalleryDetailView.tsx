"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { CollapsibleActions } from "@/components/ui/CollapsibleActions";
import { VideoEmbed } from "./VideoEmbed";
import { useGalleryNavigation } from "@/hooks/useGalleryNavigation";
import type { GalleryPiece } from "@/types";

// ── Helpers ──────────────────────────────────────────────

const FRANCHISE_LABELS: Record<string, string> = {
  "spider-verse": "Spider-Verse",
  venom: "Venom",
  anime: "Anime",
  books: "Books",
  games: "Games",
  movies: "Movies",
  tv: "TV",
  music: "Music",
  culture: "Culture",
  other: "Other",
};

function frameNumber(index: number): string {
  const base = Math.floor(index / 2) + 1;
  const suffix = index % 2 === 1 ? "A" : "";
  return `${base}${suffix}`;
}

function parseDimensions(ref?: string): { w: number; h: number } | null {
  if (!ref) return null;
  const m = ref.match(/-(\d+)x(\d+)-/);
  return m ? { w: Number(m[1]), h: Number(m[2]) } : null;
}

function getThumbnailUrl(piece: GalleryPiece): string {
  if (piece.pieceType === "image") {
    const firstImage = piece.images?.[0] || piece.image;
    return piece.imageUrl || (firstImage ? urlFor(firstImage).width(150).url() : "") || "";
  }
  return piece.videoThumbnailUrl || (piece.videoThumbnail ? urlFor(piece.videoThumbnail).width(150).url() : "") || "";
}

function getAllImages(piece: GalleryPiece): { url: string; dims: { width: number; height: number }; alt: string }[] {
  if (piece.imageUrls?.length) {
    return piece.imageUrls.map((url, i) => ({
      url, dims: { width: 1200, height: 800 }, alt: `${piece.title} (${i + 1})`,
    }));
  }
  if (piece.images?.length) {
    return piece.images.map((img, i) => {
      const dims = parseDimensions(img.asset._ref);
      const w = dims ? Math.min(dims.w, 2400) : 1200;
      return {
        url: urlFor(img).width(w).url() || "",
        dims: dims ? { width: dims.w, height: dims.h } : { width: 1200, height: 800 },
        alt: img.alt || `${piece.title} (${i + 1})`,
      };
    });
  }
  if (piece.imageUrl) return [{ url: piece.imageUrl, dims: { width: 1200, height: 800 }, alt: piece.title }];
  if (piece.image) {
    const dims = parseDimensions(piece.image.asset._ref);
    const w = dims ? Math.min(dims.w, 2400) : 1200;
    return [{ url: urlFor(piece.image).width(w).url() || "", dims: dims ? { width: dims.w, height: dims.h } : { width: 1200, height: 800 }, alt: piece.image.alt || piece.title }];
  }
  return [];
}

function isInstagramSource(piece: GalleryPiece): boolean {
  return !!(piece.originalUrl?.includes("instagram.com") || piece.videoUrl?.includes("instagram.com"));
}

function getInstagramEmbedUrl(piece: GalleryPiece): string | null {
  const url = piece.videoUrl || piece.originalUrl || "";
  const match = url.match(/instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/);
  return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : null;
}

// ── Component ────────────────────────────────────────────

interface GalleryDetailViewProps {
  initialPiece: GalleryPiece;
  pieces: GalleryPiece[];
}

export function GalleryDetailView({ initialPiece, pieces }: GalleryDetailViewProps) {
  const router = useRouter();
  const stripRef = useRef<HTMLDivElement>(null);

  const initialIndex = pieces.findIndex((p) => p._id === initialPiece._id);

  // Carousel state (within multi-image pieces)
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselIndexRef = useRef(carouselIndex);
  carouselIndexRef.current = carouselIndex;

  // Track carousel length for edge detection
  const carouselLengthRef = useRef(0);

  // Horizontal nav handler (updated via ref to avoid circular dependency with goTo)
  const horizontalNavRef = useRef<(dir: "next" | "prev") => void>(() => {});

  const {
    activeIndex,
    direction,
    isAnimating,
    swipeProgress,
    goTo,
    canGoNext,
    canGoPrev,
    goNext,
    goPrev,
    containerRef,
  } = useGalleryNavigation({
    totalPieces: pieces.length,
    initialIndex: Math.max(0, initialIndex),
    animationDuration: 300,
    cooldownDuration: 80,
    wheelThreshold: 60,
    swipeThreshold: 50,
    onHorizontalNav: useCallback((dir: "next" | "prev") => {
      horizontalNavRef.current(dir);
    }, []),
  });

  const activePiece = pieces[activeIndex];
  const activeIndexRef = useRef(activeIndex);
  activeIndexRef.current = activeIndex;

  // Wire up horizontal nav handler now that goTo is available
  horizontalNavRef.current = (dir: "next" | "prev") => {
    const idx = carouselIndexRef.current;
    const len = carouselLengthRef.current;

    if (len <= 1) {
      // Single image or video — horizontal nav moves between pieces
      if (dir === "next" && activeIndexRef.current < pieces.length - 1) {
        goTo(activeIndexRef.current + 1);
      } else if (dir === "prev" && activeIndexRef.current > 0) {
        goTo(activeIndexRef.current - 1);
      }
      return;
    }

    if (dir === "next" && idx < len - 1) {
      setCarouselIndex(idx + 1);
    } else if (dir === "prev" && idx > 0) {
      setCarouselIndex(idx - 1);
    }
  };
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeHeight, setIframeHeight] = useState(480);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer when piece changes
  useEffect(() => { setDrawerOpen(false); }, [activePiece._id]);

  // Reset carousel + iframe state when piece changes
  useEffect(() => {
    setCarouselIndex(0);
    setIframeLoaded(false);
    setIframeHeight(480);
  }, [activePiece._id]);

  // Auto-size Instagram embed via its postMessage resize events
  const igIframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (!isInstagramSource(activePiece)) return;
    const handleMessage = (e: MessageEvent) => {
      if (typeof e.data === "string") {
        try {
          const data = JSON.parse(e.data);
          if (data.type === "MEASURE" && data.details?.height) {
            setIframeHeight(data.details.height);
          }
        } catch { /* ignore non-JSON messages */ }
      }
      // Instagram also sends {type: "resize", height: N} in some cases
      if (e.data?.type === "resize" && typeof e.data.height === "number") {
        setIframeHeight(e.data.height);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [activePiece]);

  // Share URL (built client-side)
  const [shareUrl, setShareUrl] = useState(`/gallery?piece=${activePiece.slug.current}`);
  useEffect(() => {
    setShareUrl(`${window.location.origin}/gallery?piece=${activePiece.slug.current}`);
  }, [activePiece.slug]);

  // Update URL for deep-linking
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("piece", activePiece.slug.current);
    window.history.replaceState(null, "", url.toString());
  }, [activePiece.slug]);

  // Hide swipe hint on first navigation
  useEffect(() => {
    if (activeIndex !== Math.max(0, initialIndex)) {
      setHasInteracted(true);
    }
  }, [activeIndex, initialIndex]);

  // Escape to go back
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/gallery");
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [router]);

  // Sync film strip position — pixel-perfect centering
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const el = strip.querySelector(`[data-piece-id="${activePiece._id}"]`) as HTMLElement | null;
    if (!el) return;

    const isDesktop = window.innerWidth >= 768;
    const behavior = isAnimating ? "smooth" : "auto";

    if (isDesktop) {
      const stripH = strip.clientHeight;
      const target = el.offsetTop - stripH / 2 + el.offsetHeight / 2;
      strip.scrollTo({ top: target, behavior });
    } else {
      const stripW = strip.clientWidth;
      const target = el.offsetLeft - stripW / 2 + el.offsetWidth / 2;
      strip.scrollTo({ left: target, behavior });
    }
  }, [activeIndex, activePiece._id, isAnimating]);

  const handleThumbTap = useCallback((index: number) => {
    setHasInteracted(true);
    goTo(index);
  }, [goTo]);

  // Transition classes
  const transitionClass = isAnimating
    ? direction === "next" ? "gallery-piece-enter-next" : "gallery-piece-enter-prev"
    : "gallery-piece-active";

  const swipeTransform = !isAnimating && Math.abs(swipeProgress) > 0
    ? `translateY(${-swipeProgress * 30}px) scale(${1 - Math.abs(swipeProgress) * 0.02})`
    : undefined;

  // Content type detection
  const isIG = isInstagramSource(activePiece);
  const igEmbedUrl = isIG ? getInstagramEmbedUrl(activePiece) : null;
  const isVideo = activePiece.pieceType === "video" && activePiece.videoUrl && !isIG;
  const isImage = activePiece.pieceType === "image" && !isIG;

  const images = isImage ? getAllImages(activePiece) : [];
  const isCarousel = images.length > 1;
  const currentImage = images[carouselIndex] || images[0];

  // Keep carousel length ref in sync for the horizontal nav callback
  carouselLengthRef.current = images.length;

  return (
    <div ref={containerRef} className="gallery-viewer">
      {/* ── Back button ── */}
      <button
        onClick={() => router.push("/gallery")}
        className="gallery-viewer-back"
        aria-label="Back to gallery"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span className="hidden sm:inline text-sm">Gallery</span>
      </button>

      {/* ── Swipe hint (mobile only, first visit) ── */}
      {!hasInteracted && (
        <div className="gallery-swipe-hint">
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
          </svg>
          Swipe to browse
        </div>
      )}

      {/* ── Three-panel layout ── */}
      <div className="gallery-viewer-content">
        {/* ── Media area — image/embed fills this ── */}
        <div className="gallery-viewer-media">
          <div
            key={activePiece._id}
            className={`gallery-piece-wrapper ${transitionClass}`}
            style={swipeTransform ? { transform: swipeTransform } : undefined}
          >
            {/* Instagram embed */}
            {isIG && igEmbedUrl && (
              <div className="relative w-full max-w-xl mx-auto" style={{ minHeight: 480 }}>
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg animate-pulse">
                    <span className="text-muted-foreground text-sm">Loading embed...</span>
                  </div>
                )}
                <iframe
                  ref={igIframeRef}
                  src={igEmbedUrl}
                  className="w-full rounded-lg"
                  style={{ border: "none", height: iframeHeight }}
                  allowFullScreen
                  title={`Instagram: ${activePiece.title}`}
                  onLoad={() => {
                    setIframeLoaded(true);
                    // Fallback: measure content height after a delay if postMessage doesn't fire
                    setTimeout(() => {
                      try {
                        const h = igIframeRef.current?.contentDocument?.documentElement?.scrollHeight;
                        if (h && h > 100) setIframeHeight(h);
                      } catch { /* cross-origin, use postMessage instead */ }
                    }, 1500);
                  }}
                />
              </div>
            )}

            {/* YouTube / TikTok video */}
            {isVideo && activePiece.videoUrl && (
              <div className="w-full mx-auto">
                <VideoEmbed videoUrl={activePiece.videoUrl} videoPlatform={activePiece.videoPlatform} />
              </div>
            )}

            {/* Sanity image (with carousel) */}
            {isImage && currentImage && (
              <div className="relative max-h-full max-w-full flex items-center justify-center">
                <Image
                  key={currentImage.url}
                  src={currentImage.url}
                  alt={currentImage.alt}
                  width={currentImage.dims.width}
                  height={currentImage.dims.height}
                  className="object-contain rounded-lg"
                  style={{ maxWidth: "100%", maxHeight: "calc(100vh - 140px)", width: "auto", height: "auto" }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 800px"
                  priority
                  unoptimized
                />

                {isCarousel && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCarouselIndex((i) => Math.max(0, i - 1)); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors disabled:opacity-30"
                      disabled={carouselIndex === 0}
                      aria-label="Previous image"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setCarouselIndex((i) => Math.min(images.length - 1, i + 1)); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors disabled:opacity-30"
                      disabled={carouselIndex === images.length - 1}
                      aria-label="Next image"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => { e.stopPropagation(); setCarouselIndex(i); }}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === carouselIndex ? "bg-white scale-110" : "bg-white/40 hover:bg-white/60"
                          }`}
                          aria-label={`Image ${i + 1} of ${images.length}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Fallback */}
            {!isIG && !isVideo && !isImage && (
              <div className="w-full max-w-lg mx-auto aspect-video bg-muted rounded-lg flex items-center justify-center">
                <p className="text-muted-foreground">No media available</p>
              </div>
            )}
          </div>

          {/* ── Piece navigation arrows (desktop) ── */}
          <button
            onClick={goPrev}
            className={`hidden md:flex absolute top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all ${
              canGoPrev ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label="Previous piece"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 15l-6-6-6 6" />
            </svg>
          </button>
          <button
            onClick={goNext}
            className={`hidden md:flex absolute bottom-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-all ${
              canGoNext ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-label="Next piece"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
            </svg>
          </button>
        </div>

        {/* ── Mobile drawer (collapsible, between media and filmstrip) ── */}
        <div
          className="gallery-viewer-drawer"
          data-open={drawerOpen}
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <div className="gallery-viewer-drawer-handle" />
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-sm font-bold">{activePiece.title}</h2>
                <p className="text-xs text-muted-foreground">
                  by {activePiece.artistName}
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-md bg-accent/10 text-accent border border-accent/20 flex-shrink-0">
                {FRANCHISE_LABELS[activePiece.franchise] || activePiece.franchise}
              </span>
            </div>

            {drawerOpen && (
              <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                {activePiece.description && (
                  <p className="text-xs text-muted-foreground mb-3">{activePiece.description}</p>
                )}
                {activePiece.originalUrl && (
                  <a href={activePiece.originalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline mb-3">
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Original
                  </a>
                )}
                <div className="pt-3 border-t border-border">
                  <CollapsibleActions
                    slug={`gallery-${activePiece.slug.current}`}
                    title={activePiece.title}
                    shareUrl={shareUrl}
                    originalUrl={activePiece.originalUrl}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Details sidebar (desktop only) ── */}
        <div className="gallery-viewer-sidebar">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider rounded-md bg-accent/10 text-accent border border-accent/20">
              {FRANCHISE_LABELS[activePiece.franchise] || activePiece.franchise}
            </span>
            <span className="text-xs text-muted-foreground font-mono ml-auto">
              {activeIndex + 1} / {pieces.length}
            </span>
          </div>

          <h2 className="text-xl font-bold mt-3">{activePiece.title}</h2>
          <p className="text-muted-foreground mt-1">
            by{" "}
            {activePiece.artistUrl ? (
              <a href={activePiece.artistUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                {activePiece.artistName}
              </a>
            ) : (
              <span className="text-foreground">{activePiece.artistName}</span>
            )}
          </p>

          {activePiece.description && (
            <p className="text-sm text-muted-foreground mt-4">{activePiece.description}</p>
          )}

          {activePiece.originalUrl && (
            <a
              href={activePiece.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-4 text-sm text-accent hover:underline"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Original
            </a>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <CollapsibleActions
              slug={`gallery-${activePiece.slug.current}`}
              title={activePiece.title}
              shareUrl={shareUrl}
              originalUrl={activePiece.originalUrl}
            />
          </div>
        </div>
        {/* ── Film Strip ── */}
        <div
          className="gallery-viewer-strip"
          onTouchStart={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <span className="film-stock-label" aria-hidden="true">
            Parker TX 35mm
          </span>

          <div
            ref={stripRef}
            className="gallery-viewer-strip-scroll"
            role="navigation"
            aria-label="Gallery film strip"
          >
            <div className="gallery-viewer-snap-spacer" aria-hidden="true" />

            {pieces.map((piece, i) => {
              const isActive = piece._id === activePiece._id;
              const thumbUrl = getThumbnailUrl(piece);

              return (
                <div
                  key={piece._id}
                  data-piece-id={piece._id}
                  className={`film-frame ${isActive ? "film-frame-active" : ""}`}
                >
                  <div className="film-frame-number" aria-hidden="true">
                    {frameNumber(i)}
                  </div>

                  <button
                    className="film-frame-thumb"
                    aria-label={`${piece.title} by ${piece.artistName}`}
                    aria-current={isActive ? "true" : undefined}
                    onClick={() => handleThumbTap(i)}
                  >
                    {thumbUrl ? (
                      <Image
                        src={thumbUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="88px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-800" />
                    )}

                    {piece.pieceType === "video" && (
                      <div className="film-frame-video-badge">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white drop-shadow-md" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              );
            })}

            <div className="gallery-viewer-snap-spacer" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}
