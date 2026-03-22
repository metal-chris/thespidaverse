"use client";

import { useState, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

export function SubmissionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pieceType, setPieceType] = useState<"image" | "video">("image");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setStatus("submitting");
      setErrorMessage("");

      const formData = new FormData(e.currentTarget);
      const body = {
        title: formData.get("title"),
        artist_name: formData.get("artist_name"),
        artist_url: formData.get("artist_url") || undefined,
        piece_type: pieceType,
        image_url: pieceType === "image" ? formData.get("media_url") : undefined,
        video_url: pieceType === "video" ? formData.get("media_url") : undefined,
        description: formData.get("description") || undefined,
        submitter_email: formData.get("submitter_email") || undefined,
      };

      try {
        const res = await fetch("/api/gallery/submissions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (res.ok) {
          setStatus("success");
        } else {
          const data = await res.json();
          setErrorMessage(data.error || "Something went wrong");
          setStatus("error");
        }
      } catch {
        setErrorMessage("Failed to submit. Please try again.");
        setStatus("error");
      }
    },
    [pieceType]
  );

  if (status === "success") {
    return (
      <div className="mt-12 p-6 rounded-xl border border-border bg-card text-center">
        <p className="text-lg font-semibold text-accent">Submission Received!</p>
        <p className="text-sm text-muted-foreground mt-1">
          We&apos;ll review your submission and add it to the Gallery if it&apos;s a fit. Thanks for contributing!
        </p>
        <button
          onClick={() => { setStatus("idle"); setIsOpen(true); }}
          className="mt-4 px-4 py-2 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
        >
          Submit Another
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="mt-12 rounded-xl border border-border bg-card overflow-hidden">
      {/* CTA header — always visible */}
      <button
        onClick={() => {
          const opening = !isOpen;
          setIsOpen(opening);
          if (opening) {
            setTimeout(() => {
              containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 50);
          }
        }}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-muted/30 transition-colors"
      >
        <div>
          <h2 className="text-lg font-bold">Submit Art</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Know a piece that belongs in the Gallery? Send it our way.
          </p>
        </div>
        <svg
          viewBox="0 0 24 24"
          className={cn(
            "w-5 h-5 text-muted-foreground shrink-0 ml-4 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expandable form */}
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-6 pt-4 border-t border-border">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Piece type toggle */}
              <div>
                <p className="text-xs text-muted-foreground mb-4">
                  All submissions are reviewed before publishing.
                </p>
                <div className="flex gap-2">
                {(["image", "video"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPieceType(type)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      pieceType === type
                        ? "bg-accent text-background"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                  >
                    {type === "image" ? "Art" : "Video"}
                  </button>
                ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="title"
                  type="text"
                  placeholder="Title of the piece"
                  required
                  className="px-3 py-2.5 rounded-lg bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                />
                <input
                  name="artist_name"
                  type="text"
                  placeholder="Artist name"
                  required
                  className="px-3 py-2.5 rounded-lg bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="media_url"
                  type="url"
                  placeholder={pieceType === "image" ? "Link to the image" : "Video URL (TikTok, YouTube)"}
                  required
                  className="px-3 py-2.5 rounded-lg bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                />
                <input
                  name="artist_url"
                  type="url"
                  placeholder="Artist profile URL (optional)"
                  className="px-3 py-2.5 rounded-lg bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent"
                />
              </div>

              <textarea
                name="description"
                placeholder="Anything else we should know? (optional)"
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent resize-none"
              />

              <div className="flex items-center gap-4">
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="px-6 py-2.5 rounded-lg bg-accent text-background font-medium text-sm hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? "Submitting..." : "Submit"}
                </button>

                {status === "error" && errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
