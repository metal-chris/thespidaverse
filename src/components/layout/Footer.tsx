"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { useTransition } from "@/components/transitions/TransitionProvider";

function SocialIcon({
  d,
  label,
  href,
}: {
  d: string;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label={label}
    >
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d={d} />
      </svg>
    </a>
  );
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/journal", label: "Journal" },
  { href: "/collections", label: "Collections" },
  { href: "/the-web", label: "The Web" },
  { href: "/about", label: "About" },
];

const categoryLabels = [
  "Movies & TV",
  "Video Games",
  "Anime & Manga",
  "Music",
];

export function Footer() {
  const { transitionsEnabled, toggleTransitions } = useTransition();

  return (
    <footer className="border-t border-border mt-16 bg-card/30">
      <Container className="py-10 md:py-14">
        {/* Top row: brand + nav columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="text-lg font-bold tracking-tight text-foreground hover:text-accent transition-colors"
            >
              The Spidaverse
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs leading-relaxed">
              One web connecting movies, TV, games, anime, manga, and
              music. A personal pop-culture blog by Spida Mane.
            </p>
            <div className="mt-4 flex items-center gap-1">
              <SocialIcon
                label="YouTube"
                href="https://www.youtube.com/@daspida-mane"
                d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"
              />
              <SocialIcon
                label="Twitch"
                href="https://www.twitch.tv/spidaman3"
                d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z"
              />
              <SocialIcon
                label="Instagram"
                href="https://instagram.com/spida.world"
                d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 017.8 2m-.2 2A3.6 3.6 0 004 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5M12 7a5 5 0 110 10 5 5 0 010-10m0 2a3 3 0 100 6 3 3 0 000-6z"
              />
              <button
                onClick={() => navigator.clipboard.writeText('spida.mane')}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Discord: spida.mane (click to copy)"
                title="Discord: spida.mane (click to copy)"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </button>
              <a
                href="/rss.xml"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="RSS Feed"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  fill="currentColor"
                >
                  <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20 5 20 4 19 4 17.82a2.18 2.18 0 012.18-2.18zM4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44zm0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93v-2.83z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Navigate column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">
              Navigate
            </h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">
              Categories
            </h4>
            <ul className="space-y-2">
              {categoryLabels.map((cat) => (
                <li key={cat}>
                  <span className="text-sm text-muted-foreground">
                    {cat}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} The Spidaverse. Built by{" "}
            <Link href="/about" className="text-foreground font-medium hover:text-accent transition-colors">
              Spida Mane
            </Link>.
          </p>

          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground">
              Transitions
            </span>
            <button
              onClick={toggleTransitions}
              className="relative w-8 h-[18px] rounded-full bg-border transition-colors hover:bg-muted-foreground/30"
              aria-label={`Page transitions ${transitionsEnabled ? "on" : "off"}`}
              aria-pressed={transitionsEnabled}
              title={`Transitions ${transitionsEnabled ? "on" : "off"}`}
            >
              <span
                className={`absolute top-[2px] w-[14px] h-[14px] rounded-full transition-all duration-200 ${
                  transitionsEnabled
                    ? "left-[17px] bg-accent"
                    : "left-[2px] bg-muted-foreground"
                }`}
              />
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
