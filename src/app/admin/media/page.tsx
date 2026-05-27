import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { MediaBackfillTable, type AdminArticle } from "./MediaBackfillTable";

export const metadata = {
  title: "Media Backfill — The Spidaverse",
  robots: "noindex, nofollow",
};

import type { SanityImage } from "@/types";

interface SanityArticleRow {
  _id: string;
  title: string;
  slug: { current: string };
  heroImage?: SanityImage;
  category?: { title?: string };
  publishedAt?: string;
}

async function fetchArticlesForAdmin(): Promise<AdminArticle[]> {
  if (!client) return [];
  const rows = await (client as unknown as {
    fetch: (q: string) => Promise<SanityArticleRow[]>;
  }).fetch(
    `*[_type == "article"] | order(coalesce(publishedAt, _createdAt) desc) {
       _id,
       title,
       slug,
       heroImage,
       publishedAt,
       category->{ title }
     }`
  );

  return rows.map((r) => {
    let heroUrl: string | null = null;
    if (r.heroImage?.asset?._ref) {
      try {
        heroUrl = urlFor(r.heroImage).width(240).height(160).url() || null;
      } catch {
        heroUrl = null;
      }
    }
    return {
      _id: r._id,
      title: r.title,
      slug: r.slug.current,
      categoryTitle: r.category?.title,
      heroUrl,
      hasHero: !!r.heroImage?.asset?._ref,
    };
  });
}

export default async function MediaBackfillPage() {
  const articles = await fetchArticlesForAdmin();
  return <MediaBackfillTable articles={articles} />;
}
