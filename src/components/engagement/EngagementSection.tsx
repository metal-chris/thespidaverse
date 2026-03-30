"use client";

import { useEffect, useState, useCallback } from "react";
import { CommunityWebRating } from "./CommunityWebRating";
import { PollQuestions } from "./PollQuestions";
import { CollapsibleActions } from "@/components/ui/CollapsibleActions";
import {
  hasRated,
  markRated,
  hasAnswered,
  markAnswered,
} from "@/lib/engagement/localStorage";
import type { PollConfig, EngagementResults, WebRatingStats } from "@/types";

interface EngagementSectionProps {
  slug: string;
  title: string;
  shareUrl: string;
  authorWebRating?: number;
  pollConfig?: PollConfig;
  /** Called after engagement results load so parent can display community stats */
  onCommunityStatsLoaded?: (stats: WebRatingStats | null) => void;
}

export function EngagementSection({
  slug,
  title,
  shareUrl,
  authorWebRating,
  pollConfig,
  onCommunityStatsLoaded,
}: EngagementSectionProps) {
  const [results, setResults] = useState<EngagementResults | null>(null);
  const [loading, setLoading] = useState(true);

  const showRating =
    pollConfig?.enableCommunityRating !== false && authorWebRating != null;
  const questions = pollConfig?.pollQuestions ?? [];
  const hasEngagement = showRating || questions.length > 0;

  // Fetch initial results
  useEffect(() => {
    if (!hasEngagement) {
      setLoading(false);
      onCommunityStatsLoaded?.(null);
      return;
    }

    fetch(`/api/engagement/results/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setResults(data);
        onCommunityStatsLoaded?.(data?.webRating ?? null);
      })
      .catch(() => {
        onCommunityStatsLoaded?.(null);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, hasEngagement]);

  // Submit web rating
  const handleRatingSubmit = useCallback(
    async (score: number) => {
      const res = await fetch(`/api/engagement/web-rating/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, honeypot: "" }),
      });
      const data = await res.json();

      if (data.success || data.reason === "already_rated") {
        markRated(
          slug,
          data.reason === "already_rated" ? data.existingScore : score
        );
        if (data.aggregated) {
          onCommunityStatsLoaded?.(data.aggregated);
        }
      }

      return data;
    },
    [slug, onCommunityStatsLoaded]
  );

  // Submit poll answer
  const handlePollSubmit = useCallback(
    async (questionKey: string, answer: string) => {
      const res = await fetch(`/api/engagement/poll/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionKey, answer, honeypot: "" }),
      });
      const data = await res.json();

      if (data.success || data.reason === "already_answered") {
        markAnswered(slug, questionKey, answer);
      }

      return data;
    },
    [slug]
  );

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
        Loading...
      </div>
    );
  }

  // Build existing answers map from localStorage
  const existingAnswers: Record<string, string | null> = {};
  for (const q of questions) {
    existingAnswers[q.questionKey] = hasAnswered(slug, q.questionKey);
  }

  // Build sections for divider logic
  const sections: React.ReactNode[] = [];

  if (showRating) {
    sections.push(
      <CommunityWebRating
        key="rating"
        slug={slug}
        initialStats={results?.webRating}
        existingScore={hasRated(slug)}
        onSubmit={handleRatingSubmit}
      />
    );
  }

  if (questions.length > 0) {
    sections.push(
      <PollQuestions
        key="polls"
        slug={slug}
        questions={questions}
        initialResults={results?.polls}
        existingAnswers={existingAnswers}
        onSubmit={handlePollSubmit}
      />
    );
  }

  // Collapsible react + share toolbar
  sections.push(
    <div key="actions" className="flex flex-col items-center gap-1.5">
      <p className="text-[10px] text-muted-foreground/60 tracking-wide">
        Click to
      </p>
      <CollapsibleActions
        slug={slug}
        title={title}
        shareUrl={shareUrl}
      />
    </div>
  );

  return (
    <section
      id="engagement"
      className="rounded-xl border border-border bg-card/30 p-5 md:p-6 space-y-0 scroll-mt-24"
      aria-label="Community engagement"
    >
      {/* Honeypot — invisible to humans, bots fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {sections.map((section, i) => (
        <div key={i}>
          {i > 0 && <div className="h-px bg-border my-5" />}
          {section}
        </div>
      ))}
    </section>
  );
}
