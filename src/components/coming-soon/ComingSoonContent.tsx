"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Palette } from "./particle-config";

interface ComingSoonContentProps {
  palette: Palette;
  onTogglePalette: () => void;
  earlyAccessEnabled?: boolean;
  onAccessGranted?: () => void;
}

export function ComingSoonContent({ palette, onTogglePalette, onAccessGranted }: ComingSoonContentProps) {
  const t = useTranslations();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLeap = async () => {
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
        setTimeout(() => {
          window.location.href = "/";
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

  return (
    <div className="relative z-10 flex items-center justify-center min-h-[100dvh] px-4 py-12">
      <div
        className="w-full max-w-md"
        style={{ animation: "fadeInUp 0.8s ease-out 2s both" }}
      >
        {/* Card */}
        <div
          className={`relative rounded-2xl overflow-hidden${status === "success" ? " cs-access-glow" : ""}`}
          style={status === "success" ? { "--access-glow-color": `rgba(${accentRgb},0.5)` } as React.CSSProperties : undefined}
        >
          {/* Accent border — left edge only */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[3px] pointer-events-none"
            style={{
              background: `linear-gradient(180deg, transparent, ${accent} 30%, ${accent} 70%, transparent)`,
              boxShadow: `0 0 12px rgba(${accentRgb},0.4)`,
              transition: "background 0.4s ease, box-shadow 0.4s ease",
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
              {t("comingSoon.earlyAccess")}
            </p>

            {/* Headline */}
            <h1
              className="text-center text-4xl sm:text-5xl font-extrabold leading-[1.1] mb-3 tracking-tight cs-glitch-strong"
              style={{ color: "#F5F5F5" }}
              data-text={t("comingSoon.headline")}
            >
              {t("comingSoon.headline")}
            </h1>

            {/* Subline */}
            <p
              className="text-center text-sm sm:text-base leading-relaxed mb-8 max-w-xs mx-auto"
              style={{ color: "#999" }}
            >
              {t("comingSoon.subline")}
            </p>

            {/* Leap of Faith CTA */}
            {status === "success" ? (
              <div className="text-center cs-access-reveal">
                <p
                  className="text-lg font-extrabold tracking-[0.15em] uppercase cs-glitch-access"
                  style={{ color: accent }}
                  data-text={t("comingSoon.accessGranted")}
                >
                  {t("comingSoon.accessGranted")}
                </p>
                <p className="text-xs mt-2" style={{ color: "#666" }}>
                  {t("comingSoon.welcomeToTheWeb")}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleLeap}
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
                        {t("comingSoon.swinging")}
                      </span>
                    ) : (
                      t("comingSoon.leapOfFaith")
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

            {/* Divider */}
            <div
              className="my-7 h-px w-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
              }}
            />

            {/* Palette toggle */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={onTogglePalette}
                className="flex items-center gap-2 text-[11px] font-mono tracking-[0.1em] uppercase transition-all duration-300 rounded-full px-4 py-2"
                style={{
                  color: accent,
                  background: `rgba(${accentRgb},0.08)`,
                  border: `1px solid rgba(${accentRgb},0.2)`,
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full transition-colors duration-300"
                  style={{ background: accent }}
                />
                {{ miles: t("comingSoon.milesMode"), peter: t("comingSoon.peterMode"), venom: t("comingSoon.venomMode") }[palette]}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
