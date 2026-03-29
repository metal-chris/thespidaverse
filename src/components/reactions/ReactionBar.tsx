"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
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
  const [showFirstBadge, setShowFirstBadge] = useState(false);

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
          const wasFirst = total === 0;
          setReactions(d.reactions);
          setTotal(d.total || 0);
          setJustReacted(type);
          if (wasFirst) {
            setShowFirstBadge(true);
            setTimeout(() => setShowFirstBadge(false), 3000);
          }
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
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out mb-2 ${
          showFirstBadge || total > 0 ? 'max-h-6 opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-live="polite"
      >
        {showFirstBadge ? (
          <p className="text-sm font-semibold text-green-500 animate-pulse">First!</p>
        ) : total > 0 ? (
          <p className="text-sm text-muted-foreground">{total} reaction{total !== 1 ? "s" : ""}</p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {Object.entries(REACTION_EMOJIS).map(([type, { emoji, label }]) => {
          const count = reactions[type as keyof ReactionCounts] || 0;
          const isActive = justReacted === type;

          return (
            <Button
              key={type}
              variant={isActive ? "active" : "ghost"}
              size="md"
              isActive={isActive}
              onClick={() => handleReaction(type)}
              disabled={cooldown || !!submitting}
              className={isActive ? "scale-110" : ""}
              aria-label={`React with ${label}${count > 0 ? `, ${count} reactions` : ""}`}
              title={label}
            >
              <span className={`text-base leading-none ${submitting === type ? "animate-bounce" : ""}`}>
                {emoji}
              </span>
              {count > 0 && (
                <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
