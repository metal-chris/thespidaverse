"use client";

import { useState, useRef } from "react";
import type { Palette } from "./particle-config";

interface ComingSoonContentProps {
  palette: Palette;
  onTogglePalette: () => void;
  earlyAccessEnabled?: boolean;
  onAccessGranted?: () => void;
}

export function ComingSoonContent({ palette, onTogglePalette, earlyAccessEnabled = false, onAccessGranted }: ComingSoonContentProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Early access
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [accessStatus, setAccessStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [accessError, setAccessError] = useState("");

  const handleEarlyAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;
    setAccessStatus("loading");
    setAccessError("");
    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        setAccessStatus("success");
        onAccessGranted?.();
        setTimeout(() => {
          window.location.href = "/";
        }, 3200);
      } else {
        setAccessStatus("error");
        setAccessError("Invalid passcode.");
      }
    } catch {
      setAccessStatus("error");
      setAccessError("Something went wrong.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus("error");
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
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
          className={`relative rounded-2xl overflow-hidden${accessStatus === "success" ? " cs-access-glow" : ""}`}
          style={accessStatus === "success" ? { "--access-glow-color": `rgba(${accentRgb},0.5)` } as React.CSSProperties : undefined}
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
            {/* Label with glitch animation */}
            <p
              className="text-center text-[13px] font-mono font-semibold tracking-[0.25em] uppercase mb-5 cs-glitch-text"
              style={{ color: accent, transition: "color 0.4s ease" }}
              data-text="Coming Soon"
            >
              Coming Soon
            </p>

            {/* Headline */}
            <h1
              className="text-center text-4xl sm:text-5xl font-extrabold leading-[1.1] mb-3 tracking-tight cs-glitch-strong"
              style={{ color: "#F5F5F5" }}
              data-text="The Spidaverse"
            >
              The Spidaverse
            </h1>

            {/* Subheadline */}
            <p
              className="text-center text-sm sm:text-base leading-relaxed mb-8 max-w-xs mx-auto"
              style={{ color: "#777" }}
            >
              One web connects them all.
              <br />
              <span style={{ color: "#999" }}>Be the first to swing&nbsp;through.</span>
            </p>

            {/* Email form */}
            {status === "success" ? (
              <div
                className="text-center py-5 rounded-xl"
                style={{
                  background: `rgba(${accentRgb}, 0.08)`,
                  border: `1px solid rgba(${accentRgb}, 0.25)`,
                }}
              >
                <p className="text-sm font-medium" style={{ color: accent }}>
                  You&apos;re on the web.
                </p>
                <p className="text-xs mt-1" style={{ color: "#666" }}>
                  We&apos;ll let you know when it&apos;s time.
                </p>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label htmlFor="email-input" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email-input"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === "error") {
                        setStatus("idle");
                        setErrorMessage("");
                      }
                    }}
                    placeholder="your@email.com"
                    className="w-full rounded-lg text-sm outline-none transition-all duration-300"
                    style={{
                      padding: "12px 16px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      color: "#F5F5F5",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = `rgba(${accentRgb},0.6)`;
                      e.currentTarget.style.boxShadow =
                        `0 0 0 3px rgba(${accentRgb},0.1), 0 0 20px rgba(${accentRgb},0.1)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  {status === "error" && errorMessage && (
                    <p className="text-xs mt-2" style={{ color: accent }}>
                      {errorMessage}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="relative w-full rounded-lg text-sm font-semibold text-white cursor-pointer overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
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
                        Joining...
                      </span>
                    ) : (
                      "Notify Me"
                    )}
                  </span>
                </button>
              </form>
            )}

            {/* Divider */}
            <div
              className="my-7 h-px w-full"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
              }}
            />

            {/* Palette toggle */}
            <div className="flex items-center justify-center mb-6">
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
                {{ miles: "Miles Mode", peter: "Peter Mode", venom: "Venom Mode" }[palette]}
              </button>
            </div>

            {/* Early Access — only rendered when EARLY_ACCESS_PASSCODE is set */}
            {earlyAccessEnabled && (
              <div className="flex flex-col items-center gap-3 mb-6">
                {accessStatus === "success" ? (
                  <div className="text-center cs-access-reveal">
                    <p
                      className="text-lg font-extrabold tracking-[0.15em] uppercase cs-glitch-access"
                      style={{ color: accent }}
                      data-text="Access Granted"
                    >
                      Access Granted
                    </p>
                    <p className="text-xs mt-2" style={{ color: "#666" }}>
                      Welcome to the web.
                    </p>
                  </div>
                ) : !showPasscode ? (
                  <button
                    type="button"
                    onClick={() => setShowPasscode(true)}
                    className="text-[11px] font-mono tracking-[0.1em] uppercase transition-all duration-300"
                    style={{ color: "#555" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = accent; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "#555"; }}
                  >
                    Early Access
                  </button>
                ) : (
                  <form onSubmit={handleEarlyAccess} className="flex items-center gap-2 w-full max-w-[260px]">
                    <input
                      type="password"
                      value={passcode}
                      onChange={(e) => {
                        setPasscode(e.target.value);
                        if (accessStatus === "error") { setAccessStatus("idle"); setAccessError(""); }
                      }}
                      placeholder="Enter passcode"
                      autoFocus
                      className="flex-1 rounded-lg text-xs outline-none transition-all duration-300"
                      style={{
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#F5F5F5",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = `rgba(${accentRgb},0.5)`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                      }}
                    />
                    <button
                      type="submit"
                      disabled={accessStatus === "loading"}
                      className="rounded-lg text-xs font-semibold transition-all duration-300 disabled:opacity-50"
                      style={{
                        padding: "8px 14px",
                        background: `rgba(${accentRgb},0.15)`,
                        color: accent,
                        border: `1px solid rgba(${accentRgb},0.3)`,
                      }}
                    >
                      {accessStatus === "loading" ? "..." : "Go"}
                    </button>
                  </form>
                )}
                {accessError && (
                  <p className="text-[11px]" style={{ color: "#F87171" }}>{accessError}</p>
                )}
              </div>
            )}

            {/* Social media icons - temporarily hidden */}
            {/* <div className="flex items-center justify-center gap-4">
              <SocialLink href="https://www.youtube.com/@daspida-mane" label="YouTube">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://www.twitch.tv/spidaman3" label="Twitch">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                  <path d="M11.64 5.93h1.43v4.28h-1.43m3.93-4.28H17v4.28h-1.43M7 2L3.43 5.57v12.86h4.28V22l3.58-3.57h2.85L20.57 12V2m-1.43 9.29l-2.85 2.85h-2.86l-2.5 2.5v-2.5H7.71V3.43h11.43z" />
                </svg>
              </SocialLink>
              <SocialLink href="https://instagram.com/spida.world" label="Instagram">
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </SocialLink>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText('spida.mane')}
                aria-label="Discord: spida.mane (click to copy)"
                title="Discord: spida.mane (click to copy)"
                className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300"
                style={{
                  color: "#555",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#E82334";
                  e.currentTarget.style.background = "rgba(232,35,52,0.1)";
                  e.currentTarget.style.borderColor = "rgba(232,35,52,0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#555";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                }}
              >
                <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300"
      style={{
        color: "#555",
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#E82334";
        e.currentTarget.style.background = "rgba(232,35,52,0.1)";
        e.currentTarget.style.borderColor = "rgba(232,35,52,0.25)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#555";
        e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </a>
  );
}
