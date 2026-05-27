import { createClient, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_WRITE_TOKEN;

/**
 * Server-only write-enabled Sanity client. Never import from a client
 * component — the SANITY_WRITE_TOKEN must stay server-side.
 *
 * Returns null when projectId or token is missing (so build doesn't fail
 * in environments without Sanity configured).
 */
export const writeClient: SanityClient | null =
  projectId && token
    ? createClient({
        projectId,
        dataset,
        apiVersion: "2024-01-01",
        token,
        useCdn: false,
      })
    : null;
