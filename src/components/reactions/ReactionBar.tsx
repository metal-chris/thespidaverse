"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReactionCounts } from "@/types";

const REACTION_EMOJIS: Record<string, { emoji: string; label: string }> = {
  fire: { emoji: "🔥", label: "Fire" },
  love: { emoji: "❤️", label: "Love" },
  mindblown: { emoji: "🤯", label: "Mind Blown" },
  cool: { emoji: "😎", label: "Cool" },
  trash: { emoji: "🗑️", label: "Trash" },
};

interface ReactionBarProps {
  slug: string;
  className?: string;
}

export function ReactionBar({ slug, className = "" }: ReactionBarProps) {
  const [reactions, setReactions] = useState<ReactionCounts>({
    fire: 0,
    love: 0,
    mindblown: 0,
    cool: 0,
    trash: 0,
  });
  const [total, setTotal] = useState(0);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [justReacted, setJustReacted] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/reactions/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.reactions) {
          setReactions(d.reactions);
          setTotal(d.total || 0);
        }
      })
      .catch(() => {});
  }, [slug]);

  const handleReaction = useCallback(
    async (type: string) => {
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
          setTotal(d.total || 0);
          setJustReacted(type);
          setCooldown(true);
          setTimeout(() => {
            setCooldown(false);
            setJustReacted(null);
          }, 60000);
        } else if (res.status === 429) {
          setCooldown(true);
          setTimeout(() => setCooldown(false), 60000);
        }
      } catch {
        // Silently fail
      } finally {
        setSubmitting(null);
      }
    },
    [slug, cooldown, submitting]
  );

  return (
    <div className={`${className}`} role="group" aria-label="Article reactions">
      <p className="text-sm text-muted-foreground mb-2" aria-live="polite">
        {total > 0 ? `${total} reaction${total !== 1 ? "s" : ""}` : "Be the first to react"}
      </p>
      <div className="flex flex-wrap gap-2">
        {Object.entries(REACTION_EMOJIS).map(([type, { emoji, label }]) => {
          const count = reactions[type as keyof ReactionCounts] || 0;
          const isActive = justReacted === type;

          return (
            <button
              key={type}
              onClick={() => handleReaction(type)}
              disabled={cooldown || !!submitting}
              className={`
                inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] min-w-[44px] justify-center rounded-full border text-sm
                transition-all duration-200
                ${isActive
                  ? "border-accent bg-accent/10 scale-110"
                  : "border-border bg-card hover:border-accent/50 hover:bg-muted"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label={`React with ${label}${count > 0 ? `, ${count} reactions` : ""}`}
              title={label}
            >
              <span className={`text-base ${submitting === type ? "animate-bounce" : ""}`}>
                {emoji}
              </span>
              {count > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
