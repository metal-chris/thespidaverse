"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

interface NewsletterSignupProps {
  variant?: "inline" | "banner";
  className?: string;
}

export function NewsletterSignup({ variant = "inline", className }: NewsletterSignupProps) {
  const t = useTranslations();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage(t("newsletter.successMessage"));
        setEmail("");
        // Brief scale bounce on success
        formRef.current?.classList.add("animate-web-shoot");
        setTimeout(() => formRef.current?.classList.remove("animate-web-shoot"), 400);
      } else {
        setStatus("error");
        setMessage(data.error || t("newsletter.errorDefault"));
      }
    } catch {
      setStatus("error");
      setMessage(t("newsletter.errorNetwork"));
    }
  }

  const isBanner = variant === "banner";

  return (
    <div
      ref={formRef}
      className={cn(
        "relative rounded-xl border overflow-hidden",
        isBanner
          ? "border-accent/20 p-8 md:p-10 text-center"
          : "border-border bg-card p-6",
        className
      )}
    >
      {/* Accent gradient background — banner only */}
      {isBanner && (
        <>
          <div
            className="absolute inset-0 bg-gradient-to-br from-accent/10 via-card to-accent/5"
            aria-hidden="true"
          />
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-accent/8 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/6 blur-3xl"
            aria-hidden="true"
          />
        </>
      )}

      <div className="relative">
        <h3 className={cn("font-bold flex items-center gap-2", isBanner ? "text-2xl mb-2 justify-center" : "text-lg mb-1")}>
          <Mail className="w-5 h-5 text-accent" />
          {t("newsletter.heading")}
        </h3>
        <p className="text-muted-foreground text-sm mb-4">
          {t("newsletter.description")}
        </p>
      </div>

      <div className="relative">
        {status === "success" ? (
          <p className="text-accent font-medium text-sm" role="status" aria-live="polite">
            {message}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className={cn("flex flex-col sm:flex-row gap-2", isBanner ? "max-w-md mx-auto" : "")}>
            <label htmlFor="newsletter-email" className="sr-only">
              {t("newsletter.emailLabel")}
            </label>
            <input
              id="newsletter-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (status === "error") setStatus("idle");
              }}
              placeholder={t("newsletter.emailPlaceholder")}
              required
              disabled={status === "loading"}
              className="flex-1 px-3 py-2.5 text-sm rounded-lg border border-border bg-background/80 backdrop-blur-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              shape="rounded"
              disabled={status === "loading"}
            >
              {status === "loading" ? t("newsletter.submitting") : t("newsletter.submit")}
            </Button>
          </form>
        )}

        {status === "error" && (
          <p className="text-red-500 text-xs mt-2" role="alert">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
