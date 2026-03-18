import { faker } from "@faker-js/faker";
import type { CurrentlyConsuming } from "@/types";

export function createCurrentlyConsuming(
  overrides: Partial<CurrentlyConsuming> = {}
): CurrentlyConsuming {
  return {
    watching: {
      title: faker.lorem.words({ min: 2, max: 5 }),
      mediaType: faker.helpers.arrayElement(["movie", "tv", "anime"]),
      posterUrl: faker.image.urlPicsumPhotos({ width: 300, height: 450 }),
      externalId: faker.string.alphanumeric(6),
      externalSource: "tmdb",
      progress: `Episode ${faker.number.int({ min: 1, max: 12 })}`,
    },
    playing: {
      title: faker.lorem.words({ min: 2, max: 4 }),
      coverUrl: faker.image.urlPicsumPhotos({ width: 300, height: 300 }),
      externalId: faker.string.alphanumeric(6),
      platform: faker.helpers.arrayElement(["PS5", "PC", "Switch", "Xbox"]),
      progress: `${faker.number.int({ min: 10, max: 90 })}%`,
    },
    reading: {
      title: faker.lorem.words({ min: 2, max: 5 }),
      mediaType: faker.helpers.arrayElement(["manga", "book"]),
      coverUrl: faker.image.urlPicsumPhotos({ width: 300, height: 450 }),
      externalId: faker.string.alphanumeric(6),
      externalSource: "anilist",
      progress: `Chapter ${faker.number.int({ min: 1, max: 200 })}`,
    },
    listening: {
      title: faker.lorem.words({ min: 2, max: 5 }),
      artist: faker.person.fullName(),
      coverUrl: faker.image.urlPicsumPhotos({ width: 300, height: 300 }),
      spotifyUrl: "https://open.spotify.com/track/example",
      useSpotifyLive: false,
    },
    ...overrides,
  };
}

export function createPartialConsuming(): CurrentlyConsuming {
  return createCurrentlyConsuming({
    playing: undefined,
    reading: undefined,
  });
}

export function createEmptyConsuming(): CurrentlyConsuming {
  return {
    watching: undefined,
    playing: undefined,
    reading: undefined,
    listening: undefined,
  };
}
