"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SearchButton } from "@/components/search/SearchButton";
import { Nav } from "./Nav";
import { Container } from "@/components/ui/Container";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <ScrollProgress />
      <Container className="flex items-center justify-between h-16 relative">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-foreground hover:text-accent transition-colors"
        >
          The Spidaverse
        </Link>

        {/* Desktop Nav (centered) */}
        <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Nav />
        </div>

        {/* Desktop Actions (right) */}
        <div className="hidden md:flex items-center gap-2">
          <SearchButton />
          <ThemeToggle />
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <SearchButton />
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </Container>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <Container className="py-4">
            <Nav mobile onNavigate={() => setMobileOpen(false)} />
          </Container>
        </div>
      )}
    </header>
  );
}
