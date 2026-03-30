/**
 * Shared IP hashing utility for engagement deduplication.
 * Uses SHA-256 — same approach as article reactions.
 */
export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Extract client IP from request headers (Netlify / Vercel / generic).
 */
export function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  );
}

/**
 * Validate honeypot field — returns true if the submission is likely a bot.
 */
export function isBot(honeypot: unknown): boolean {
  return typeof honeypot === "string" && honeypot.length > 0;
}
