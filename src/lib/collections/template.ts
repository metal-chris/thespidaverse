import type { CollectionTemplate } from "@/types";

const THEME_TO_TEMPLATE: Record<string, CollectionTemplate> = {
  "best-of": "poster",
  essentials: "poster",
  "seasonal-picks": "poster",
  "guilty-pleasures": "vinyl",
  "deep-cuts": "vinyl",
  underrated: "manga",
};

/** Derive a visual template from the collection's theme field. */
export function getCollectionTemplate(theme?: string): CollectionTemplate {
  if (!theme) return "default";
  return THEME_TO_TEMPLATE[theme] ?? "default";
}

const TEMPLATE_ASPECTS: Record<CollectionTemplate, string> = {
  poster: "2/3",
  vinyl: "1/1",
  manga: "3/4",
  default: "4/5",
};

/** CSS aspect-ratio value for a template's cover card. */
export function getTemplateAspect(template: CollectionTemplate): string {
  return TEMPLATE_ASPECTS[template];
}

const ARTICLES_LABELS: Record<CollectionTemplate, string> = {
  poster: "Credits",
  vinyl: "Tracklist",
  manga: "Chapters",
  default: "Articles",
};

/** Contextual heading for the article list on the detail page. */
export function getArticlesLabel(template: CollectionTemplate): string {
  return ARTICLES_LABELS[template];
}

const NUMBER_PREFIXES: Record<CollectionTemplate, string> = {
  poster: "",
  vinyl: "Track",
  manga: "Ch.",
  default: "",
};

/** Prefix for numbered article entries (e.g. "Track 1", "Ch. 3"). */
export function getArticleNumberPrefix(template: CollectionTemplate): string {
  return NUMBER_PREFIXES[template];
}
