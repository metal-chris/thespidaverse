import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProvider } from "@/lib/providers";
import { arrangedRows } from "@/lib/tierlist/arrangement";
import type { TierListBlock } from "@/types";
import ArticlePage from "../../page";

/**
 * A shared arrangement's home: /articles/<slug>/r/<tl>.
 *
 * This route exists for crawlers. The Maker encodes a reader's ranking in the
 * `tl` code, and this page's metadata is what turns a shared link into a card
 * showing THAT ranking — its own title, its own description naming the
 * reader's top pick, and an og:image drawn from the arrangement itself
 * (/api/og/tierlist). The arrangement rides a PATH segment, not a query
 * param, because generateMetadata can only see searchParams by forcing the
 * whole article route dynamic — this way article pages keep ISR and each
 * shared ranking is just another statically-generated path.
 *
 * Humans don't stay here either, but this route no longer does that work. It
 * used to carry an inline script that rewrote the URL to the article's ?tl=
 * form before hydration. The script never ran: React streams it inside a
 * hidden placeholder and moves it into the document, and a script inserted by
 * DOM insertion does not execute — so every shared link landed on the author's
 * ranking rather than the reader's. The Maker now reads the /r/<tl> path
 * itself and rewrites the address bar from its own mount effect, which owes
 * nothing to hydration order. This route is metadata and nothing else.
 */

interface Props {
  params: Promise<{ locale: string; slug: string; tl: string }>;
}

/**
 * Phase 4: a reader may sign a shared ranking, and the signature rides the
 * SAME path segment as the code — `/r/<code>~<name>`.
 *
 * A `?by=` query param was the obvious shape and the wrong one: reading
 * searchParams in generateMetadata opts the route into dynamic rendering, and
 * because the read happens before we know whether a signature exists, every
 * unsigned link would have paid for a feature it does not use. The header note
 * above is the same argument applied to the arrangement itself.
 *
 * `~` is unreserved in a path and cannot appear in a code (base-36 digits and
 * `|`), so splitting on it is unambiguous and every link shared before this
 * change parses identically.
 */
function splitCode(raw: string): { code: string; by: string } {
  const decoded = decodeURIComponent(raw);
  const at = decoded.indexOf("~");
  if (at === -1) return { code: decoded, by: "" };
  return {
    code: decoded.slice(0, at),
    // Rendered as text, never as markup.
    by: decoded.slice(at + 1).replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, 24),
  };
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com";

export const revalidate = 60;

function firstTierList(body: unknown[]): TierListBlock | null {
  return (
    ((body ?? []).find(
      (b) => (b as { _type?: string })?._type === "tierList"
    ) as TierListBlock | undefined) ?? null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, tl } = await params;
  const { code, by } = splitCode(tl);
  const provider = getProvider();
  const article = await provider.getArticleBySlug(slug);
  if (!article) return { title: "Not Found" };

  const block = firstTierList(article.body as unknown[]);
  const rows = block ? arrangedRows(block, code) : [];
  const topRow = rows.find((r) => r.entries.length > 0);
  const topPick = topRow?.entries[0]?.title;

  const title = by
    ? `${by}'s ranking — ${article.title}`
    : `A reader's ranking — ${article.title}`;
  const description = topPick
    ? `${topPick} at #1. See the full rearranged tier list, then make your own.`
    : `A rearranged tier list. See it, then make your own.`;
  const ogImageUrl =
    `${siteUrl}/api/og/tierlist?slug=${encodeURIComponent(slug)}&tl=${encodeURIComponent(code)}` +
    (by ? `&by=${encodeURIComponent(by)}` : "");

  return {
    title,
    description,
    // The article is the canonical document; arrangements are views of it.
    alternates: {
      canonical: `${siteUrl}/articles/${slug}`,
      types: {
        "application/json+oembed": `${siteUrl}/api/oembed?url=${encodeURIComponent(
          `${siteUrl}/articles/${slug}/r/${tl}`
        )}`,
      },
    },
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ArrangementPage({ params }: Props) {
  const { slug } = await params;
  const provider = getProvider();
  const article = await provider.getArticleBySlug(slug);
  if (!article || !firstTierList(article.body as unknown[])) notFound();

  return <ArticlePage params={Promise.resolve({ slug })} />;
}
