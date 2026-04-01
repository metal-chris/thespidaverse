/**
 * Batch Import Gallery Pieces to Sanity
 *
 * Usage:
 *   npx tsx scripts/batch-import-gallery.ts scripts/gallery-data.json
 *
 * Requires:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID in .env
 *   - SANITY_WRITE_TOKEN in .env (generate at sanity.io/manage → API → Tokens)
 *   - npx tsx (or install tsx globally)
 *
 * The JSON file should be an array of objects:
 * [
 *   {
 *     "title": "Miles Morales Sunset",
 *     "artistName": "@artsy_spider",
 *     "artistUrl": "https://x.com/artsy_spider",
 *     "originalUrl": "https://x.com/artsy_spider/status/123",
 *     "franchise": "spider-verse",
 *     "description": "Optional caption",
 *     "pieceType": "image",           // "image" | "video" (default: "image")
 *     "imageUrl": "https://...",       // for single images — will be uploaded to Sanity
 *     "imageUrls": ["https://...", "https://..."], // for carousels — multiple images
 *     "videoUrl": "https://...",       // for videos
 *     "videoPlatform": "youtube",      // "youtube" | "tiktok" | "instagram"
 *     "videoThumbnailUrl": "https://...", // optional thumbnail for videos
 *     "isSpotlight": false             // optional, default false
 *   }
 * ]
 */

import { createClient, type SanityClient } from "@sanity/client";
import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local (Next.js convention)
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env");
  process.exit(1);
}
if (!token) {
  console.error(
    "Missing SANITY_WRITE_TOKEN in .env\n" +
      "Generate one at: https://sanity.io/manage → your project → API → Tokens"
  );
  process.exit(1);
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// --- Types ---

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

// --- Helpers ---

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96);
}

async function uploadImageFromUrl(
  url: string,
  filename: string
): Promise<{ _type: "image"; asset: { _type: "reference"; _ref: string } }> {
  console.log(`  Uploading image: ${filename}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url} (${res.status})`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buffer, { filename });

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
}

// --- Main ---

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error("Usage: npx tsx scripts/batch-import-gallery.ts <path-to-json>");
    process.exit(1);
  }

  const fullPath = resolve(jsonPath);
  const raw = readFileSync(fullPath, "utf-8");
  const pieces: GalleryInput[] = JSON.parse(raw);

  console.log(`\nImporting ${pieces.length} gallery pieces to Sanity (${dataset})...\n`);

  let success = 0;
  let failed = 0;

  for (const piece of pieces) {
    const slug = slugify(piece.title);
    const pieceType = piece.pieceType || "image";

    try {
      // Build the document
      const doc: Record<string, unknown> = {
        _type: "galleryPiece",
        title: piece.title,
        slug: { _type: "slug", current: slug },
        pieceType,
        artistName: piece.artistName,
        artistUrl: piece.artistUrl,
        originalUrl: piece.originalUrl,
        franchise: piece.franchise,
        description: piece.description,
        isSpotlight: piece.isSpotlight ?? false,
        publishedAt: new Date().toISOString(),
      };

      // Upload images — carousel array or single
      if (pieceType === "image" && piece.imageUrls?.length) {
        const uploaded = [];
        for (let i = 0; i < piece.imageUrls.length; i++) {
          const img = await uploadImageFromUrl(piece.imageUrls[i], `${slug}-${i + 1}.jpg`);
          uploaded.push({ ...img, _key: `img-${i}` });
        }
        doc.images = uploaded;
      } else if (pieceType === "image" && piece.imageUrl) {
        doc.image = await uploadImageFromUrl(piece.imageUrl, `${slug}.jpg`);
      }

      // Video fields
      if (pieceType === "video") {
        doc.videoUrl = piece.videoUrl;
        doc.videoPlatform = piece.videoPlatform;

        if (piece.videoThumbnailUrl) {
          doc.videoThumbnail = await uploadImageFromUrl(
            piece.videoThumbnailUrl,
            `${slug}-thumb.jpg`
          );
        }
      }

      await client.create(doc);
      console.log(`  ✓ ${piece.title} (${pieceType})`);
      success++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${piece.title}: ${msg}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} imported, ${failed} failed.\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
