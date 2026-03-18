import { faker } from "@faker-js/faker";
import type {
  Article,
  ArticleFormat,
  MediaType,
  SanityImage,
  Category,
  Tag,
} from "@/types";

const FORMATS: ArticleFormat[] = [
  "essay",
  "short-take",
  "ranked-list",
  "roundup",
];
const MEDIA_TYPES: MediaType[] = [
  "movie",
  "tv",
  "game",
  "anime",
  "manga",
  "music",
];
const MOODS = [
  "dark",
  "uplifting",
  "thought-provoking",
  "fun",
  "emotional",
  "intense",
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

/** Use seed-based picsum URLs — these never 404 unlike /id/ URLs */
function createHeroImageUrl(title: string): string {
  const seed = title.replace(/\s+/g, "-").toLowerCase();
  return `https://picsum.photos/seed/${seed}/800/450`;
}

function createCategory(overrides: Partial<Category> = {}): Category {
  const title =
    overrides.title ||
    faker.helpers.arrayElement([
      "Movies & TV",
      "Video Games",
      "Anime & Manga",
      "Music",
    ]);
  return {
    _id: faker.string.uuid(),
    title,
    slug: { current: faker.helpers.slugify(title).toLowerCase() },
    description: faker.lorem.sentence(),
    ...overrides,
  };
}

function createTag(overrides: Partial<Tag> = {}): Tag {
  const title =
    overrides.title ||
    faker.helpers.arrayElement([
      "action",
      "horror",
      "sci-fi",
      "romance",
      "indie",
      "retro",
      "multiplayer",
      "studio-ghibli",
      "shonen",
      "seinen",
      "hip-hop",
      "electronic",
      "ost",
      "thriller",
      "comedy",
      "drama",
      "fantasy",
      "cyberpunk",
      "noir",
    ]);
  return {
    _id: faker.string.uuid(),
    title,
    slug: { current: faker.helpers.slugify(title).toLowerCase() },
    ...overrides,
  };
}

function generatePortableTextBody(): any[] {
  const blockCount = faker.number.int({ min: 3, max: 8 });
  const blocks: any[] = [];
  for (let i = 0; i < blockCount; i++) {
    blocks.push({
      _key: faker.string.alphanumeric(12),
      _type: "block",
      style: i === 0 ? "h2" : "normal",
      children: [
        {
          _key: faker.string.alphanumeric(8),
          _type: "span",
          text: i === 0 ? faker.lorem.sentence() : faker.lorem.paragraph(),
          marks: [],
        },
      ],
      markDefs: [],
    });
  }
  return blocks;
}

function generateMediaLength(mediaType?: MediaType): string | undefined {
  if (!mediaType) return undefined;
  switch (mediaType) {
    case "movie":
      return `${faker.number.int({ min: 80, max: 180 })} min`;
    case "tv":
      return `${faker.number.int({ min: 6, max: 24 })} episodes`;
    case "game":
      return `${faker.number.int({ min: 5, max: 100 })}+ hours`;
    case "anime":
      return `${faker.number.int({ min: 12, max: 50 })} episodes`;
    case "manga":
      return `${faker.number.int({ min: 20, max: 300 })} chapters`;
    case "music":
      return `${faker.number.int({ min: 30, max: 75 })} min`;
    default:
      return undefined;
  }
}

export function createArticle(overrides: Partial<Article> = {}): Article {
  const title = overrides.title || faker.lorem.words({ min: 3, max: 10 });
  const mediaType =
    overrides.mediaType || faker.helpers.arrayElement(MEDIA_TYPES);
  const createdAt =
    overrides._createdAt ||
    faker.date
      .between({ from: "2024-01-01", to: new Date() })
      .toISOString();

  return {
    _id: faker.string.uuid(),
    _createdAt: createdAt,
    _updatedAt: overrides._updatedAt || createdAt,
    title,
    slug: { current: faker.helpers.slugify(title).toLowerCase() },
    format: faker.helpers.arrayElement(FORMATS),
    excerpt: faker.lorem.sentences(2),
    body: generatePortableTextBody(),
    category: createCategory(),
    tags: Array.from(
      { length: faker.number.int({ min: 1, max: 4 }) },
      () => createTag()
    ),
    moodTags: faker.helpers.arrayElements(MOODS, { min: 1, max: 3 }),
    webRating: faker.number.int({ min: 0, max: 100 }),
    heroImage: createSanityImage(title),
    heroImageUrl: createHeroImageUrl(title),
    readingTime: faker.number.int({ min: 3, max: 20 }),
    mediaLength: generateMediaLength(mediaType),
    mediaType,
    ...overrides,
  };
}

export function createArticles(
  count: number,
  overrides: Partial<Article> = {}
): Article[] {
  return Array.from({ length: count }, () => createArticle(overrides));
}

export { createCategory, createTag, createSanityImage, generatePortableTextBody };
