/**
 * Gallery Cleanup Script
 *
 * Removes all existing galleryPiece documents from Sanity.
 * Run this BEFORE batch-importing new gallery data.
 *
 * Usage:
 *   npx tsx scripts/gallery-cleanup.ts
 *   npx tsx scripts/gallery-cleanup.ts --dry-run   # Preview without deleting
 *
 * Requires:
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local
 *   - SANITY_WRITE_TOKEN in .env.local
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

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // Fetch all existing gallery pieces
  const pieces = await client.fetch<{ _id: string; title: string }[]>(
    `*[_type == "galleryPiece"]{ _id, title } | order(publishedAt desc)`
  );

  console.log(`\nFound ${pieces.length} gallery pieces in Sanity (${dataset}).\n`);

  if (pieces.length === 0) {
    console.log("Nothing to delete.\n");
    return;
  }

  // List what will be deleted
  for (const piece of pieces) {
    console.log(`  ${dryRun ? "[DRY RUN]" : "  Deleting:"} ${piece.title} (${piece._id})`);
  }

  if (dryRun) {
    console.log(`\n[DRY RUN] Would delete ${pieces.length} pieces. Run without --dry-run to execute.\n`);
    return;
  }

  // Delete in transaction
  const tx = client.transaction();
  for (const piece of pieces) {
    tx.delete(piece._id);
  }

  await tx.commit();
  console.log(`\nDeleted ${pieces.length} gallery pieces.\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
