"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";

/** Inline SVG flags — render consistently across all browsers/OS */
function FlagUS({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 18" className={className} aria-hidden="true">
      <rect width="24" height="18" fill="#B22234" rx="2" />
      <rect y="1.38" width="24" height="1.38" fill="#fff" />
      <rect y="4.15" width="24" height="1.38" fill="#fff" />
      <rect y="6.92" width="24" height="1.38" fill="#fff" />
      <rect y="9.69" width="24" height="1.38" fill="#fff" />
      <rect y="12.46" width="24" height="1.38" fill="#fff" />
      <rect y="15.23" width="24" height="1.38" fill="#fff" />
      <rect width="10" height="9.69" fill="#3C3B6E" />
    </svg>
  );
}

function FlagES({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 18" className={className} aria-hidden="true">
      <rect width="24" height="18" fill="#AA151B" rx="2" />
      <rect y="4.5" width="24" height="9" fill="#F1BF00" />
    </svg>
  );
}

function FlagJP({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 18" className={className} aria-hidden="true">
      <rect width="24" height="18" fill="#fff" rx="2" />
      <rect width="24" height="18" fill="none" stroke="#e5e5e5" strokeWidth="0.5" rx="2" />
      <circle cx="12" cy="9" r="5.4" fill="#BC002D" />
    </svg>
  );
}

function FlagBR({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 18" className={className} aria-hidden="true">
      <rect width="24" height="18" fill="#009B3A" rx="2" />
      <polygon points="12,2.5 22,9 12,15.5 2,9" fill="#FEDF00" />
      <circle cx="12" cy="9" r="3.5" fill="#002776" />
    </svg>
  );
}

const FLAG_COMPONENTS: Record<string, React.FC<{ className?: string }>> = {
  en: FlagUS,
  es: FlagES,
  ja: FlagJP,
  pt: FlagBR,
};

const LOCALES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ja", label: "日本語" },
  { code: "pt", label: "Português" },
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

  const CurrentFlag = FLAG_COMPONENTS[locale];

  function switchTo(code: string) {
    router.replace(pathname, { locale: code });
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      {/* Trigger button with spinner arcs */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors"
        aria-label="Change language"
        aria-expanded={open}
      >
        <SpinnerArcs animate={open} />
        {CurrentFlag ? (
          <CurrentFlag className="relative w-5 h-[15px] rounded-sm" />
        ) : (
          <Globe className="relative w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 min-w-[150px] rounded-lg border border-border bg-background shadow-xl shadow-black/30 overflow-hidden z-50">
          {LOCALES.map(({ code, label }) => {
            const Flag = FLAG_COMPONENTS[code];
            return (
              <button
                key={code}
                onClick={() => switchTo(code)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors ${
                  code === locale
                    ? "text-accent bg-accent/10 font-medium"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {Flag && <Flag className="w-5 h-[15px] rounded-sm shrink-0" />}
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
