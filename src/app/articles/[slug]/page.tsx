import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getProvider } from "@/lib/providers";
import { urlFor } from "@/lib/sanity/image";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { capitalizeTag, cn, formatDate, formatMediaType } from "@/lib/utils";
import { blogPostingJsonLd, breadcrumbJsonLd, reviewJsonLd } from "@/lib/seo/jsonLd";
import { ArticleBody } from "./ArticleBody";
import type { MediaType } from "@/types";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

/* ── Category → color map (matches Card.tsx) ── */
const categoryColors: Record<string, string> = {
  "Movies & TV": "bg-red-500/15 text-red-500 border-red-500/25",
  "Video Games": "bg-blue-500/15 text-blue-500 border-blue-500/25",
  "Anime & Manga": "bg-purple-500/15 text-purple-500 border-purple-500/25",
  Music: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25",
};
const defaultCategoryColor = "bg-accent/10 text-accent border-accent/20";

/* ── Media type icons (16×16 inline SVG) ── */
const mediaIcons: Record<MediaType, React.ReactNode> = {
  movie: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v1H2V3zm0 2h12v7a1 1 0 01-1 1H3a1 1 0 01-1-1V5zm5 1.5v4l3-2-3-2z" />
    </svg>
  ),
  tv: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M1.5 3A1.5 1.5 0 003 13h10a1.5 1.5 0 001.5-1.5v-7A1.5 1.5 0 0013 3H3A1.5 1.5 0 001.5 4.5v7zM5 14.5a.5.5 0 000 1h6a.5.5 0 000-1H5z" />
    </svg>
  ),
  game: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M6 3.5A1.5 1.5 0 017.5 2h1A1.5 1.5 0 0110 3.5V4h2.5A1.5 1.5 0 0114 5.5v5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 10.5v-5A1.5 1.5 0 013.5 4H6v-.5zM5 7H4v1h1v1h1V8h1V7H6V6H5v1zm4.5 0a.5.5 0 100 1 .5.5 0 000-1zm2 1a.5.5 0 100 1 .5.5 0 000-1z" />
    </svg>
  ),
  anime: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M8 1a.5.5 0 01.5.5V3h5a1.5 1.5 0 011.5 1.5v7A1.5 1.5 0 0113.5 13h-11A1.5 1.5 0 011 11.5v-7A1.5 1.5 0 012.5 3h5V1.5A.5.5 0 018 1zM6.5 6.5v4l4-2-4-2z" />
    </svg>
  ),
  manga: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 000 2.5v11a.5.5 0 00.707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 00.78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0016 13.5v-11a.5.5 0 00-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.81 8.985.936 8 1.783z" />
    </svg>
  ),
  music: (
    <svg viewBox="0 0 16 16" className="w-3.5 h-3.5" fill="currentColor">
      <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.895 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
      <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" />
      <path d="M5 2.905a1 1 0 01.9-.995l8-.8a1 1 0 011.1.995V3L6 4V2.905z" />
    </svg>
  ),
};

const mediaLabel: Record<MediaType, string> = {
  movie: "Movie",
  tv: "TV",
  game: "Game",
  anime: "Anime",
  manga: "Manga",
  music: "Music",
};

