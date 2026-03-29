"use client";

import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import { WebRating } from "@/components/content/WebRating";
import { ShareBar } from "@/components/content/ShareBar";
import { SpoilerProvider, RevealAllToggle } from "@/components/content/SpoilerBlock";
import { NewsletterSignup } from "@/components/content/NewsletterSignup";
import { ReactionBar } from "@/components/reactions/ReactionBar";
import { ScrollProgress } from "@/components/ui/ScrollProgress";
import { AmbientPlayer } from "@/components/audio/AmbientPlayer";
import { portableTextComponents } from "@/components/content/PortableTextComponents";

interface ArticleBodyProps {
  body: PortableTextBlock[];
  webRating?: number;
  title: string;
  slug: string;
  url: string;
  category?: string;
  format?: string;
  hasSpoilerBlocks: boolean;
  ambientAudioUrl?: string;
}


export function ArticleBody({
  body,
  webRating,
  title,
  slug,
  url,
  category,
  format,
  hasSpoilerBlocks,
  ambientAudioUrl,
}: ArticleBodyProps) {
  return (
    <SpoilerProvider>
      {/* ── Controls Bar ── */}
      {hasSpoilerBlocks && (
        <div className="flex justify-end mb-8 pb-4 border-b-2 border-border">
          <RevealAllToggle />
        </div>
      )}

      {/* ── Web Rating Block ── */}
      {webRating != null && (
        <div className="mb-10 rounded-xl border border-border bg-card/50 relative overflow-hidden">
          <WebRating score={webRating} variant="full" />
        </div>
      )}

      {/* ── Article Body ── */}
      <div className="article-prose prose prose-lg max-w-none prose-headings:text-foreground prose-headings:font-bold prose-p:text-foreground/90 prose-a:text-accent prose-a:underline prose-a:decoration-accent/30 hover:prose-a:decoration-accent prose-strong:text-foreground prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:pl-4 prose-img:rounded-lg prose-hr:border-border">
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

      {/* ── Reactions + Share (combined on tablet+) ── */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              What did you think?
            </p>
            <ReactionBar slug={slug} />
          </div>
          <div className="hidden md:flex md:flex-col md:items-end">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Share
            </p>
            <ShareBar title={title} url={url} category={category} format={format} />
          </div>
        </div>
      </div>

      {/* ── Bottom Share Bar (mobile only) ── */}
      <div className="pt-4 border-t-2 border-border md:hidden mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Share
        </p>
        <ShareBar title={title} url={url} category={category} format={format} />
      </div>

      {/* ── Newsletter Signup ── */}
      <NewsletterSignup variant="inline" className="mt-4" />

      {/* ── Ambient Audio Player ── */}
      {ambientAudioUrl && <AmbientPlayer audioUrl={ambientAudioUrl} title={title} />}
    </SpoilerProvider>
  );
}
