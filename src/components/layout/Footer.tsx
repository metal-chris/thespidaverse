"use client";

import { useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { useTransition } from "@/components/transitions/TransitionProvider";

function SocialIcon({
  d,
  label,
  href,
  hoverColor,
  onClick,
  as: Component = "a",
}: {
  d: string;
  label: string;
  href?: string;
  hoverColor: string;
  onClick?: () => void;
  as?: "a" | "button";
}) {
  const props = Component === "a"
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" as const }
    : { onClick };

  return (
    <Component
      {...props}
      className="p-1.5 rounded-lg text-muted-foreground transition-colors duration-200"
      aria-label={label}
      title={label}
      style={{ ["--brand-color" as string]: hoverColor }}
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.color = hoverColor;
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => {
        e.currentTarget.style.color = "";
      }}
    >
      <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
        <path d={d} />
      </svg>
    </Component>
  );
}

function DiscordButton({ label }: { label: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = useCallback(() => {
    navigator.clipboard.writeText("spida.mane");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className="p-1.5 rounded-lg text-muted-foreground transition-colors duration-200 hover:text-[#5865F2]"
        aria-label={label}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
          <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
      </button>
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-[10px] font-medium text-white bg-[#5865F2] rounded-md whitespace-nowrap animate-fade-in">
          spida.mane copied!
        </span>
      )}
    </div>
  );
}

export function Footer() {
  const { transitionsEnabled, toggleTransitions } = useTransition();
  const t = useTranslations();

  return (
    <footer className="border-t border-border mt-8 bg-card/30">
      <Container className="py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: brand + socials */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm font-bold tracking-tight text-foreground hover:text-accent transition-colors"
            >
              {t("footer.logo")}
            </Link>
            <span className="hidden sm:block w-px h-4 bg-border" />
            <DiscordButton label={t("footer.discord")} />
          </div>

          {/* Right: copyright + transitions */}
          <div className="flex items-center gap-4">
            <p className="text-xs text-muted-foreground">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
            <span className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">
                {t("footer.transitions")}
              </span>
              <button
                onClick={toggleTransitions}
                className="relative w-7 h-[16px] rounded-full bg-border transition-colors hover:bg-muted-foreground/30"
                aria-label={transitionsEnabled ? t("footer.transitionsOn") : t("footer.transitionsOff")}
                aria-pressed={transitionsEnabled}
                title={transitionsEnabled ? t("footer.transitionsOn") : t("footer.transitionsOff")}
              >
                <span
                  className={`absolute top-[2px] w-[12px] h-[12px] rounded-full transition-all duration-200 ${
                    transitionsEnabled
                      ? "left-[13px] bg-accent"
                      : "left-[2px] bg-muted-foreground"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
