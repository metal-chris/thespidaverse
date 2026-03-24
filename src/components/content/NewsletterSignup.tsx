"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";

type Status = "idle" | "loading" | "success" | "error";

interface NewsletterSignupProps {
  variant?: "inline" | "banner";
  className?: string;
}

export function NewsletterSignup({ variant = "inline", className }: NewsletterSignupProps) {
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
        setMessage("You're in! Check your email to confirm.");
        setEmail("");
        // Brief scale bounce on success
        formRef.current?.classList.add("animate-web-shoot");
        setTimeout(() => formRef.current?.classList.remove("animate-web-shoot"), 400);
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong. Try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  const isBanner = variant === "banner";

  return (
    <div
      ref={formRef}
      className={cn(
        "rounded-lg border border-border",
        isBanner ? "bg-muted p-8 text-center" : "bg-card p-6",
        className
      )}
    >
      <h3 className={cn("font-bold", isBanner ? "text-2xl mb-2" : "text-lg mb-1")}>
        Join the Web
      </h3>
      <p className="text-muted-foreground text-sm mb-4">
        Get new articles delivered straight to your inbox. No spam, just vibes.
      </p>

      {status === "success" ? (
        <p className="text-accent font-medium text-sm" role="status" aria-live="polite">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className={cn("flex flex-col sm:flex-row gap-2", isBanner ? "max-w-md mx-auto" : "")}>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            placeholder="your@email.com"
            required
            disabled={status === "loading"}
            className="flex-1 px-3 py-2 text-sm rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-4 py-2 text-sm font-medium bg-accent text-background rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            {status === "loading" ? "..." : "Get Caught Up"}
          </button>
        </form>
      )}

      {status === "error" && (
        <p className="text-red-500 text-xs mt-2" role="alert">
          {message}
        </p>
      )}
    </div>
  );
}
