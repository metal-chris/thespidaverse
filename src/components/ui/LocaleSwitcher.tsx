"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const LOCALES = [
  { code: "en", flag: "🇺🇸", label: "English" },
  { code: "es", flag: "🇪🇸", label: "Español" },
  { code: "ja", flag: "🇯🇵", label: "日本語" },
  { code: "pt", flag: "🇧🇷", label: "Português" },
];

/** Three rotating arcs matching the WebSpinner theme */
function SpinnerArcs({ animate }: { animate: boolean }) {
  const s = 32;
  const center = s / 2;
  const r = 14;

  const arcs = [0, 120, 240].map((startAngle) => {
    const gap = 20;
    const arcSpan = 120 - gap;
    const a1 = ((startAngle + gap / 2 - 90) * Math.PI) / 180;
    const a2 = ((startAngle + gap / 2 + arcSpan - 90) * Math.PI) / 180;
    return {
      d: `M ${(center + Math.cos(a1) * r).toFixed(2)} ${(center + Math.sin(a1) * r).toFixed(2)} A ${r} ${r} 0 0 1 ${(center + Math.cos(a2) * r).toFixed(2)} ${(center + Math.sin(a2) * r).toFixed(2)}`,
      startAngle,
    };
  });

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${animate ? "opacity-100" : "opacity-0"}`}
      style={animate ? { animation: "spin 3s linear infinite" } : undefined}
    >
      {arcs.map(({ d, startAngle }) => (
        <path
          key={startAngle}
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          className="text-accent"
          opacity={0.6}
        />
      ))}
    </svg>
  );
}

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const currentLocale = LOCALES.find((l) => l.code === locale);

  function switchTo(code: string) {
    router.replace(pathname, { locale: code });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Globe trigger button with spinner arcs */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
        aria-label="Change language"
        aria-expanded={open}
      >
        <SpinnerArcs animate={open} />
        <span className="relative text-base leading-none" aria-hidden="true">
          {currentLocale?.flag || "🌐"}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[140px] rounded-lg border border-border bg-background shadow-xl shadow-black/30 overflow-hidden z-50">
          {LOCALES.map(({ code, flag, label }) => (
            <button
              key={code}
              onClick={() => switchTo(code)}
              className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
                code === locale
                  ? "text-accent bg-accent/10 font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span className="text-base leading-none">{flag}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
