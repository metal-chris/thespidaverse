/**
 * Gallery Image Resolver
 *
 * Visits each gallery piece's originalUrl and extracts the actual image URL
 * for each platform (ArtStation, DeviantArt, YouTube, Instagram).
 *
 * Usage:
 *   npx tsx scripts/gallery-resolve-images.ts                     # Resolve all batches
 *   npx tsx scripts/gallery-resolve-images.ts --batch anime       # Resolve one batch
 *   npx tsx scripts/gallery-resolve-images.ts --dry-run           # Preview without writing
 *
 * Platform strategies:
 *   ArtStation  → Fetch page HTML, extract og:image meta tag (CDN URL)
 *   DeviantArt  → Fetch page HTML, extract og:image meta tag (CDN URL)
 *   YouTube     → Construct thumbnail: https://img.youtube.com/vi/{ID}/maxresdefault.jpg
 *   Instagram   → Fetch page HTML, extract og:image meta tag (CDN URL)
 *   Fallback    → Try og:image from any URL
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, join } from "path";

// --- Batch file registry ---

const BATCH_FILES: Record<string, string> = {
  anime: "gallery-batch-anime.json",
  games: "gallery-batch-games.json",
  "movies-tv": "gallery-batch-movies-tv.json",
  "music-culture": "gallery-batch-music-culture.json",
  spiderverse: "gallery-batch-spiderverse.json",
};

interface GalleryInput {
  title: string;
  artistName: string;
  artistUrl?: string;
  originalUrl?: string;
  franchise: string;
  description?: string;
  pieceType?: "image" | "video";
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string;
  videoPlatform?: "youtube" | "tiktok" | "instagram";
  videoThumbnailUrl?: string;
  isSpotlight?: boolean;
}

// --- Platform detection ---

function detectPlatform(url: string): "artstation" | "deviantart" | "youtube" | "instagram" | "unknown" {
  if (url.includes("artstation.com")) return "artstation";
  if (url.includes("deviantart.com")) return "deviantart";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("instagram.com")) return "instagram";
  return "unknown";
}

// --- YouTube thumbnail (no fetch needed) ---

function getYouTubeThumbnail(url: string): string | null {
  // Extract video ID from various YouTube URL formats
  let match = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (!match) match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (!match) match = url.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (!match) match = url.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
  if (match) {
    return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
  }
  return null;
}

// --- Fetch og:image from HTML ---

async function fetchOgImage(url: string, retries = 2): Promise<string | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
        redirect: "follow",
      });

      clearTimeout(timeout);

      if (!res.ok) {
        if (attempt < retries) continue;
        return null;
      }

      const html = await res.text();

      // Try og:image first (most reliable)
      let match = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i);
      if (!match) match = html.match(/content="([^"]+)"\s+(?:property|name)="og:image"/i);

      // Try twitter:image as fallback
      if (!match) match = html.match(/<meta\s+(?:property|name)="twitter:image"\s+content="([^"]+)"/i);
      if (!match) match = html.match(/content="([^"]+)"\s+(?:property|name)="twitter:image"/i);

      if (match) {
        let imgUrl = match[1];
        // Decode HTML entities
        imgUrl = imgUrl.replace(/&amp;/g, "&");
        return imgUrl;
      }

      return null;
    } catch (err) {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}

// --- ArtStation-specific: try API endpoint first ---

async function resolveArtStation(url: string): Promise<string | null> {
  // ArtStation artwork URLs look like: artstation.com/artwork/XXXXX
  const artworkMatch = url.match(/artstation\.com\/artwork\/([a-zA-Z0-9]+)/);

  if (artworkMatch) {
    // Try the ArtStation API (returns JSON with image assets)
    try {
      const apiUrl = `https://www.artstation.com/projects/${artworkMatch[1]}.json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "application/json",
        },
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json() as {
          assets?: Array<{ image_url?: string; has_image?: boolean }>;
          cover_url?: string;
          smaller_square_cover_url?: string;
        };
        // Get the first image asset (highest quality)
        if (data.assets?.length) {
          const imgAsset = data.assets.find((a: { has_image?: boolean }) => a.has_image);
          if (imgAsset?.image_url) {
            return imgAsset.image_url;
          }
        }
        // Fallback to cover
        if (data.cover_url) return data.cover_url;
      }
    } catch {
      // Fall through to og:image
    }
  }

  // ArtStation project URLs: artstation.com/projects/XXXXX
  const projectMatch = url.match(/artstation\.com\/projects\/([a-zA-Z0-9]+)/);
  if (projectMatch) {
    try {
      const apiUrl = `https://www.artstation.com/projects/${projectMatch[1]}.json`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "application/json",
        },
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json() as {
          assets?: Array<{ image_url?: string; has_image?: boolean }>;
          cover_url?: string;
        };
        if (data.assets?.length) {
          const imgAsset = data.assets.find((a: { has_image?: boolean }) => a.has_image);
          if (imgAsset?.image_url) return imgAsset.image_url;
        }
        if (data.cover_url) return data.cover_url;
      }
    } catch {
      // Fall through
    }
  }

  // Fallback: fetch og:image from HTML
  return fetchOgImage(url);
}

// --- DeviantArt-specific: use oEmbed API ---

async function resolveDeviantArt(url: string): Promise<string | null> {
  // Try oEmbed API first (reliable, returns image URL)
  try {
    const oembedUrl = `https://backend.deviantart.com/oembed?url=${encodeURIComponent(url)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(oembedUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json() as { url?: string; thumbnail_url?: string };
      if (data.url) return data.url;
      if (data.thumbnail_url) return data.thumbnail_url;
    }
  } catch {
    // Fall through
  }

  // Fallback: og:image
  return fetchOgImage(url);
}

// --- Instagram: og:image (may require login, best effort) ---

async function resolveInstagram(url: string): Promise<string | null> {
  // Instagram og:image extraction - works for public posts
  return fetchOgImage(url);
}

// --- Main resolver ---

async function resolveImageUrl(piece: GalleryInput): Promise<{ imageUrl?: string; videoThumbnailUrl?: string }> {
  const url = piece.originalUrl;
  if (!url) return {};

  const platform = detectPlatform(url);
  const isVideo = piece.pieceType === "video";

  // For videos: resolve thumbnail
  if (isVideo) {
    // YouTube: construct thumbnail directly
    if (piece.videoPlatform === "youtube" || platform === "youtube") {
      const videoSource = piece.videoUrl || url;
      const thumb = getYouTubeThumbnail(videoSource);
      if (thumb) return { videoThumbnailUrl: thumb };
    }

    // Instagram video: try og:image for thumbnail
    if (piece.videoPlatform === "instagram" || platform === "instagram") {
      const ogImg = await resolveInstagram(piece.videoUrl || url);
      if (ogImg) return { videoThumbnailUrl: ogImg };
    }

    // Fallback for any video: try og:image from the original URL
    const ogImg = await fetchOgImage(url);
    if (ogImg) return { videoThumbnailUrl: ogImg };

    return {};
  }

  // For images: resolve image URL
  let imageUrl: string | null = null;

  switch (platform) {
    case "artstation":
      imageUrl = await resolveArtStation(url);
      break;
    case "deviantart":
      imageUrl = await resolveDeviantArt(url);
      break;
    case "instagram":
      imageUrl = await resolveInstagram(url);
      break;
    default:
      imageUrl = await fetchOgImage(url);
      break;
  }

  if (imageUrl) return { imageUrl };
  return {};
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  const batchIdx = args.indexOf("--batch");
  let selectedBatches: string[];
  if (batchIdx !== -1 && args[batchIdx + 1]) {
    selectedBatches = args[batchIdx + 1].split(",");
  } else {
    selectedBatches = Object.keys(BATCH_FILES);
  }

  const scriptsDir = resolve(__dirname);
  let totalResolved = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  console.log(`\n=== Gallery Image Resolver${dryRun ? " (DRY RUN)" : ""} ===\n`);

  for (const batchName of selectedBatches) {
    const filename = BATCH_FILES[batchName];
    if (!filename) {
      console.error(`Unknown batch: ${batchName}`);
      continue;
    }

    const filePath = join(scriptsDir, filename);
    const raw = readFileSync(filePath, "utf-8");
    const pieces: GalleryInput[] = JSON.parse(raw);

    console.log(`--- ${batchName.toUpperCase()} (${pieces.length} pieces) ---\n`);

    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i];

      // Skip if already has image/thumbnail
      if (piece.pieceType === "video" && piece.videoThumbnailUrl) {
        console.log(`  [SKIP] ${piece.title} (already has thumbnail)`);
        totalSkipped++;
        continue;
      }
      if (piece.pieceType !== "video" && (piece.imageUrl || piece.imageUrls?.length)) {
        console.log(`  [SKIP] ${piece.title} (already has imageUrl)`);
        totalSkipped++;
        continue;
      }

      const platform = detectPlatform(piece.originalUrl || "");
      process.stdout.write(`  [${platform}] ${piece.title}...`);

      try {
        const result = await resolveImageUrl(piece);

        if (result.imageUrl) {
          pieces[i].imageUrl = result.imageUrl;
          console.log(` ✓ image`);
          totalResolved++;
        } else if (result.videoThumbnailUrl) {
          pieces[i].videoThumbnailUrl = result.videoThumbnailUrl;
          console.log(` ✓ thumbnail`);
          totalResolved++;
        } else {
          console.log(` ✗ no image found`);
          totalFailed++;
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.log(` ✗ error: ${msg}`);
        totalFailed++;
      }

      // Rate limit: small delay between requests
      await new Promise((r) => setTimeout(r, 300));
    }

    // Write updated JSON back
    if (!dryRun) {
      writeFileSync(filePath, JSON.stringify(pieces, null, 2) + "\n");
      console.log(`\n  → Wrote ${filePath}\n`);
    } else {
      console.log(`\n  [DRY RUN] Would write ${filePath}\n`);
    }
  }

  console.log(`=== SUMMARY ===`);
  console.log(`Resolved: ${totalResolved}`);
  console.log(`Failed:   ${totalFailed}`);
  console.log(`Skipped:  ${totalSkipped}`);
  console.log(`Total:    ${totalResolved + totalFailed + totalSkipped}\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
