/**
 * Seed the Arc Raiders trio and the hiatus post as Sanity drafts.
 *
 * These four are Chris's own writing (drafts/arc-raiders-*.md in the archive,
 * Written Draft section only), so they clear the only-what-he-played rule. They
 * are backdated into the 2025-11 → 2026-03 gap, which is why the hiatus post's
 * opener can say the archive for that stretch "is one game."
 *
 * Creates `drafts.arc-<slug>` with createIfNotExists, never createOrReplace: a
 * rerun cannot clobber anything Chris has since edited in Studio. Publishing is
 * a separate, deliberate step after he has checked the recast lines.
 *
 *   npx tsx scripts/seed-arc-raiders.ts <dir> --dry-run
 *   npx tsx scripts/seed-arc-raiders.ts <dir>
 *
 * <dir> holds the markdown (frontmatter + body) and a hero jpg per piece.
 */
import { createClient } from "@sanity/client";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { makeBody, boldShare, p, h2, h3, quote, type BodyItem } from "./lib/portableText";

const dir = process.argv[2];
const dryRun = process.argv.includes("--dry-run");
if (!dir) throw new Error("usage: seed-arc-raiders.ts <dir> [--dry-run]");

const token = process.env.SANITY_WRITE_TOKEN;
if (!token && !dryRun) throw new Error("SANITY_WRITE_TOKEN missing");
const client = createClient({
  projectId: "jvovrf9w",
  dataset: "production",
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

interface Piece {
  file: string;
  hero?: string;
  title: string;
  slug: string;
  format: string;
  publishedAt: string;
  excerpt: string;
  categorySlug: string;
  mediaType?: string;
  webRating?: number;
  tags?: string[];
}

// Excerpts are his pull quotes, verbatim, so the card copy is his voice too.
const PIECES: Piece[] = [
  {
    file: "arc/arc-raiders-first-bite-draft.final.md",
    hero: "arc/art/img4.jpg",
    title: "Arc Raiders — First Bite",
    slug: "arc-raiders-first-bite",
    format: "first-bite",
    publishedAt: "2025-11-28T13:00:00.000Z",
    excerpt: "A game hasn't grabbed me like this since World of Warcraft. 90/100. That's rare. Protect it.",
    categorySlug: "video-games",
    mediaType: "game",
    webRating: 90,
    tags: ["Arc Raiders", "Extraction Shooter", "PvPvE", "Embark Studios", "PS5", "Xbox", "PC"],
  },
  {
    file: "arc/arc-raiders-expedition-1-sotg.final.md",
    hero: "arc/art/img1.jpg",
    title: "Arc Raiders — Expedition 1 Recap: State of the Game",
    slug: "arc-raiders-expedition-1-state-of-the-game",
    format: "state-of-the-game",
    publishedAt: "2025-12-24T13:00:00.000Z",
    excerpt: "The main problem with Arc Raiders isn't the devs. It's the community. The devs are doing their best, all things considered. Respect it.",
    categorySlug: "video-games",
    mediaType: "game",
    webRating: 85,
    tags: ["Arc Raiders", "Extraction Shooter", "PvPvE", "Embark Studios", "Expedition 1", "Cold Snap", "State of the Game"],
  },
  {
    file: "arc/arc-raiders-expedition-2-sotg.final.md",
    hero: "arc/art/img6.jpg",
    title: "Arc Raiders — Expedition 2 Recap: State of the Game",
    slug: "arc-raiders-expedition-2-state-of-the-game",
    format: "state-of-the-game",
    publishedAt: "2026-03-03T13:00:00.000Z",
    excerpt: "They repeated the Cold Snap mistake. Full stop. Trust the process. 89/100.",
    categorySlug: "video-games",
    mediaType: "game",
    webRating: 89,
    tags: ["Arc Raiders", "Extraction Shooter", "PvPvE", "Embark Studios", "Expedition 2", "Headwinds", "Shrouded Sky", "State of the Game"],
  },
  {
    // No hero: like the other two no-subject essays, there is nothing to picture.
    file: "where-ive-been.md",
    title: "Where I've Been",
    slug: "where-ive-been",
    format: "the-web-sling",
    publishedAt: "2025-11-24T13:00:00.000Z",
    excerpt: "Nine months where the archive is one game and nothing else. Here's why.",
    categorySlug: "culture",
  },
];

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/** Markdown body → BodyItems. Frontmatter is dropped; headings and quotes keep their style. */
function parseBody(md: string): BodyItem[] {
  const body = md.replace(/^---[\s\S]*?---\s*/, "");
  return body
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((para) => {
      if (para.startsWith("### ")) return h3(para.slice(4));
      if (para.startsWith("## ")) return h2(para.slice(3));
      if (para.startsWith("> ")) return quote(para.replace(/^> ?/gm, ""));
      return p(para.replace(/\n/g, " "));
    });
}

async function main() {
  const categories = dryRun
    ? []
    : await client.fetch<Array<{ _id: string; slug: { current: string } }>>(
        `*[_type=="category" && slug.current in $slugs]{_id, slug}`,
        { slugs: [...new Set(PIECES.map((x) => x.categorySlug))] }
      );
  const categoryId = new Map(categories.map((c) => [c.slug.current, c._id]));

  for (const piece of PIECES) {
    const md = readFileSync(join(dir, piece.file), "utf8");
    const body = parseBody(md);
    const words = body.filter((b) => b.style === "normal").reduce((n, b) => n + b.text.split(/\s+/).length, 0);
    // Em dashes are house style in titles only; the body must carry none.
    const dashes = body.reduce((n, b) => n + (b.text.match(/—/g)?.length ?? 0), 0);
    if (dashes) throw new Error(`${piece.slug}: ${dashes} em dash(es) in body`);
    if (piece.hero && !existsSync(join(dir, piece.hero))) throw new Error(`${piece.slug}: hero missing`);

    const summary = `${piece.publishedAt.slice(0, 10)}  ${words}w  bold ${boldShare(body).toFixed(1)}%  ${body.length} blocks  ${piece.slug}`;
    if (dryRun) {
      console.log(`  [dry] ${summary}`);
      continue;
    }

    const catId = categoryId.get(piece.categorySlug);
    if (!catId) throw new Error(`Category not found: ${piece.categorySlug}`);

    const tagRefs = [];
    for (const title of piece.tags ?? []) {
      const _id = `tag-${slugify(title)}`;
      await client.createIfNotExists({ _id, _type: "tag", title, slug: { _type: "slug", current: slugify(title) } });
      tagRefs.push({ _type: "reference", _key: _id, _ref: _id });
    }

    let heroImage;
    if (piece.hero) {
      const asset = await client.assets.upload("image", readFileSync(join(dir, piece.hero)), {
        filename: `${piece.slug}-hero.jpg`,
      });
      heroImage = { _type: "image", asset: { _type: "reference", _ref: asset._id } };
    }

    const doc = {
      _id: `drafts.arc-${piece.slug}`,
      _type: "article",
      title: piece.title,
      slug: { _type: "slug", current: piece.slug },
      format: piece.format,
      publishedAt: piece.publishedAt,
      excerpt: piece.excerpt,
      category: { _type: "reference", _ref: catId },
      ...(piece.mediaType ? { mediaType: piece.mediaType } : {}),
      ...(piece.webRating !== undefined ? { webRating: piece.webRating } : {}),
      ...(tagRefs.length ? { tags: tagRefs } : {}),
      ...(heroImage ? { heroImage } : {}),
      readingTime: Math.max(1, Math.ceil(words / 200)),
      spoilerFree: true,
      body: makeBody(body),
    };
    const res = await client.createIfNotExists(doc);
    console.log(`  ${res._id === doc._id ? "seeded" : "exists"} ${summary}`);
  }
  console.log(dryRun ? "\nDry run only." : "\nDrafts only. Publish is a separate step.");
}

main().catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); });
