import { NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import { urlFor } from "@/lib/sanity/image";
import type { SanityImage } from "@/types";

/**
 * Slim search index for the ⌘K dialog.
 *
 * A separate endpoint rather than props on the Header, because the Header
 * renders on every page and the article corpus has no business being in the
 * document on all of them. The dialog fetches this once, on first open, and
 * caches it for the session — so the cost is paid by people who actually
 * search, and only once.
 *
 * Only the fields the dialog renders or matches on. `body` in particular is
 * deliberately absent: it is PortableText, it dwarfs everything else, and the
 * dialog shows an excerpt.
 */
export const revalidate = 60;

export interface SearchDoc {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  categorySlug: string;
  format: string;
  tags: string[];
  moods: string[];
  /** Featured/hero image, shown as a thumbnail beside each result. */
  image?: string;
  publishedAt?: string;
  readingTime?: number;
}

/**
 * Hero thumbnail for a result row.
 *
 * Same precedence the article page already documents: prefer the direct URL,
 * fall back to building one from the Sanity asset. `heroImageUrl` exists only
 * on mock data — the live GROQ projection in src/lib/sanity/queries.ts selects
 * `heroImage` and never computes a URL, so without the fallback every result
 * on the real site renders an empty box. Verified: 55 of 55 live articles came
 * back imageless before this.
 *
 * Asked for at thumbnail size rather than full width; these render at 56x40.
 */
function thumbUrl(a: { heroImageUrl?: string; heroImage?: SanityImage }): string | undefined {
  if (a.heroImageUrl) return a.heroImageUrl;
  if (!a.heroImage) return undefined;
  try {
    return urlFor(a.heroImage).width(112).height(80).fit("crop").url() || undefined;
  } catch {
    // A malformed or unresolved asset ref must not take the whole index down.
    return undefined;
  }
}

export async function GET() {
  const provider = getProvider();
  const articles = await provider.getArticles();

  const docs: SearchDoc[] = articles.map((a) => ({
    id: a._id,
    title: a.title,
    slug: a.slug?.current ?? "",
    excerpt: a.excerpt ?? "",
    category: a.category?.title ?? "",
    categorySlug: a.category?.slug?.current ?? "",
    format: a.format ?? "",
    tags: (a.tags ?? []).map((t) => t.title).filter(Boolean),
    moods: a.moodTags ?? [],
    image: thumbUrl(a),
    publishedAt: a.publishedAt,
    readingTime: a.readingTime,
  }));

  return NextResponse.json(
    { docs },
    {
      headers: {
        // Same window as the page's own revalidate; the corpus is editorial
        // and does not change between keystrokes.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
