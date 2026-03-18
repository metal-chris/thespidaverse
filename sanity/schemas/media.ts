import { defineField, defineType } from "sanity";

export default defineType({
  name: "media",
  title: "Media",
  type: "document",
  description: "Cached external API data (TMDB, IGDB, Spotify, AniList)",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "mediaType",
      title: "Media Type",
      type: "string",
      options: {
        list: [
          { title: "Movie", value: "movie" },
          { title: "TV", value: "tv" },
          { title: "Game", value: "game" },
          { title: "Anime", value: "anime" },
          { title: "Manga", value: "manga" },
          { title: "Music", value: "music" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "externalId",
      title: "External ID",
      type: "string",
      description: "TMDB ID, IGDB ID, Spotify ID, or AniList ID",
    }),
    defineField({
      name: "externalSource",
      title: "External Source",
      type: "string",
      options: {
        list: ["tmdb", "igdb", "spotify", "anilist", "manual"],
      },
    }),
    defineField({
      name: "posterUrl",
      title: "Poster URL",
      type: "url",
    }),
    defineField({
      name: "posterImage",
      title: "Poster Image (Sanity)",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "overview",
      title: "Overview",
      type: "text",
    }),
    defineField({
      name: "releaseDate",
      title: "Release Date",
      type: "date",
    }),
    defineField({
      name: "rating",
      title: "Rating",
      type: "number",
      description: "External rating (e.g. TMDB score)",
    }),
    defineField({
      name: "genres",
      title: "Genres",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "metadata",
      title: "Raw Metadata",
      type: "object",
      fields: [
        defineField({
          name: "json",
          title: "JSON Data",
          type: "text",
          description: "Raw JSON from external API",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "mediaType",
      media: "posterImage",
    },
    prepare({ title, type, media }) {
      return {
        title,
        subtitle: type,
        media,
      };
    },
  },
});
