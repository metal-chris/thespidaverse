"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/ui/LocaleSwitcher";
import { ModeToggle } from "@/components/theme/ModeToggle";
import { PaletteToggle } from "@/components/theme/PaletteToggle";
import type { Palette } from "@/components/web-canvas/particle-config";

interface SplashContentProps {
  palette: Palette;
  earlyAccessEnabled?: boolean;
  onAccessGranted?: () => void;
}

export function SplashContent({ palette, onAccessGranted }: SplashContentProps) {
  const t = useTranslations();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleConnect = async () => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: "leap-of-faith" }),
      });
      if (res.ok) {
        setStatus("success");
        onAccessGranted?.();
        // Return to wherever the visitor was headed before the splash caught
        // them (middleware carries it in ?next=). Same-origin paths only —
        // reject anything not starting with a single "/" so a crafted link
        // cannot turn the splash into an open redirect.
        const next = new URLSearchParams(window.location.search).get("next");
        const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
        setTimeout(() => {
          window.location.href = dest;
        }, 3200);
      } else {
        setStatus("error");
        setErrorMessage(t("common.somethingWentWrong"));
      }
    } catch {
      setStatus("error");
      setErrorMessage(t("common.somethingWentWrong"));
    }
  };

  const accents: Record<string, string> = { miles: "#E82334", peter: "#1E50DC", venom: "#FFFFFF" };
  const accentRgbs: Record<string, string> = { miles: "232,35,52", peter: "30,80,220", venom: "255,255,255" };
  const accent = accents[palette];
  const accentRgb = accentRgbs[palette];
  const isLight = palette === "venom";

  /**
   * The card's accent edge follows the cursor.
   *
   * The web canvas behind this card already lights up around the pointer; a
   * border pinned to the left edge ignored that entirely, so the card read as
   * a flat plate sitting on a reactive background. Writing the pointer's
   * position into CSS custom properties lets one masked gradient ring travel
   * the whole perimeter, so the card is lit from wherever the cursor actually
   * is — the same light source as the web.
   *
   * Coordinates are card-relative percentages, written straight to the DOM
   * node rather than through state: this fires on every pointermove, and a
   * re-render per frame would be a waste of a render pass. Falls back to the
   * left-edge look before the pointer is ever seen (and on touch, where there
   * is no pointer to follow).
   */
  const cardRef = useRef<HTMLDivElement>(null);
  const [pointerSeen, setPointerSeen] = useState(false);

  useEffect(() => {
    // One listener, on the window. The pointer spends most of its time OUTSIDE
    // the card, and the edge should keep tracking it there — a listener bound
    // to the card would freeze the glow the moment the cursor left, which is
    // exactly when the travelling edge is most visible. A card-level handler
    // in addition to this one would just do the same work twice per frame.
    const onWindowMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = cardRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--edge-x", `${((e.clientX - r.left) / r.width) * 100}%`);
      el.style.setProperty("--edge-y", `${((e.clientY - r.top) / r.height) * 100}%`);
      // Set once — a one-way latch. React bails out of an identical setState,
      // but guarding keeps the intent legible at a glance.
      setPointerSeen((seen) => (seen ? seen : true));
    };
    window.addEventListener("pointermove", onWindowMove, { passive: true });
    return () => window.removeEventListener("pointermove", onWindowMove);
  }, []);

  return (
    <div className="relative z-10 flex items-center justify-center min-h-[100dvh] px-4 py-12">
      {/* Preferences at PAGE level, not inside the card.
          Two reasons, and both matter. The card sets `overflow-hidden` for its
          rounded corners and its cursor-tracked edge, which clipped the
          language dropdown the moment it opened — the menu was there, just
          cut off. And Kumo Club's teaser floats the same three controls in the
          corner rather than burying them in the content card, so lifting them
          out is what actually matches the presentation we are unifying on.

          These are the app's OWN components — LocaleSwitcher is the one in the
          site header — not splash-local copies. Palette dots are unlabelled by
          design: the old control announced the theme by character name, which
          tied brand copy to a licence and told the visitor nothing a swatch
          shows faster. Accessible names describe the ACTION, never a theme. */}
      <div className="absolute right-4 top-4 z-30 flex items-center gap-2 sm:right-6 sm:top-6">
        <PaletteToggle
          label={t("splash.paletteLabel")}
          optionLabel={(p) => t(`splash.palette_${p}`)}
        />

        <ModeToggle className="h-9 w-9 rounded-full border border-white/10 bg-black/40 text-white/70 backdrop-blur hover:text-white" />

        <LocaleSwitcher />
      </div>

      <div
        className="w-full max-w-md"
        style={{ animation: "fadeInUp 0.8s ease-out 2s both" }}
      >
        {/* Card */}
        <div
          ref={cardRef}
          className={`cs-card-edge relative rounded-2xl overflow-hidden${status === "success" ? " cs-access-glow" : ""}${pointerSeen ? " cs-card-edge-live" : ""}`}
          style={
            {
              "--edge-accent": accent,
              "--edge-accent-rgb": accentRgb,
              ...(status === "success"
                ? { "--access-glow-color": `rgba(${accentRgb},0.5)` }
                : {}),
            } as React.CSSProperties
          }
        >
          {/* Accent edge. Before the pointer is ever seen — and on touch, where
              there is no cursor — this stays the original left-edge bar, so the
              card never opens in an unlit state. Once the pointer moves, the
              gradient ring below takes over and follows it. */}
          <div
            className="cs-card-edge-static absolute left-0 top-0 bottom-0 w-[3px] pointer-events-none"
            style={{
              background: `linear-gradient(180deg, transparent, ${accent} 30%, ${accent} 70%, transparent)`,
              boxShadow: `0 0 12px rgba(${accentRgb},0.4)`,
              transition: "background 0.4s ease, box-shadow 0.4s ease, opacity 0.5s ease",
            }}
          />

          <div
            className="relative rounded-2xl px-8 py-10 sm:px-10 sm:py-12"
            style={{
              background: "rgba(10, 10, 10, 0.85)",
              backdropFilter: "blur(20px) saturate(150%)",
              WebkitBackdropFilter: "blur(20px) saturate(150%)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
            }}
          >
            {/* Status label */}
            <p
              className="text-center text-[11px] font-mono font-medium tracking-[0.25em] uppercase mb-5"
              style={{ color: "#555", transition: "color 0.4s ease" }}
            >
              {t("splash.earlyAccess")}
            </p>

            {/* Headline */}
            <h1
              className="text-center text-4xl sm:text-5xl font-extrabold leading-[1.1] mb-3 tracking-tight cs-glitch-strong"
              style={{ color: "#F5F5F5" }}
              data-text={t("splash.headline")}
            >
              {t("splash.headline")}
            </h1>

            {/* Subline */}
            <p
              className="text-center text-sm sm:text-base leading-relaxed mb-8 max-w-xs mx-auto"
              style={{ color: "#999" }}
            >
              {t("splash.subline")}
            </p>

            {/* Connect CTA */}
            {status === "success" ? (
              <div className="text-center cs-access-reveal">
                <p
                  className="text-lg font-extrabold tracking-[0.15em] uppercase cs-glitch-access"
                  style={{ color: accent }}
                  data-text={t("splash.connected")}
                >
                  {t("splash.connected")}
                </p>
                <p className="text-xs mt-2" style={{ color: "#666" }}>
                  {t("splash.welcome")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={status === "loading"}
                  className="relative w-full rounded-lg text-sm font-semibold cursor-pointer overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    padding: "12px 32px",
                    background: accent,
                    color: isLight ? "#0A0A0A" : "#FFFFFF",
                    border: "none",
                    transition: "background 0.4s ease, color 0.4s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (status !== "loading") {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow =
                        `0 6px 20px rgba(${accentRgb},0.4), 0 0 40px rgba(${accentRgb},0.15)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Shimmer */}
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
                      animation: "shimmer 4s infinite",
                    }}
                  />
                  <span className="relative">
                    {status === "loading" ? (
                      <span className="flex items-center justify-center gap-2">
                        <span
                          className="inline-block w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                          style={{ animation: "spin 0.6s linear infinite" }}
                        />
                        {t("splash.connecting")}
                      </span>
                    ) : (
                      t("splash.connect")
                    )}
                  </span>
                </button>
                {status === "error" && errorMessage && (
                  <p className="text-xs text-center" style={{ color: "#F87171" }}>
                    {errorMessage}
                  </p>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
