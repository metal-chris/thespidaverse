"use client";

import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import { SpoilerProvider, RevealAllToggle } from "@/components/content/SpoilerBlock";
import { AmbientPlayer } from "@/components/audio/AmbientPlayer";
import { EngagementSection } from "@/components/engagement/EngagementSection";
import { portableTextComponents } from "@/components/content/PortableTextComponents";
import type { PollConfig } from "@/types";

interface ArticleBodyProps {
  body: PortableTextBlock[];
  title: string;
  slug: string;
  url: string;
  category?: string;
  format?: string;
  hasSpoilerBlocks: boolean;
  ambientAudioUrl?: string;
  pollConfig?: PollConfig;
}

export function ArticleBody({
  body,
  title,
  slug,
  url,
  hasSpoilerBlocks,
  ambientAudioUrl,
  pollConfig,
}: ArticleBodyProps) {
  return (
    <SpoilerProvider>
      {/* ── Controls Bar ── */}
      {hasSpoilerBlocks && (
        <div className="flex justify-end mb-8 pb-4 border-b-2 border-border">
          <RevealAllToggle />
        </div>
      )}

      {/* ── Article Body ── */}
      <div className="article-prose prose prose-lg prose-invert max-w-none prose-headings:text-accent prose-headings:font-bold prose-p:text-foreground prose-a:text-accent prose-a:underline prose-a:decoration-accent/30 hover:prose-a:decoration-accent prose-strong:text-accent prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:pl-4 prose-img:rounded-lg prose-hr:border-border prose-li:text-foreground prose-code:text-accent">
        <PortableText value={body} components={portableTextComponents} />
      </div>

      {/* ── Divider ── */}
      <div className="my-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-accent/30" fill="currentColor" aria-hidden="true">
          <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.83L18.17 12 12 18.17 5.83 12 12 5.83z" />
        </svg>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* ── Engagement Block (rating + polls + react/share toolbar) ── */}
      <EngagementSection
        slug={slug}
        title={title}
        shareUrl={url}
        pollConfig={pollConfig}
      />

      {/* ── Ambient Audio Player ── */}
      {ambientAudioUrl && <AmbientPlayer audioUrl={ambientAudioUrl} title={title} />}
    </SpoilerProvider>
  );
}
