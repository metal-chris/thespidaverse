"use client";

import { useState, type ReactNode } from "react";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ANALYTICS_PASSWORD;

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  // If no password configured, allow access (dev mode)
  if (!ADMIN_PASSWORD) return <>{children}</>;

  if (authed) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input === ADMIN_PASSWORD) {
            setAuthed(true);
            setError(false);
          } else {
            setError(true);
          }
        }}
        className="w-full max-w-sm space-y-4"
      >
        <h1 className="text-lg font-bold text-foreground text-center">
          The Spidaverse — Admin
        </h1>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
        />
        {error && (
          <p className="text-xs text-red-400 text-center">
            Wrong password. Try again.
          </p>
        )}
        <button
          type="submit"
          className="w-full py-2.5 rounded-lg bg-accent text-background font-semibold hover:opacity-90 transition-opacity"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
