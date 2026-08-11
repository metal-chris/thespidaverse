"use client";

import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@portabletext/react";
import { SpoilerProvider, RevealAllToggle } from "@/components/content/SpoilerBlock";
import { SourceCitationsProvider } from "@/components/content/SourceLink";
import { ShareBar } from "@/components/content/ShareBar";
import { portableTextComponents } from "@/components/content/PortableTextComponents";

interface StoryBodyProps {
  body?: PortableTextBlock[];
  title: string;
  url: string;
  hasSpoilerBlocks: boolean;
}

export function StoryBody({ body, title, url, hasSpoilerBlocks }: StoryBodyProps) {
  return (
    <SpoilerProvider>
      <SourceCitationsProvider body={body}>
      {hasSpoilerBlocks && (
        <div className="flex justify-end mb-8 pb-4 border-b-2 border-border">
          <RevealAllToggle />
        </div>
      )}

      <div className="article-prose prose prose-lg prose-invert max-w-none prose-headings:text-accent prose-headings:font-bold prose-p:text-foreground prose-a:text-accent prose-a:underline prose-a:decoration-accent/30 hover:prose-a:decoration-accent prose-strong:text-accent prose-blockquote:border-l-2 prose-blockquote:border-accent prose-blockquote:text-muted-foreground prose-blockquote:not-italic prose-blockquote:pl-4 prose-img:rounded-lg prose-hr:border-border prose-li:text-foreground prose-code:text-accent">
        {body && <PortableText value={body} components={portableTextComponents} />}
      </div>

      <div className="my-10 flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-accent/30"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2L2 12l10 10 10-10L12 2zm0 3.83L18.17 12 12 18.17 5.83 12 12 5.83z" />
        </svg>
        <div className="flex-1 h-px bg-border" />
      </div>

      <ShareBar title={title} url={url} layout="horizontal" />
      </SourceCitationsProvider>
    </SpoilerProvider>
  );
}
