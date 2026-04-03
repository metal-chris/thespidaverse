"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function SubmissionForm() {
  const t = useTranslations();
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
          setErrorMessage(data.error || t("common.somethingWentWrong"));
          setStatus("error");
        }
      } catch {
        setErrorMessage(t("common.somethingWentWrong"));
        setStatus("error");
      }
    },
    [pieceType]
  );

  if (status === "success") {
    return (
      <div className="mt-12 p-6 rounded-xl border border-border bg-card text-center">
        <p className="text-lg font-semibold text-accent">{t("gallery.successMessage")}</p>
        <Button
          variant="secondary"
          size="sm"
          shape="rounded"
          onClick={() => { setStatus("idle"); setIsOpen(true); }}
          className="mt-4"
        >
          {t("gallery.submitAnother")}
        </Button>
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
          <h2 className="text-lg font-bold">{t("gallery.submitHeading")}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("gallery.submitDescription")}
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
                  <Button
                    key={type}
                    type="button"
                    variant={pieceType === type ? "primary" : "ghost"}
                    size="sm"
                    shape="rounded"
                    onClick={() => setPieceType(type)}
                  >
                    {type === "image" ? t("gallery.image") : t("gallery.video")}
                  </Button>
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
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  shape="rounded"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? t("gallery.submitting") : t("gallery.submit")}
                </Button>

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
