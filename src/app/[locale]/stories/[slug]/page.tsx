import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProvider } from "@/lib/providers";
import { urlFor } from "@/lib/sanity/image";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { capitalizeTag, formatDate, formatMediaType } from "@/lib/utils";
import { blogPostingJsonLd, breadcrumbJsonLd } from "@/lib/seo/jsonLd";
import { StoryBody } from "./StoryBody";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = getProvider();
  const story = await provider.getStoryBySlug(slug);

  if (!story) return { title: "Not Found" };

  return {
    title: story.title,
    description: story.excerpt || `${story.title} — The Spidaverse`,
    openGraph: {
      title: story.title,
      description: story.excerpt || "",
      type: "article",
      publishedTime: story.publishedAt || story._createdAt,
      modifiedTime: story._updatedAt,
    },
  };
}

export default async function StoryPage({ params }: Props) {
  const t = await getTranslations();
  const { slug } = await params;
  const provider = getProvider();
  const story = await provider.getStoryBySlug(slug);

  if (!story) notFound();

  const sanityUrl = story.heroImage
    ? urlFor(story.heroImage).width(1200).height(630).url()
    : null;
  const heroUrl = story.heroImageUrl || sanityUrl || null;

  const storyUrl = `${siteUrl}/stories/${slug}`;
  const hasSpoilerBlocks = story.body?.some(
    (block: { _type: string }) => block._type === "spoilerBlock"
  );

  const publishedAt = story.publishedAt || story._createdAt;

  const jsonLdBlogPosting = blogPostingJsonLd({
    title: story.title,
    excerpt: story.excerpt,
    url: storyUrl,
    publishedAt,
    modifiedAt: story._updatedAt,
    imageUrl: heroUrl || undefined,
  });

  const jsonLdBreadcrumb = breadcrumbJsonLd([
    { name: "Home", url: siteUrl },
    { name: "Journal", url: `${siteUrl}/journal` },
    { name: story.title, url: storyUrl },
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

      <Container className="pt-3 pb-3">
        <Breadcrumb
          items={[
            { label: t("nav.home"), href: "/" },
            { label: t("nav.journal"), href: "/journal" },
            { label: story.title },
          ]}
        />
      </Container>

      {/* ── Hero ── */}
      {heroUrl ? (
        <div className="relative w-full h-[calc(70dvh-4rem)] overflow-hidden">
          <Image
            src={heroUrl}
            alt={story.heroImage?.alt || story.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background from-5% via-background/85 via-40% to-background/10" />
          <div className="absolute inset-0 bg-black/30" />

          <Container className="absolute bottom-0 left-0 right-0 pb-8 md:pb-12">
            <StoryHeroMeta story={story} t={t} publishedAt={publishedAt} />
          </Container>
        </div>
      ) : (
        <Container className="pt-6 pb-2">
          <StoryHeroMeta story={story} t={t} publishedAt={publishedAt} />
        </Container>
      )}

      <Container className="pt-8 md:pt-12 pb-8">
        <article className="max-w-3xl mx-auto">
          <StoryBody
            body={story.body}
            title={story.title}
            url={storyUrl}
            hasSpoilerBlocks={!!hasSpoilerBlocks}
          />
        </article>
      </Container>
    </>
  );
}

function StoryHeroMeta({
  story,
  t,
  publishedAt,
}: {
  story: NonNullable<Awaited<ReturnType<ReturnType<typeof getProvider>["getStoryBySlug"]>>>;
  t: Awaited<ReturnType<typeof getTranslations>>;
  publishedAt: string;
}) {
  const heroOverlay = !!(story.heroImage || story.heroImageUrl);
  const textColor = heroOverlay ? "text-white" : "text-foreground";
  const subColor = heroOverlay ? "text-white/80" : "text-muted-foreground";
  const pillBg = heroOverlay
    ? "bg-white/20 text-white border-white/30 backdrop-blur-sm"
    : "bg-accent/10 text-accent border-accent/30";
  const tagBg = heroOverlay
    ? "bg-white/10 text-white/80 hover:text-white hover:bg-white/20 border-white/20 backdrop-blur-sm"
    : "bg-accent/10 text-accent hover:bg-accent/20 border-accent/20";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mb-3 md:mb-4">
        <span
          className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${pillBg}`}
        >
          {t("journal.story")}
        </span>
        {story.mediaType && (
          <span
            className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full border ${pillBg}`}
          >
            {formatMediaType(story.mediaType)}
          </span>
        )}
      </div>

      <h1
        className={`text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight ${textColor} text-balance leading-tight mb-2 md:mb-3`}
      >
        {story.title}
      </h1>

      {story.excerpt && (
        <p
          className={`text-sm md:text-base ${subColor} leading-relaxed max-w-2xl mb-3 md:mb-4`}
        >
          {story.excerpt}
        </p>
      )}

      <div
        className={`flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm ${subColor} mb-3`}
      >
        <time dateTime={publishedAt} className="tabular-nums">
          {formatDate(publishedAt)}
        </time>
        {story.readingTime != null && (
          <>
            <span className="w-1 h-1 rounded-full bg-current opacity-50" aria-hidden="true" />
            <span>{t("article.minRead", { minutes: story.readingTime })}</span>
          </>
        )}
      </div>

      {story.tags && story.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {story.tags.map((tag) => (
            <Link
              key={tag._id}
              href={`/tags/${tag.slug.current}`}
              className={`text-[10px] md:text-xs px-2 py-0.5 md:py-1 rounded-full border transition-colors ${tagBg}`}
            >
              #{capitalizeTag(tag.title)}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
