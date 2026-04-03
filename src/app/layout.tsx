import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { TransitionProvider } from "@/components/transitions/TransitionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { websiteJsonLd } from "@/lib/seo/jsonLd";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com"),
  title: {
    default: "The Spidaverse",
    template: "%s | The Spidaverse",
  },
  description:
    "Movies. TV. Games. Anime. Books. Music. One web connects them all. A pop culture blog by Spida-Mane.",
  openGraph: {
    type: "website",
    locale: "en_US",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Favicon + Manifest */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#E82334" />
        {/* JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />
        {/* Prevent flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('spidaverse-theme');
                  if (theme === 'venom' || theme === 'peter') {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Skip navigation link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[99999] focus:px-4 focus:py-2 focus:bg-accent focus:text-background focus:rounded-lg focus:text-sm focus:font-medium"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <TransitionProvider>
            <Header />
            <main id="main-content" className="flex-1">{children}</main>
            <Footer />
            <ScrollToTop />
          </TransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
