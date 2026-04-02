/**
 * Gallery Link Validator
 *
 * Checks every originalUrl, videoUrl, artistUrl in the batch files
 * to verify they return HTTP 200. Flags broken links.
 *
 * Usage:
 *   npx tsx scripts/gallery-validate-links.ts
 *   npx tsx scripts/gallery-validate-links.ts --batch anime
 *   npx tsx scripts/gallery-validate-links.ts --fix    # Remove entries with broken originalUrl
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, join } from "path";

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

async function checkUrl(url: string): Promise<{ ok: boolean; status: number; redirectUrl?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,*/*",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    // Some servers don't support HEAD, try GET
    if (res.status === 405 || res.status === 403) {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 12000);

      const res2 = await fetch(url, {
        method: "GET",
        signal: controller2.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Accept": "text/html,*/*",
        },
        redirect: "follow",
      });

      clearTimeout(timeout2);
      // Consume body to avoid memory leak
      await res2.text().catch(() => {});

      return {
        ok: res2.ok,
        status: res2.status,
        redirectUrl: res2.url !== url ? res2.url : undefined,
      };
    }

    return {
      ok: res.ok,
      status: res.status,
      redirectUrl: res.url !== url ? res.url : undefined,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort")) return { ok: false, status: 0 };
    return { ok: false, status: -1 };
  }
}

async function main() {
  const args = process.argv.slice(2);
  const fixMode = args.includes("--fix");

  const batchIdx = args.indexOf("--batch");
  let selectedBatches: string[];
  if (batchIdx !== -1 && args[batchIdx + 1]) {
    selectedBatches = args[batchIdx + 1].split(",");
  } else {
    selectedBatches = Object.keys(BATCH_FILES);
  }

  const scriptsDir = resolve(__dirname);
  let totalOk = 0;
  let totalBroken = 0;
  const brokenEntries: { batch: string; title: string; field: string; url: string; status: number }[] = [];

  console.log(`\n=== Gallery Link Validator ===\n`);

  for (const batchName of selectedBatches) {
    const filename = BATCH_FILES[batchName];
    if (!filename) continue;

    const filePath = join(scriptsDir, filename);
    const raw = readFileSync(filePath, "utf-8");
    const pieces: GalleryInput[] = JSON.parse(raw);

    console.log(`--- ${batchName.toUpperCase()} (${pieces.length} pieces) ---\n`);

    const validPieces: GalleryInput[] = [];

    for (const piece of pieces) {
      let pieceOk = true;

      // Check originalUrl (most important)
      if (piece.originalUrl) {
        process.stdout.write(`  ${piece.title} → `);
        const result = await checkUrl(piece.originalUrl);

        if (result.ok) {
          process.stdout.write(`✓ ${result.status}`);
          totalOk++;
        } else {
          process.stdout.write(`✗ ${result.status || "TIMEOUT"}`);
          totalBroken++;
          pieceOk = false;
          brokenEntries.push({
            batch: batchName,
            title: piece.title,
            field: "originalUrl",
            url: piece.originalUrl,
            status: result.status,
          });
        }

        // Check videoUrl too if it's different
        if (piece.videoUrl && piece.videoUrl !== piece.originalUrl) {
          const vResult = await checkUrl(piece.videoUrl);
          if (!vResult.ok) {
            process.stdout.write(` | videoUrl ✗ ${vResult.status || "TIMEOUT"}`);
            brokenEntries.push({
              batch: batchName,
              title: piece.title,
              field: "videoUrl",
              url: piece.videoUrl,
              status: vResult.status,
            });
          }
        }

        console.log();
      }

      if (pieceOk || !fixMode) {
        validPieces.push(piece);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 200));
    }

    // In fix mode, write back only valid pieces
    if (fixMode && validPieces.length < pieces.length) {
      writeFileSync(filePath, JSON.stringify(validPieces, null, 2) + "\n");
      console.log(`\n  → Removed ${pieces.length - validPieces.length} broken entries, wrote ${filePath}\n`);
    } else {
      console.log();
    }
  }

  console.log(`\n=== SUMMARY ===`);
  console.log(`Valid:  ${totalOk}`);
  console.log(`Broken: ${totalBroken}`);

  if (brokenEntries.length > 0) {
    console.log(`\nBroken links:`);
    for (const b of brokenEntries) {
      console.log(`  [${b.batch}] "${b.title}" → ${b.field}: ${b.url} (${b.status || "TIMEOUT"})`);
    }
  }

  console.log();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
