"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { SearchButton } from "@/components/search/SearchButton";
import { SpidaverseMark } from "@/components/ui/SpidaverseMark";
import { SettingsBar } from "@/components/layout/SettingsBar";
import { Nav } from "./Nav";
import { Container } from "@/components/ui/Container";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { List, X } from "lucide-react";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-background/90 backdrop-blur-lg">
      <ScrollProgress />
      <Container className="flex items-center justify-between h-16 relative">
        {/* Logo — mark + wordmark.
            The mark inherits `currentColor`, so it takes the accent on hover
            with the wordmark rather than needing its own colour rule, and it
            recolours with the palette for free. Sized to the cap height of the
            wordmark beside it, not to a round number, so the two read as one
            lockup instead of an icon parked next to some text. */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground hover:text-accent transition-colors"
        >
          <SpidaverseMark className="h-7 w-7 shrink-0" />
          The Spidaverse
        </Link>

        {/* Desktop Nav (centered) */}
        <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Nav />
        </div>

        {/* Desktop Actions (right) */}
        <div className="hidden lg:flex items-center gap-2">
          <SearchButton />
          <SettingsBar />
        </div>

        {/* Mobile/Tablet Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <SearchButton />
          <SettingsBar />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <List className="w-6 h-6" />
            )}
          </button>
        </div>
      </Container>

      {/* Mobile/Tablet Menu */}
      <div
        className={`lg:hidden border-t border-border bg-background/95 backdrop-blur-md overflow-hidden transition-all duration-300 ease-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 border-t-transparent"
        }`}
      >
        <Container className="py-4">
          <Nav mobile onNavigate={() => setMobileOpen(false)} />
        </Container>
      </div>
    </header>
  );
}
