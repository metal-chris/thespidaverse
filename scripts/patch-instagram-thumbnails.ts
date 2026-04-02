/**
 * Fetch Instagram embed pages, extract thumbnail images, upload to Sanity,
 * and patch gallery pieces that lack thumbnails.
 *
 * Usage: npx tsx scripts/patch-instagram-thumbnails.ts
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const client = createClient({ projectId, dataset, apiVersion: "2024-01-01", token, useCdn: false });

function getInstagramUrl(piece: { videoUrl?: string; originalUrl?: string }): string | null {
  const url = piece.videoUrl || piece.originalUrl || "";
  const match = url.match(/instagram\.com\/(p|reel)\/([a-zA-Z0-9_-]+)/);
  return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : null;
}

async function extractThumbnailUrl(embedUrl: string): Promise<string | null> {
  try {
    const res = await fetch(embedUrl);
    if (!res.ok) return null;
    const html = await res.text();

    // Instagram embed pages include the image in an EmbeddedMediaImage class
    const match = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/);
    if (match) return match[1].replace(/&amp;/g, "&");

    // Fallback: look for video poster
    const videoMatch = html.match(/poster="([^"]+)"/);
    if (videoMatch) return videoMatch[1].replace(/&amp;/g, "&");

    return null;
  } catch {
    return null;
  }
}

async function main() {
  // Find all gallery pieces that are from Instagram and lack a thumbnail
  const pieces = await client.fetch(`
    *[_type == "galleryPiece" && !defined(image) && !defined(videoThumbnail)] {
      _id, title, videoUrl, originalUrl, pieceType
    }
  `);

  const igPieces = pieces.filter((p: { videoUrl?: string; originalUrl?: string }) => getInstagramUrl(p));

  console.log(`\nFound ${igPieces.length} Instagram pieces without thumbnails.\n`);

  let success = 0;
  let failed = 0;

  for (const piece of igPieces) {
    const embedUrl = getInstagramUrl(piece)!;
    console.log(`  Fetching: ${piece.title}...`);

    const imageUrl = await extractThumbnailUrl(embedUrl);
    if (!imageUrl) {
      console.error(`  ✗ ${piece.title}: Could not extract image`);
      failed++;
      continue;
    }

    try {
      // Download the image
      const imgRes = await fetch(imageUrl);
      if (!imgRes.ok) throw new Error(`Image fetch failed: ${imgRes.status}`);
      const buffer = Buffer.from(await imgRes.arrayBuffer());

      // Upload to Sanity
      const slug = piece.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
      const asset = await client.assets.upload("image", buffer, {
        filename: `ig-${slug}.jpg`,
      });

      // Patch the document — use image field for image pieces, videoThumbnail for videos
      const field = piece.pieceType === "image" ? "image" : "videoThumbnail";
      await client.patch(piece._id).set({
        [field]: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
        },
      }).commit();

      console.log(`  ✓ ${piece.title} (${field})`);
      success++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${piece.title}: ${msg}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} patched, ${failed} failed.\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
