import { faker } from "@faker-js/faker";
import type { Collection, Article } from "@/types";
import { createSanityImage } from "./article.factory";

const SEASONS = [
  "Spring 2025",
  "Summer 2025",
  "Fall 2025",
  "Winter 2026",
  "Spring 2026",
];
const THEMES = [
  "best-of",
  "underrated",
  "guilty-pleasures",
  "deep-cuts",
  "essentials",
  "seasonal-picks",
];

export function createCollection(
  overrides: Partial<Collection> = {}
): Collection {
  const title = overrides.title || faker.lorem.words({ min: 2, max: 5 });
  return {
    _id: faker.string.uuid(),
    title,
    slug: { current: faker.helpers.slugify(title).toLowerCase() },
    description: faker.lorem.sentences(2),
    heroImage: createSanityImage(title),
    articles: overrides.articles || [],
    season: faker.helpers.arrayElement(SEASONS),
    theme: faker.helpers.arrayElement(THEMES),
    ...overrides,
  };
}

export function createCollections(
  count: number,
  articles: Article[] = []
): Collection[] {
  return Array.from({ length: count }, () => {
    const sliceStart = faker.number.int({
      min: 0,
      max: Math.max(0, articles.length - 3),
    });
    const sliceEnd =
      sliceStart + faker.number.int({ min: 2, max: 6 });
    return createCollection({
      articles: articles.slice(sliceStart, sliceEnd),
    });
  });
}
