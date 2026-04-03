import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TransitionProvider } from "@/components/transitions/TransitionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { websiteJsonLd } from "@/lib/seo/jsonLd";
import { routing } from "@/i18n/routing";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com"),
    title: {
      default: "The Spidaverse",
      template: "%s | The Spidaverse",
    },
    description:
      "Movies. TV. Games. Anime. Books. Music. One web connects them all. A pop culture blog by Spida-Mane.",
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : locale,
      url: "https://thespidaverse.com",
      siteName: "The Spidaverse",
      title: "The Spidaverse",
      description:
        "Movies. TV. Games. Anime. Books. Music. One web connects them all.",
    },
    twitter: {
      card: "summary_large_image",
      title: "The Spidaverse",
      description:
        "Movies. TV. Games. Anime. Books. Music. One web connects them all.",
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      types: {
        "application/rss+xml": "/rss.xml",
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider>
        <TransitionProvider>
          <Header />
          <main id="main-content" className="flex-1">{children}</main>
          <Footer />
          <ScrollToTop />
        </TransitionProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
