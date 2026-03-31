import { faker } from "@faker-js/faker";
import type {
  Article,
  ArticleFormat,
  MediaType,
  SanityImage,
  Category,
  Tag,
  PollConfig,
} from "@/types";

const FORMATS: ArticleFormat[] = [
  "first-bite",
  "the-full-web",
  "spin-the-block",
  "the-sinister-six",
  "the-gauntlet",
  "versus",
  "the-daily-bugle",
  "spida-sense",
  "the-web-sling",
  "state-of-the-game",
  "the-rotation",
  "one-year-later",
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
      "Movies",
      "TV",
      "Video Games",
      "Anime",
      "Manga",
      "Music",
      "Culture",
      "Tech",
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

// ─── Rich body helpers ─────────────────────────────────────────────────

function k() { return faker.string.alphanumeric(12); }

function textBlock(
  text: string,
  style: "normal" | "h2" | "h3" | "blockquote" = "normal",
  marks?: { text: string; mark: string }[],
): any {
  if (marks && marks.length > 0) {
    const markDefs: any[] = [];
    const children: any[] = [];
    let remaining = text;
    for (const m of marks) {
      const idx = remaining.indexOf(m.text);
      if (idx === -1) continue;
      if (idx > 0) {
        children.push({ _key: k(), _type: "span", text: remaining.slice(0, idx), marks: [] });
      }
      if (m.mark === "link") {
        const defKey = k();
        markDefs.push({ _key: defKey, _type: "link", href: "https://example.com" });
        children.push({ _key: k(), _type: "span", text: m.text, marks: [defKey] });
      } else {
        children.push({ _key: k(), _type: "span", text: m.text, marks: [m.mark] });
      }
      remaining = remaining.slice(idx + m.text.length);
    }
    if (remaining) children.push({ _key: k(), _type: "span", text: remaining, marks: [] });
    return { _key: k(), _type: "block", style, children, markDefs };
  }
  return {
    _key: k(), _type: "block", style,
    children: [{ _key: k(), _type: "span", text, marks: [] }],
    markDefs: [],
  };
}

function imageBlock(seed: string, alt: string, caption?: string): any {
  return {
    _key: k(), _type: "image",
    asset: { _ref: `image-mock-${seed}-1200x630-jpg`, _type: "reference" },
    alt,
    caption,
    // Mock-only: direct URL for rendering without Sanity CDN
    mockUrl: `https://picsum.photos/seed/${seed}/800/450`,
  };
}

function spoilerBlock(label: string, text: string): any {
  return {
    _key: k(), _type: "spoilerBlock",
    label,
    content: [textBlock(text)],
  };
}

/** Generates a rich Portable Text body from structured sections */
function generateRichBody(sections: {
  heading?: string;
  paragraphs: string[];
  image?: { seed: string; alt: string; caption?: string };
  spoiler?: { label: string; text: string };
  marks?: { text: string; mark: string }[];
}[]): any[] {
  const blocks: any[] = [];
  for (const section of sections) {
    if (section.heading) {
      blocks.push(textBlock(section.heading, "h2"));
    }
    for (let i = 0; i < section.paragraphs.length; i++) {
      const p = section.paragraphs[i];
      blocks.push(textBlock(p, "normal", i === 0 ? section.marks : undefined));
    }
    if (section.image) {
      blocks.push(imageBlock(section.image.seed, section.image.alt, section.image.caption));
    }
    if (section.spoiler) {
      blocks.push(spoilerBlock(section.spoiler.label, section.spoiler.text));
    }
  }
  return blocks;
}

/** Fallback: generates a basic body with lorem text (for articles without hand-crafted body) */
function generatePortableTextBody(): any[] {
  const blockCount = faker.number.int({ min: 3, max: 8 });
  const blocks: any[] = [];
  for (let i = 0; i < blockCount; i++) {
    blocks.push({
      _key: k(),
      _type: "block",
      style: i === 0 ? "h2" : "normal",
      children: [
        {
          _key: k(),
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

const POLL_PRESETS: PollConfig[] = [
  {
    enableCommunityRating: true,
    pollQuestions: [
      { questionKey: "have_you_watched", questionText: "Have you watched this?", questionType: "yes_no" },
      { questionKey: "would_recommend", questionText: "Would you recommend it?", questionType: "yes_no" },
    ],
  },
  {
    enableCommunityRating: true,
    pollQuestions: [
      { questionKey: "agree", questionText: "Do you agree with this take?", questionType: "agree_scale" },
      { questionKey: "hot_take", questionText: "Is this actually a hot take?", questionType: "multiple_choice", options: ["Hot take", "Lukewarm", "Everyone thinks this"] },
    ],
  },
  {
    enableCommunityRating: true,
    pollQuestions: [
      { questionKey: "saturday_vibe", questionText: "Is this a Saturday morning vibe?", questionType: "multiple_choice", options: ["Perfect for it", "More of a late night watch", "Anytime show"] },
      { questionKey: "have_you_seen", questionText: "Have you seen this?", questionType: "multiple_choice", options: ["Yes", "No", "Adding it to my list"] },
    ],
  },
  {
    enableCommunityRating: true,
    pollQuestions: [
      { questionKey: "changed_perspective", questionText: "Did this change your perspective?", questionType: "agree_scale" },
      { questionKey: "enjoyment", questionText: "How much did you enjoy this?", questionType: "slider" },
    ],
  },
];

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
    pollConfig: faker.helpers.arrayElement(POLL_PRESETS),
    ...overrides,
  };
}

export function createArticles(
  count: number,
  overrides: Partial<Article> = {}
): Article[] {
  return Array.from({ length: count }, () => createArticle(overrides));
}

export { createCategory, createTag, createSanityImage, generatePortableTextBody, generateRichBody };
