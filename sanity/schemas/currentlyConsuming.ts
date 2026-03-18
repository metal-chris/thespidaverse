import { defineField, defineType } from "sanity";

export default defineType({
  name: "currentlyConsuming",
  title: "Currently Consuming",
  type: "document",
  description: "What Spida is currently watching, playing, reading, and listening to. Only one document of this type should exist.",
  fields: [
    defineField({
      name: "watching",
      title: "Currently Watching",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "mediaType", title: "Type", type: "string", options: { list: [{ title: "Movie", value: "movie" }, { title: "TV", value: "tv" }, { title: "Anime", value: "anime" }] } }),
        defineField({ name: "posterUrl", title: "Poster URL", type: "url" }),
        defineField({ name: "externalId", title: "External ID", type: "string", description: "TMDB or AniList ID" }),
        defineField({ name: "externalSource", title: "Source", type: "string", options: { list: ["tmdb", "anilist"] } }),
        defineField({ name: "progress", title: "Progress", type: "string", description: 'e.g. "S2 E5", "Episode 12"' }),
      ],
    }),
    defineField({
      name: "playing",
      title: "Currently Playing",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "coverUrl", title: "Cover URL", type: "url" }),
        defineField({ name: "externalId", title: "IGDB ID", type: "string" }),
        defineField({ name: "platform", title: "Platform", type: "string", description: 'e.g. "PS5", "PC", "Switch"' }),
        defineField({ name: "progress", title: "Progress", type: "string", description: 'e.g. "Chapter 5", "45 hours"' }),
      ],
    }),
    defineField({
      name: "reading",
      title: "Currently Reading",
      type: "object",
      fields: [
        defineField({ name: "title", title: "Title", type: "string" }),
        defineField({ name: "mediaType", title: "Type", type: "string", options: { list: [{ title: "Manga", value: "manga" }, { title: "Comic", value: "comic" }, { title: "Book", value: "book" }] } }),
        defineField({ name: "coverUrl", title: "Cover URL", type: "url" }),
        defineField({ name: "externalId", title: "External ID", type: "string" }),
        defineField({ name: "externalSource", title: "Source", type: "string", options: { list: ["anilist", "manual"] } }),
        defineField({ name: "progress", title: "Progress", type: "string", description: 'e.g. "Vol 3 Ch 22", "Issue #45"' }),
      ],
    }),
    defineField({
      name: "listening",
      title: "Currently Listening",
      type: "object",
      description: "This is auto-populated from Spotify Now Playing, but can be overridden.",
      fields: [
        defineField({ name: "title", title: "Album/Track", type: "string" }),
        defineField({ name: "artist", title: "Artist", type: "string" }),
        defineField({ name: "coverUrl", title: "Cover URL", type: "url" }),
        defineField({ name: "spotifyUrl", title: "Spotify URL", type: "url" }),
        defineField({ name: "useSpotifyLive", title: "Use Live Spotify", type: "boolean", initialValue: true, description: "When enabled, auto-pulls from Spotify Now Playing API instead of manual entry" }),
      ],
    }),
    defineField({
      name: "updatedAt",
      title: "Last Updated",
      type: "datetime",
      description: "Auto-set when you save",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Currently Consuming" };
    },
  },
});
