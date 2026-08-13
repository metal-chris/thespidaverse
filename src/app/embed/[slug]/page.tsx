import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getProvider } from "@/lib/providers";
import { routing } from "@/i18n/routing";
import { KumoWebMark } from "@/components/ui/KumoWebMark";
import { TierListChart } from "@/components/content/TierListChart";
import type { TierListBlock } from "@/types";

/**
 * The embeddable tier list: /embed/<slug>?tl=&locale=.
 *
 * This is the surface other sites iframe (directly, or via /api/oembed), so
 * it lives OUTSIDE the [locale] segment and is exempted from both the splash
 * and locale-prefix routing in middleware — an embed that redirected its host
 * page's readers to a Connect ritual would simply be broken. Locale comes in
 * as a query param instead and feeds the same message catalogs the site uses.
 *
 * It renders the full interactive chart — capsules, text list, and the Maker,
 * so a reader can rearrange the list without leaving the host page — plus the
 * one thing an off-site surface must always carry: attribution. The footer
 * marks the work as The Spidaverse's and links back to the article; it uses
 * the orb-web mark (see KumoWebMark) as the site's mark by explicit decision,
 * accepting that the two sites read as siblings.
 *
 * Only ever renders published chart content — no member/auth surface exists
 * here, which is what makes the middleware bypass safe.
 */

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tl?: string; locale?: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com";

export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: "Tier list — The Spidaverse",
    // The embed itself should not compete with the article in search results.
    robots: { index: false },
    alternates: { canonical: `${siteUrl}/articles/${slug}` },
  };
}

export default async function EmbedPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { tl, locale: rawLocale } = await searchParams;

  const locale = (routing.locales as readonly string[]).includes(rawLocale ?? "")
    ? (rawLocale as string)
    : routing.defaultLocale;
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  const provider = getProvider();
  const article = await provider.getArticleBySlug(slug);
  const block = (article?.body as unknown[] | undefined)?.find(
    (b) => (b as { _type?: string })?._type === "tierList"
  ) as TierListBlock | undefined;
  if (!article || !block) notFound();

  const articleUrl = `${siteUrl}/articles/${slug}${tl ? `/r/${encodeURIComponent(tl)}` : ""}`;
  const backLink = `${articleUrl}${articleUrl.includes("?") ? "&" : "?"}utm_source=embed`;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {/* The ?tl= arrangement is read by the Maker from location.search, which
          works unchanged inside the iframe — no seeding needed. */}
      <div className="mx-auto max-w-3xl px-3 py-3">
        <TierListChart value={block} />
        <footer className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5">
          <a
            href={backLink}
            target="_blank"
            rel="noopener"
            className="flex items-center gap-2 text-sm font-bold text-foreground no-underline hover:text-accent"
          >
            <KumoWebMark className="h-4 w-4 text-accent" />
            The Spidaverse
          </a>
          <a
            href={backLink}
            target="_blank"
            rel="noopener"
            className="text-xs font-semibold text-muted-foreground no-underline hover:text-accent"
          >
            {article.title} →
          </a>
        </footer>
      </div>
    </NextIntlClientProvider>
  );
}
