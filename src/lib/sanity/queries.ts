import { groq } from "next-sanity";

export const articlesQuery = groq`
  *[_type == "article"] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    format,
    excerpt,
    heroImage,
    readingTime,
    mediaType,
    webRating,
    moodTags,
    category->{
      _id, title, slug
    },
    tags[]->{
      _id, title, slug
    }
  }
`;

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    slug,
    format,
    excerpt,
    body,
    heroImage,
    readingTime,
    mediaLength,
    mediaType,
    webRating,
    moodTags,
    ambientAudioUrl,
    category->{
      _id, title, slug
    },
    tags[]->{
      _id, title, slug
    },
    relatedMedia[]->{
      _id, title, mediaType, posterUrl, externalId
    }
  }
`;

export const articlesByCategoryQuery = groq`
  *[_type == "article" && category->slug.current == $category] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    format,
    excerpt,
    heroImage,
    readingTime,
    mediaType,
    webRating,
    category->{
      _id, title, slug
    },
    tags[]->{
      _id, title, slug
    }
  }
`;

export const articlesByTagQuery = groq`
  *[_type == "article" && $tag in tags[]->slug.current] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    format,
    excerpt,
    heroImage,
    readingTime,
    mediaType,
    webRating,
    category->{
      _id, title, slug
    },
    tags[]->{
      _id, title, slug
    }
  }
`;

export const categoriesQuery = groq`
  *[_type == "category"] | order(title asc) {
    _id, title, slug, description
  }
`;

export const tagsQuery = groq`
  *[_type == "tag"] | order(title asc) {
    _id, title, slug
  }
`;

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $category][0] {
    _id, title, slug, description
  }
`;

export const tagBySlugQuery = groq`
  *[_type == "tag" && slug.current == $tag][0] {
    _id, title, slug
  }
`;

// Currently Consuming singleton
export const currentlyConsumingQuery = groq`
  *[_type == "currentlyConsuming"][0] {
    watching,
    playing,
    reading,
    listening
  }
`;

// Media Diary entries
export const mediaDiaryQuery = groq`
  *[_type == "mediaDiary"] | order(startedAt desc) {
    _id,
    _createdAt,
    title,
    mediaType,
    status,
    startedAt,
    completedAt,
    rating,
    notes,
    media->{
      _id, title, mediaType, posterUrl, externalId
    },
    linkedArticle->{
      _id, slug, title
    }
  }
`;

// Collections
export const collectionsQuery = groq`
  *[_type == "collection"] | order(_createdAt desc) {
    _id,
    title,
    slug,
    description,
    heroImage,
    season,
    theme,
    featured,
    "articleCount": count(articles)
  }
`;

export const collectionBySlugQuery = groq`
  *[_type == "collection" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    description,
    heroImage,
    season,
    theme,
    articles[]->{
      _id,
      _createdAt,
      title,
      slug,
      format,
      excerpt,
      heroImage,
      readingTime,
      mediaType,
      webRating,
      category->{ _id, title, slug },
      tags[]->{ _id, title, slug }
    }
  }
`;

// Mood-based articles
export const articlesByMoodQuery = groq`
  *[_type == "article" && $mood in moodTags] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    format,
    excerpt,
    heroImage,
    readingTime,
    mediaType,
    webRating,
    moodTags,
    category->{ _id, title, slug },
    tags[]->{ _id, title, slug }
  }
`;

// All unique mood tags
export const moodTagsQuery = groq`
  array::unique(*[_type == "article" && defined(moodTags)].moodTags[])
`;

// Graph data — articles with relationships (for /the-web)
export const graphDataQuery = groq`
  *[_type == "article"] | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    slug,
    mediaType,
    category->{ _id, title, slug },
    tags[]->{ _id, title, slug },
    relatedMedia[]->{ _id, title, mediaType, posterUrl }
  }
`;
