/**
 * Import All Gallery Batches
 *
 * Runs the batch importer across all gallery batch JSON files.
 * Can import all batches at once or specify individual ones.
 *
 * Usage:
 *   npx tsx scripts/gallery-import-all.ts                    # Import all batches
 *   npx tsx scripts/gallery-import-all.ts --batch anime      # Import only anime batch
 *   npx tsx scripts/gallery-import-all.ts --batch games,music # Import specific batches
 *   npx tsx scripts/gallery-import-all.ts --dry-run          # Count pieces without importing
 *
 * Requires:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local
 *   - SANITY_WRITE_TOKEN in .env.local
 */

import { createClient, type SanityClient } from "@sanity/client";
import { readFileSync, existsSync } from "fs";
import { resolve, join } from "path";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_WRITE_TOKEN in .env.local");
  process.exit(1);
}

const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

// --- Batch file registry ---

const BATCH_FILES: Record<string, string> = {
  anime: "gallery-batch-anime.json",
  games: "gallery-batch-games.json",
  "movies-tv": "gallery-batch-movies-tv.json",
  "music-culture": "gallery-batch-music-culture.json",
  spiderverse: "gallery-batch-spiderverse.json",
};

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
  console.log(`    Uploading image: ${filename}...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${url} (${res.status})`);

  const buffer = Buffer.from(await res.arrayBuffer());
  const asset = await client.assets.upload("image", buffer, { filename });

  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
  };
}

async function importBatch(batchName: string, pieces: GalleryInput[], dryRun: boolean, baseTimestamp?: number) {
  console.log(`\n--- ${batchName.toUpperCase()} (${pieces.length} pieces) ---\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < pieces.length; i++) {
    const piece = pieces[i];
    const slug = slugify(piece.title);
    const pieceType = piece.pieceType || "image";

    // Stagger timestamps so shuffled order is preserved (newest = first in list)
    const publishedAt = baseTimestamp
      ? new Date(baseTimestamp - i * 60_000).toISOString()
      : new Date().toISOString();

    if (dryRun) {
      console.log(`  [DRY RUN] ${piece.title} (${pieceType}) [${piece.franchise}]`);
      success++;
      continue;
    }

    try {
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
        publishedAt,
      };

      // Upload images
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

      await client.create(doc as Parameters<typeof client.create>[0]);
      console.log(`  + ${piece.title} (${pieceType})`);
      success++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  x ${piece.title}: ${msg}`);
      failed++;
    }
  }

  return { success, failed };
}

// --- Shuffle (Fisher-Yates) ---

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Main ---

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const noShuffle = args.includes("--no-shuffle");

  // Parse --batch flag
  const batchIdx = args.indexOf("--batch");
  let selectedBatches: string[];

  if (batchIdx !== -1 && args[batchIdx + 1]) {
    selectedBatches = args[batchIdx + 1].split(",");
  } else {
    selectedBatches = Object.keys(BATCH_FILES);
  }

  const scriptsDir = resolve(__dirname);

  console.log(`\n=== Gallery Batch Import${dryRun ? " (DRY RUN)" : ""} ===`);
  console.log(`Target: Sanity dataset "${dataset}"`);
  console.log(`Batches: ${selectedBatches.join(", ")}`);
  console.log(`Shuffle: ${noShuffle ? "OFF" : "ON (use --no-shuffle to disable)"}\n`);

  // Load all pieces from selected batches
  let allPieces: GalleryInput[] = [];

  for (const batchName of selectedBatches) {
    const filename = BATCH_FILES[batchName];
    if (!filename) {
      console.error(`Unknown batch: ${batchName}. Available: ${Object.keys(BATCH_FILES).join(", ")}`);
      continue;
    }

    const filePath = join(scriptsDir, filename);
    if (!existsSync(filePath)) {
      console.error(`Batch file not found: ${filePath}`);
      continue;
    }

    const raw = readFileSync(filePath, "utf-8");
    const pieces: GalleryInput[] = JSON.parse(raw);
    console.log(`  Loaded ${batchName}: ${pieces.length} pieces`);
    allPieces.push(...pieces);
  }

  // Shuffle all pieces together so the gallery isn't grouped by category
  if (!noShuffle) {
    allPieces = shuffle(allPieces);
    console.log(`\n  Shuffled ${allPieces.length} pieces into random order.`);
  }

  // Stagger publishedAt so pieces appear in shuffled order (newest first)
  // Each piece gets a timestamp 1 minute apart
  const now = Date.now();

  const { success, failed } = await importBatch("all", allPieces, dryRun, now);

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total pieces: ${allPieces.length}`);
  console.log(`Imported: ${success}`);
  console.log(`Failed: ${failed}`);
  if (dryRun) console.log(`(Dry run — nothing was imported)`);
  console.log();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
