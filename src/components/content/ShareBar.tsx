"use client";

import { useState, useCallback } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ShareBarProps {
  title: string;
  url: string;
  category?: string;
  format?: string;
  className?: string;
  layout?: "horizontal" | "vertical";
}

function ShareIcon({ d, label }: { d: string; label: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill="currentColor"
      aria-label={label}
    >
      <path d={d} />
    </svg>
  );
}

export function ShareBar({ title, url, category, format, className, layout = "horizontal" }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `"${title}"${category ? ` — a ${category}${format ? ` ${format}` : ""}` : ""} on The Spidaverse`;

  const shareLinks = [
    {
      name: "X",
      href: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
      icon: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
      label: "Share on X",
    },
    {
      name: "Reddit",
      href: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
      icon: "M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z",
      label: "Share on Reddit",
    },
    {
      name: "Bluesky",
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${shareText} ${url}`)}`,
      icon: "M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.785 2.627 3.59 3.313 6.187 3.028-4.612.5-5.839 2.755-3.32 5.022 5.098 4.59 7.3-1.2 7.842-2.735.162-.458.238-.676.667-.676.43 0 .505.218.667.676.543 1.536 2.744 7.325 7.842 2.735 2.52-2.267 1.292-4.522-3.32-5.022 2.597.285 5.402-.401 6.187-3.028.246-.828.624-5.79.624-6.479 0-.688-.139-1.86-.902-2.203-.66-.299-1.664-.621-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z",
      label: "Share on Bluesky",
    },
  ];

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url });
      } catch {
        // User cancelled or not supported
      }
    }
  }, [title, shareText, url]);

  const isVertical = layout === "vertical";

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        isVertical ? "flex-col" : "flex-row flex-wrap",
        className
      )}
      role="group"
      aria-label="Share this article"
    >
      {shareLinks.map((link) => (
        <ButtonLink
          key={link.name}
          variant="icon"
          size="md"
          shape="icon"
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          title={link.label}
        >
          <ShareIcon d={link.icon} label={link.name} />
        </ButtonLink>
      ))}

      {/* Copy link */}
      <Button
        variant="icon"
        size="md"
        shape="icon"
        onClick={handleCopy}
        aria-label={copied ? "Link copied" : "Copy link"}
        title={copied ? "Copied!" : "Copy link"}
      >
        {copied ? (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        )}
      </Button>

      {/* Native share (mobile) */}
      {"share" in (typeof navigator !== "undefined" ? navigator : {}) && (
        <Button
          variant="icon"
          size="md"
          shape="icon"
          onClick={handleNativeShare}
          className="md:hidden"
          aria-label="Share"
          title="Share"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-6l-4-4m0 0L8 6m4-4v13" />
          </svg>
        </Button>
      )}
    </div>
  );
}
