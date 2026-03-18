import { faker } from "@faker-js/faker";
import type { MediaEntry, MediaType } from "@/types";

const MEDIA_TYPES: MediaType[] = [
  "movie",
  "tv",
  "game",
  "anime",
  "manga",
  "music",
];

export function createMedia(
  overrides: Partial<MediaEntry> = {}
): MediaEntry {
  const mediaType =
    overrides.mediaType || faker.helpers.arrayElement(MEDIA_TYPES);
  return {
    _id: faker.string.uuid(),
    title: faker.lorem.words({ min: 2, max: 6 }),
    mediaType,
    externalId: faker.string.alphanumeric(8),
    posterUrl: faker.image.urlPicsumPhotos({ width: 300, height: 450 }),
    overview: faker.lorem.paragraph(),
    releaseDate: faker.date
      .between({ from: "2000-01-01", to: new Date() })
      .toISOString()
      .split("T")[0],
    rating: faker.number.int({ min: 0, max: 100 }),
    metadata: {},
    ...overrides,
  };
}

export function createMediaList(
  count: number,
  overrides: Partial<MediaEntry> = {}
): MediaEntry[] {
  return Array.from({ length: count }, () => createMedia(overrides));
}
