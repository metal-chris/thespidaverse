"use client";

import { cn } from "@/lib/utils";

const platforms = [
  {
    name: "YouTube",
    handle: "@daspida-mane",
    href: "https://www.youtube.com/@daspida-mane",
    color: "text-red-500 border-red-500/30 hover:border-red-500/60 hover:bg-red-500/5",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Twitch",
    handle: "spidaman3",
    href: "https://www.twitch.tv/spidaman3",
    color: "text-purple-500 border-purple-500/30 hover:border-purple-500/60 hover:bg-purple-500/5",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    handle: "spida.world",
    href: "https://instagram.com/spida.world",
    color: "text-pink-500 border-pink-500/30 hover:border-pink-500/60 hover:bg-pink-500/5",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    handle: "spida.mane",
    href: "#",
    color: "text-indigo-400 border-indigo-400/30 hover:border-indigo-400/60 hover:bg-indigo-400/5",
    onClick: () => navigator.clipboard.writeText("spida.mane"),
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

const formats = [
  { name: "First Bite", desc: "Quick impressions" },
  { name: "The Full Web", desc: "Deep review" },
  { name: "Spin the Block", desc: "Ranked list" },
  { name: "The Sinister Six", desc: "Top 6 picks" },
  { name: "The Gauntlet", desc: "Series marathon" },
  { name: "Versus", desc: "Head to head" },
  { name: "The Daily Bugle", desc: "News & takes" },
  { name: "Spida Sense", desc: "Predictions" },
  { name: "The Rotation", desc: "Monthly roundup" },
  { name: "State of the Game", desc: "Industry check-in" },
];

export function ArsenalPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      {/* Platforms */}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
          Platforms
        </p>
        <div className="space-y-2">
          {platforms.map((p) => (
            <a
              key={p.name}
              href={p.href}
              onClick={p.onClick ? (e) => { e.preventDefault(); p.onClick(); } : undefined}
              target={p.onClick ? undefined : "_blank"}
              rel={p.onClick ? undefined : "noopener noreferrer"}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg border bg-card/50 transition-all duration-200",
                p.color
              )}
            >
              {p.icon}
              <div>
                <span className="text-sm font-semibold text-card-foreground">{p.name}</span>
                <span className="block text-[10px] text-muted-foreground">{p.handle}</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Article Formats */}
      <div>
        <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-3">
          Article Formats
        </p>
        <div className="flex flex-wrap gap-1.5">
          {formats.map((f) => (
            <div
              key={f.name}
              className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-card border border-border text-muted-foreground"
              title={f.desc}
            >
              {f.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
