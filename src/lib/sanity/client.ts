import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

// Allow build to succeed without Sanity configured
export const client = projectId
  ? createClient({
      projectId,
      dataset,
      apiVersion: "2024-01-01",
      useCdn: process.env.NODE_ENV === "production",
    })
  : null;

/**
 * Type-safe fetch wrapper. Returns fallback when Sanity is not configured.
 */
export async function sanityFetch<T>(
  query: string,
  params?: Record<string, string>,
  fallback?: T
): Promise<T> {
  if (!client) return (fallback ?? null) as T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (client as any).fetch(query, params ?? {}) as Promise<T>;
}
