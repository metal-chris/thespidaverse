"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, BarChart3, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ANALYTICS_PASSWORD;

const ADMIN_SECTIONS = [
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/media", label: "Media", icon: ImageIcon },
] as const;

function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-12 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" strokeWidth={2} />
          The Spidaverse
        </Link>
        <div className="flex items-center gap-1">
          {ADMIN_SECTIONS.map((section) => {
            const Icon = section.icon;
            const active = pathname?.startsWith(section.href);
            return (
              <Link
                key={section.href}
                href={section.href}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-card"
                )}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={2} />
                {section.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  // If no password configured, allow access (dev mode)
  if (!ADMIN_PASSWORD) return <><AdminNav />{children}</>;

  if (authed) return <><AdminNav />{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input === ADMIN_PASSWORD) {
            setAuthed(true);
            setError(false);
          } else {
            setError(true);
          }
        }}
        className="w-full max-w-sm space-y-4"
      >
        <h1 className="text-lg font-bold text-foreground text-center">
          The Spidaverse — Admin
        </h1>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {error && (
          <p className="text-xs text-red-400 text-center">
            Wrong password. Try again.
          </p>
        )}
        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-accent text-background font-semibold hover:opacity-90 transition-opacity"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
