export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatMediaType(type: string): string {
  const labels: Record<string, string> = {
    movie: "Movie",
    tv: "TV",
    game: "Game",
    anime: "Anime",
    books: "Books",
    music: "Music",
  };
  return labels[type] || type;
}

export function capitalizeTag(tag: string): string {
  return tag
    .split(/[-\s]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/** Generate a URL-safe slug from text, with optional index for deduplication. */
export function slugify(text: string, index?: number): string {
  const base = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return index !== undefined ? `${base}-${index}` : base;
}
