import { faker } from "@faker-js/faker";
import type { MediaDiaryEntry, MediaType } from "@/types";

const STATUSES: MediaDiaryEntry["status"][] = [
  "watching",
  "playing",
  "listening",
  "reading",
  "completed",
  "dropped",
];
const MEDIA_TYPES: MediaType[] = [
  "movie",
  "tv",
  "game",
  "anime",
  "manga",
  "music",
];

export function createJournalEntry(
  overrides: Partial<MediaDiaryEntry> = {}
): MediaDiaryEntry {
  const status =
    overrides.status || faker.helpers.arrayElement(STATUSES);
  const startedAt =
    overrides.startedAt ||
    faker.date
      .between({ from: "2024-06-01", to: new Date() })
      .toISOString()
      .split("T")[0];

  return {
    _id: faker.string.uuid(),
    _createdAt: overrides._createdAt || startedAt,
    title: faker.lorem.words({ min: 2, max: 6 }),
    mediaType: faker.helpers.arrayElement(MEDIA_TYPES),
    status,
    startedAt,
    completedAt: ["completed", "dropped"].includes(status)
      ? faker.date
          .between({ from: startedAt, to: new Date() })
          .toISOString()
          .split("T")[0]
      : undefined,
    rating:
      status === "completed"
        ? faker.number.int({ min: 20, max: 100 })
        : undefined,
    notes: faker.datatype.boolean({ probability: 0.7 })
      ? faker.lorem.sentences(2)
      : undefined,
    ...overrides,
  };
}

export function createJournalEntries(
  count: number,
  overrides: Partial<MediaDiaryEntry> = {}
): MediaDiaryEntry[] {
  return Array.from({ length: count }, () =>
    createJournalEntry(overrides)
  );
}
