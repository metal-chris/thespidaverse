"use client";

import { useState } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { SearchButton } from "@/components/search/SearchButton";
import { Nav } from "./Nav";
import { Container } from "@/components/ui/Container";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { List, X } from "lucide-react";

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
        <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
          <Nav />
        </div>

        {/* Desktop Actions (right) */}
        <div className="hidden lg:flex items-center gap-2">
          <SearchButton />
          <ThemeToggle />
        </div>

        {/* Mobile/Tablet Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <SearchButton />
          <ThemeToggle />
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
          mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0 border-t-transparent"
        }`}
      >
        <Container className="py-4">
          <Nav mobile onNavigate={() => setMobileOpen(false)} />
        </Container>
      </div>
    </header>
  );
}
