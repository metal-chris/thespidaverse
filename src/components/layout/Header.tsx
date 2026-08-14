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
          className="group flex min-h-[44px] items-center gap-2.5 text-xl font-bold tracking-tight text-foreground hover:text-accent transition-colors"
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

        {/* Mobile/Tablet Controls.
            SettingsBar deliberately does NOT live here — it moves into the menu
            panel below. At 390px (iPhone 13) this row was search 40 + settings
            168 + menu 40 + gaps = 272px against the 231px left over after the
            wordmark, overflowing the document by a measured 41px: the palette
            toggle sat entirely off-screen at x=390.8, and the wordmark was
            squeezed until "The Spidaverse" wrapped onto two lines.

            The three settings stay one SettingsBar in one fixed order, per that
            component's own note — this changes only WHERE it is mounted at
            small widths, which is the one thing that keeps it from having to
            become two components. */}
        <div className="flex items-center gap-2 lg:hidden">
          <SearchButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md hover:bg-muted transition-colors"
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

      {/* Mobile/Tablet Menu.
          Open height is the viewport minus the h-16 bar, not a fixed max-h-96.
          384px was already only just enough for nine nav items, and adding the
          settings row pushed the last item and the whole settings group past
          the clip — reachable by nobody, because `overflow-hidden` (needed for
          the collapse animation) gives no scrollbar to find them with.
          `overflow-y-auto` while open restores that, and `100dvh` rather than
          `100vh` is what keeps it honest on iOS Safari, where the address bar
          shrinks the visual viewport without changing `vh`. */}
      <div
        className={`lg:hidden border-t border-border bg-background/95 backdrop-blur-md transition-all duration-300 ease-out ${
          mobileOpen
            ? "max-h-[calc(100dvh-4rem)] overflow-y-auto opacity-100"
            : "max-h-0 overflow-hidden opacity-0 border-t-transparent"
        }`}
      >
        <Container className="py-4">
          <Nav mobile onNavigate={() => setMobileOpen(false)} />
          {/* The settings the header cannot afford to show at this width.
              Same component, same order, given the room to be tappable — and
              labelled, because three bare icons in a drawer read as decoration
              and go unused. */}
          <div className="mt-4 border-t border-border pt-4">
            <SettingsBar labelled />
          </div>
        </Container>
      </div>
    </header>
  );
}