/* ── Format badge labels ── */
const formatBadge: Record<string, string> = {
  essay: "Essay",
  "short-take": "Short Take",
  "ranked-list": "Ranked List",
  roundup: "Roundup",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = getProvider();
  const article = await provider.getArticleBySlug(slug);

  if (!article) return { title: "Not Found" };

  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(article.title)}${article.category ? `&category=${encodeURIComponent(article.category.title)}` : ""}${article.webRating ? `&rating=${article.webRating}` : ""}`;

  return {
    title: article.title,
    description: article.excerpt || `${article.title} — The Spidaverse`,
    openGraph: {
      title: article.title,
      description: article.excerpt || "",
      type: "article",
      publishedTime: article._createdAt,
      modifiedTime: article._updatedAt,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const provider = getProvider();
  const article = await provider.getArticleBySlug(slug);

  if (!article) notFound();

  /* Prefer direct URL (mock data) → fall back to Sanity urlFor (live data) */
  const sanityUrl = article.heroImage
    ? urlFor(article.heroImage).width(1200).height(630).url()
    : null;
  const heroUrl = article.heroImageUrl || sanityUrl || null;

  const articleUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com"}/articles/${slug}`;
  const hasSpoilerBlocks = article.body?.some(
    (block: { _type: string }) => block._type === "spoilerBlock"
  );

  const catColor =
    categoryColors[article.category?.title] || defaultCategoryColor;

  // JSON-LD structured data
  const jsonLdBlogPosting = blogPostingJsonLd({
    title: article.title,
    excerpt: article.excerpt,
    url: articleUrl,
    publishedAt: article._createdAt,
    modifiedAt: article._updatedAt,
    imageUrl: heroUrl || undefined,
    category: article.category?.title,
  });

  const jsonLdBreadcrumb = breadcrumbJsonLd([
    { name: "Home", url: siteUrl },
    ...(article.category
      ? [{ name: article.category.title, url: `${siteUrl}/category/${article.category.slug.current}` }]
      : []),
    { name: article.title, url: articleUrl },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBlogPosting) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      {article.webRating != null && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              reviewJsonLd({
                title: article.title,
                url: articleUrl,
                rating: article.webRating,
                itemName: article.title,
              })
            ),
          }}
        />
      )}

      {/* ── Breadcrumb (above hero, like collections) ── */}
      <Container className="pt-3 pb-3">
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            ...(article.category
              ? [{ label: article.category.title, href: `/category/${article.category.slug.current}` }]
              : []),
            { label: article.title },
          ]}
        />
      </Container>

      {/* ── Hero Image (full-bleed with overlay text) ── */}
      {heroUrl ? (
        <div className="relative w-full h-[100vh] overflow-hidden">
          <Image
            src={heroUrl}
            alt={article.heroImage?.alt || article.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          {/* Gradient overlay - stronger to ensure text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
          <div className="absolute inset-0 bg-black/30" />

          {/* Content positioned at bottom of hero */}
          <Container className="absolute bottom-0 left-0 right-0 pb-8 md:pb-12">
            {/* Pills row: category + media type + format */}
            <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
              {article.category && (
                <Link
                  href={`/category/${article.category.slug.current}`}
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border transition-colors hover:opacity-80 backdrop-blur-sm",
                    catColor
                  )}
                >
                  {article.category.title}
                </Link>
              )}
              {article.mediaType && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-sm">
                  {mediaIcons[article.mediaType]}
                  {mediaLabel[article.mediaType]}
                </span>
              )}
              {article.format && (
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                  {formatBadge[article.format] || article.format}
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white text-balance leading-tight mb-2 md:mb-3">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-sm md:text-base text-white/90 leading-relaxed max-w-2xl mb-3 md:mb-4">
                {article.excerpt}
              </p>
            )}

            {/* Metadata row with icons and dot separators */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-white/80 mb-3">
              <span className="inline-flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="currentColor" aria-hidden="true">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.5 4.5v4l3 1.5-.5 1-3.5-1.75V4.5h1z" />
                </svg>
                <time dateTime={article._createdAt} className="tabular-nums">
                  {formatDate(article._createdAt)}
                </time>
              </span>
              {article.readingTime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/50" aria-hidden="true" />
                  <span className="inline-flex items-center gap-1.5">
                    <svg viewBox="0 0 16 16" className="w-3 h-3 md:w-3.5 md:h-3.5" fill="currentColor" aria-hidden="true">
                      <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V2zm2 0v12h8V2H4zm2 2h4v1H6V4zm0 3h4v1H6V7zm0 3h3v1H6v-1z" />
                    </svg>
                    {article.readingTime} min read
                  </span>
                </>
              )}
              {article.mediaLength && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/50" aria-hidden="true" />
                  <span>{article.mediaLength}</span>
                </>
              )}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 md:gap-2 mb-8 md:mb-10">
                {article.tags.map((tag) => (
                  <Link
                    key={tag._id}
                    href={`/tags/${tag.slug.current}`}
                    className="text-[10px] md:text-xs bg-white/10 text-white/80 px-2 py-0.5 md:py-1 rounded-full hover:text-white hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
                  >
                    #{capitalizeTag(tag.title)}
                  </Link>
                ))}
              </div>
            )}

            {/* Separator line at bottom of 100vh */}
            <div className="flex items-center gap-3 md:gap-4">
              <div className="flex-1 h-[2px] bg-white/20" />
              <svg viewBox="0 0 24 24" className="w-4 h-4 md:w-5 md:h-5 text-white/30" fill="currentColor" aria-hidden="true">
                <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.83L18.17 12 12 18.17 5.83 12 12 5.83z" />
              </svg>
              <div className="flex-1 h-[2px] bg-white/20" />
            </div>
          </Container>
        </div>
      ) : null}

      {/* ── Article Content ── */}
      <Container as="article" className="pt-8 md:pt-12 pb-8 max-w-4xl">

        {/* Client-side article body with WebRating, ShareBar, Spoilers, Newsletter */}
        <ArticleBody
          body={article.body}
          webRating={article.webRating}
          title={article.title}
          slug={slug}
          url={articleUrl}
          category={article.category?.title}
          format={article.format}
          hasSpoilerBlocks={!!hasSpoilerBlocks}
          ambientAudioUrl={article.ambientAudioUrl}
          pollConfig={article.pollConfig}
        />
      </Container>
    </>
  );
}
