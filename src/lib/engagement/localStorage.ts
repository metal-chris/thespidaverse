"use client";

const STORAGE_KEY = "spidaverse-engagement";

interface EngagementRecord {
  webRating?: number;
  polls?: Record<string, string>; // questionKey → answer
}

function getStore(): Record<string, EngagementRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStore(store: Record<string, EngagementRecord>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Private browsing or quota exceeded — degrade gracefully
  }
}

/** Check if the user already submitted a web rating for this article. */
export function hasRated(slug: string): number | null {
  const record = getStore()[slug];
  return record?.webRating ?? null;
}

/** Mark that the user submitted a web rating. */
export function markRated(slug: string, score: number) {
  const store = getStore();
  store[slug] = { ...store[slug], webRating: score };
  setStore(store);
}

/** Check if the user already answered a specific poll question. */
export function hasAnswered(slug: string, questionKey: string): string | null {
  const record = getStore()[slug];
  return record?.polls?.[questionKey] ?? null;
}

/** Mark that the user answered a poll question. */
export function markAnswered(slug: string, questionKey: string, answer: string) {
  const store = getStore();
  const existing = store[slug] || {};
  store[slug] = {
    ...existing,
    polls: { ...existing.polls, [questionKey]: answer },
  };
  setStore(store);
}
