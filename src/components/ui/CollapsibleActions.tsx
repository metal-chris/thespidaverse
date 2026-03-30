"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import type { ReactionCounts } from "@/types";

/**
 * Custom tooltip with thin web-strand connecting line.
 * Supports a transient `flash` message that auto-clears (for "+1", "Shared!", etc.)
 */
function Tooltip({
  label,
  flash,
  children,
}: {
  label: string;
  /** Transient status message — overrides label while set, shown in accent color */
  flash?: string | null;
  children: React.ReactNode;
}) {
  const display = flash || label;
  const isFlash = !!flash;

  return (
    <span className={`relative inline-flex ${isFlash ? "tooltip-flash-active" : "group/tip"}`}>
      {children}
      {/* Tooltip container: label pill + web strand */}
      <span
        className={`
          pointer-events-none absolute left-1/2 -translate-x-1/2 z-50
          flex flex-col items-center
          bottom-full mb-0
          ${isFlash
            ? "opacity-100"
            : "opacity-0 group-hover/tip:opacity-100"
          }
          transition-opacity duration-150 ${isFlash ? "" : "delay-300"}
        `}
        role="tooltip"
      >
        {/* Label pill */}
        <span
          className={`
            px-2 py-0.5 text-[11px] font-semibold rounded-md whitespace-nowrap
            border
            ${isFlash
              ? "bg-accent/20 text-accent border-accent/40"
              : "bg-neutral-900 text-white border-neutral-700"
            }
          `}
        >
          {display}
        </span>
        {/* Web strand — thin line connecting label to icon */}
        <span
          className={`
            w-px h-2.5
            ${isFlash ? "bg-accent/60" : "bg-neutral-500"}
          `}
          aria-hidden="true"
        />
      </span>
    </span>
  );
}

const REACTIONS = [
  { type: "fire", emoji: "🔥", label: "Fire" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "mindblown", emoji: "🤯", label: "Mind Blown" },
  { type: "cool", emoji: "😎", label: "Cool" },
  { type: "trash", emoji: "🗑️", label: "Trash" },
];

const SHARE_TARGETS = [
  {
    name: "X",
    icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
    buildUrl: (title: string, url: string) =>
      `https://x.com/intent/tweet?text=${encodeURIComponent(`"${title}" on The Spidaverse`)}&url=${encodeURIComponent(url)}`,
  },
  {
    name: "Reddit",
    icon: "M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z",
    buildUrl: (title: string, url: string) =>
      `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
  },
  {
    name: "Bluesky",
    icon: "M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.59 3.313 6.187 3.028-4.612.5-5.839 2.755-3.32 5.022 5.098 4.59 7.3-1.2 7.842-2.735.162-.458.238-.676.667-.676.43 0 .505.218.667.676.543 1.536 2.744 7.325 7.842 2.735 2.52-2.267 1.292-4.522-3.32-5.022 2.597.285 5.402-.401 6.187-3.028.246-.828.624-5.79.624-6.479 0-.688-.139-1.86-.902-2.203-.66-.299-1.664-.621-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z",
    buildUrl: (title: string, url: string) =>
      `https://bsky.app/intent/compose?text=${encodeURIComponent(`"${title}" on The Spidaverse ${url}`)}`,
  },
];

interface CollapsibleActionsProps {
  slug: string;
  title: string;
  shareUrl: string;
  originalUrl?: string;
}

