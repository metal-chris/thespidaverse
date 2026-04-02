import { faker } from "@faker-js/faker";
import type {
  GalleryPiece,
  GalleryPieceType,
  GalleryFranchise,
  VideoPlatform,
  SanityImage,
} from "@/types";

const FRANCHISES: GalleryFranchise[] = [
  "spider-verse",
  "venom",
  "anime",
  "manga",
  "games",
  "movies",
  "tv",
  "music",
  "culture",
  "other",
];

function createSanityImage(alt?: string): SanityImage {
  return {
    _type: "image",
    asset: {
      _ref: `image-${faker.string.alphanumeric(24)}-1200x630-jpg`,
      _type: "reference",
    },
    alt: alt || faker.lorem.sentence(),
  };
}

export function createGalleryPiece(
  overrides: Partial<GalleryPiece> = {}
): GalleryPiece {
  const pieceType: GalleryPieceType =
    overrides.pieceType || faker.helpers.arrayElement(["image", "image", "image", "video"]);
  const title = overrides.title || faker.lorem.words({ min: 2, max: 6 });
  const publishedAt =
    overrides.publishedAt ||
    faker.date
      .between({ from: "2024-06-01", to: new Date() })
      .toISOString();

  return {
    _id: faker.string.uuid(),
    _createdAt: publishedAt,
    title,
    slug: { current: faker.helpers.slugify(title).toLowerCase() },
    pieceType,
    image: pieceType === "image" ? createSanityImage(title) : undefined,
    videoUrl:
      pieceType === "video"
        ? faker.helpers.arrayElement([
            "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            "https://www.tiktok.com/@user/video/1234567890",
          ])
        : undefined,
    videoPlatform:
      pieceType === "video"
        ? faker.helpers.arrayElement<VideoPlatform>(["youtube", "tiktok"])
        : undefined,
    videoThumbnail: pieceType === "video" ? createSanityImage(title) : undefined,
    artistName: overrides.artistName || faker.person.fullName(),
    artistUrl:
      overrides.artistUrl ||
      `https://instagram.com/${faker.internet.username()}`,
    originalUrl:
      overrides.originalUrl ||
      `https://instagram.com/p/${faker.string.alphanumeric(11)}`,
    franchise:
      overrides.franchise || faker.helpers.arrayElement(FRANCHISES),
    description:
      overrides.description ?? faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.6 }) ?? undefined,
    isSpotlight: overrides.isSpotlight ?? false,
    publishedAt,
    ...overrides,
  };
}

export function createGalleryPieces(
  count: number,
  overrides: Partial<GalleryPiece> = {}
): GalleryPiece[] {
  return Array.from({ length: count }, () => createGalleryPiece(overrides));
}
