import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

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
        {/* Prevent flash of wrong theme.
            Stamps BOTH axes before first paint. Mode matters more than palette
            here: a light-mode visitor previously got a full-page dark flash on
            every navigation, which the single-axis version could not even
            express. Cookie is read first because it is the one a sibling site
            under .thespidaverse.com can have written; localStorage is the
            fallback for anyone who chose before the cookie existed. With no
            stored mode we follow the OS, and default to dark — every surface
            was dark before this axis existed, so an absent preference must
            never silently flip someone to light. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var d = document.documentElement;
                  var ck = function(k) {
                    var m = document.cookie.match(new RegExp('(?:^|; *)' + k + '=([^;]*)'));
                    return m ? decodeURIComponent(m[1]) : null;
                  };
                  var theme = ck('spidaverse-theme') || localStorage.getItem('spidaverse-theme');
                  if (theme === 'venom' || theme === 'peter') d.setAttribute('data-theme', theme);

                  var mode = ck('spidaverse-mode') || localStorage.getItem('spidaverse-mode');
                  if (mode !== 'light' && mode !== 'dark') {
                    mode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                  }
                  d.setAttribute('data-mode', mode);
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
        {children}
      </body>
    </html>
  );
}