export function CollapsibleActions({ slug, title, shareUrl, originalUrl }: CollapsibleActionsProps) {
  const [openPanel, setOpenPanel] = useState<"react" | "share" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reaction state
  const [reactions, setReactions] = useState<ReactionCounts>({ fire: 0, love: 0, mindblown: 0, cool: 0, trash: 0 });
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [copied, setCopied] = useState(false);
  // Flash tooltip state — keyed by reaction type or "copy"/"share-X" etc.
  const [flashMessages, setFlashMessages] = useState<Record<string, string>>({});

  const showFlash = useCallback((key: string, message: string, duration = 1500) => {
    setFlashMessages((prev) => ({ ...prev, [key]: message }));
    setTimeout(() => {
      setFlashMessages((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }, duration);
  }, []);

  // Fetch reactions
  useEffect(() => {
    fetch(`/api/reactions/${slug}`)
      .then((r) => r.json())
      .then((d) => { if (d.reactions) setReactions(d.reactions); })
      .catch(() => {});
  }, [slug]);

  // Close on outside click
  useEffect(() => {
    if (!openPanel) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openPanel]);

  const handleReaction = useCallback(async (type: string) => {
    if (cooldown || submitting) return;
    setSubmitting(type);
    try {
      const res = await fetch(`/api/reactions/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaction: type }),
      });
      if (res.ok) {
        const d = await res.json();
        setReactions(d.reactions);
        setSelectedReaction(type);
        showFlash(type, "+1");
        setCooldown(true);
        setTimeout(() => setCooldown(false), 60000);
        // Auto-collapse after reacting
        setTimeout(() => setOpenPanel(null), 800);
      } else if (res.status === 429) {
        setCooldown(true);
        setTimeout(() => setCooldown(false), 60000);
      }
    } catch { /* silent */ } finally {
      setSubmitting(null);
    }
  }, [slug, cooldown, submitting, showFlash]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    showFlash("copy", "Copied!");
    setTimeout(() => { setCopied(false); setOpenPanel(null); }, 1500);
  }, [shareUrl, showFlash]);

  const togglePanel = (panel: "react" | "share") => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  // The icon for the react button — shows selected reaction or default heart
  const reactIcon = selectedReaction
    ? REACTIONS.find((r) => r.type === selectedReaction)?.emoji || "❤️"
    : "❤️";

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0);

  return (
    <div ref={containerRef} className="flex items-center justify-center gap-1.5 mt-3 overflow-visible relative">
      {/* ── React toggle ── */}
      <Tooltip label="React" flash={null}>
        <Button
          variant={openPanel === "react" ? "active" : "ghost"}
          size="sm"
          onClick={() => togglePanel("react")}
          aria-expanded={openPanel === "react"}
          aria-label="React to this piece"
        >
          <span className="text-base leading-none">{reactIcon}</span>
          <span className="hidden sm:inline">React</span>
          {totalReactions > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">{totalReactions}</span>
          )}
        </Button>
      </Tooltip>

      {/* Fan-out reaction options */}
      <div
        className={`flex items-center gap-0.5 transition-all duration-300 ease-out ${openPanel === "react" ? "max-w-[200px] sm:max-w-[280px] opacity-100" : "max-w-0 opacity-0 overflow-hidden"}`}
        aria-hidden={openPanel !== "react"}
      >
        {REACTIONS.map((r, i) => {
          const isSelected = selectedReaction === r.type;
          return (
            <Tooltip key={r.type} label={r.label} flash={flashMessages[r.type]}>
              <Button
                variant={isSelected ? "active" : "icon"}
                size="sm"
                shape="icon"
                onClick={() => handleReaction(r.type)}
                disabled={cooldown || !!submitting}
                className={`flex-shrink-0 ${isSelected ? "scale-110" : ""}`}
                style={{ transitionDelay: openPanel === "react" ? `${i * 35}ms` : "0ms" }}
                aria-label={r.label}
              >
                <span className={`text-base leading-none ${submitting === r.type ? "animate-bounce" : ""}`}>{r.emoji}</span>
              </Button>
            </Tooltip>
          );
        })}
      </div>

      {/* ── Share toggle ── */}
      <div className="flex items-center">
        {/* Fan-out share options */}
        <div
          className={`flex items-center gap-0.5 mr-1 transition-all duration-300 ease-out ${openPanel === "share" ? "max-w-[180px] sm:max-w-[320px] opacity-100" : "max-w-0 opacity-0 overflow-hidden"}`}
          aria-hidden={openPanel !== "share"}
        >
          {SHARE_TARGETS.map((target, i) => (
            <Tooltip key={target.name} label={target.name} flash={flashMessages[`share-${target.name}`]}>
              <ButtonLink
                variant="icon"
                size="sm"
                shape="icon"
                href={target.buildUrl(title, shareUrl)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => showFlash(`share-${target.name}`, "Shared!")}
                className="flex-shrink-0"
                style={{ transitionDelay: openPanel === "share" ? `${i * 35}ms` : "0ms" }}
                aria-label={`Share on ${target.name}`}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d={target.icon} />
                </svg>
              </ButtonLink>
            </Tooltip>
          ))}

          {/* Copy link */}
          <Tooltip label="Copy link" flash={flashMessages["copy"]}>
            <Button
              variant="icon"
              size="sm"
              shape="icon"
              onClick={handleCopy}
              className="flex-shrink-0"
              style={{ transitionDelay: openPanel === "share" ? `${SHARE_TARGETS.length * 35}ms` : "0ms" }}
              aria-label={copied ? "Link copied" : "Copy link"}
            >
              {copied ? (
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </Button>
          </Tooltip>
        </div>

        <Tooltip label="Share" flash={null}>
          <Button
            variant={openPanel === "share" ? "active" : "ghost"}
            size="sm"
            onClick={() => togglePanel("share")}
            aria-expanded={openPanel === "share"}
            aria-label="Share this piece"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v13" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </Button>
        </Tooltip>
      </div>

      {/* ── Source link ── */}
      {originalUrl && (
        <Tooltip label="Source" flash={null}>
          <ButtonLink
            variant="text"
            size="sm"
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-accent hover:underline"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="hidden sm:inline">Source</span>
          </ButtonLink>
        </Tooltip>
      )}
    </div>
  );
}
