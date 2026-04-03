import { defineField, defineType } from "sanity";

export default defineType({
  name: "galleryPiece",
  title: "Gallery Piece",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "pieceType",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Image", value: "image" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "image",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "Single image — or use the Images array below for carousels",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
      hidden: ({ document }) => document?.pieceType === "video",
      validation: (rule) =>
        rule.custom((value, context) => {
          const doc = context.document;
          if (doc?.pieceType === "image" && !value && !(doc?.images as unknown[])?.length) {
            return "Provide either a single image or an images array";
          }
          return true;
        }),
    }),
    defineField({
      name: "images",
      title: "Images (Carousel)",
      type: "array",
      description: "Multiple images for carousel posts. If set, this takes priority over the single image field.",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
          ],
        },
      ],
      hidden: ({ document }) => document?.pieceType === "video",
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "TikTok, YouTube, or YouTube Shorts URL",
      hidden: ({ document }) => document?.pieceType === "image",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (context.document?.pieceType === "video" && !value) {
            return "Video URL is required for video pieces";
          }
          return true;
        }),
    }),
    defineField({
      name: "videoPlatform",
      title: "Video Platform",
      type: "string",
      options: {
        list: [
          { title: "YouTube", value: "youtube" },
          { title: "TikTok", value: "tiktok" },
          { title: "Instagram", value: "instagram" },
        ],
      },
      hidden: ({ document }) => document?.pieceType === "image",
    }),
    defineField({
      name: "videoThumbnail",
      title: "Video Thumbnail",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
      description: "Thumbnail displayed in the gallery grid for video pieces",
      hidden: ({ document }) => document?.pieceType === "image",
    }),
    defineField({
      name: "artistName",
      title: "Artist Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "artistUrl",
      title: "Artist Profile URL",
      type: "url",
      description: "Link to the artist's social media profile",
    }),
    defineField({
      name: "originalUrl",
      title: "Original Post URL",
      type: "url",
      description: "Direct link to the original post",
    }),
    defineField({
      name: "franchise",
      title: "Franchise",
      type: "string",
      options: {
        list: [
          { title: "Spider-Verse", value: "spider-verse" },
          { title: "Venom", value: "venom" },
          { title: "Anime", value: "anime" },
          { title: "Books", value: "books" },
          { title: "Games", value: "games" },
          { title: "Movies", value: "movies" },
          { title: "TV", value: "tv" },
          { title: "Music", value: "music" },
          { title: "Culture", value: "culture" },
          { title: "Other", value: "other" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      description: "Optional caption or context about the piece",
    }),
    defineField({
      name: "isSpotlight",
      title: "Artist Spotlight",
      type: "boolean",
      description: "Feature this piece in the Artist Spotlight section",
      initialValue: false,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      artist: "artistName",
      media: "image",
      videoThumb: "videoThumbnail",
      pieceType: "pieceType",
    },
    prepare({ title, artist, media, videoThumb, pieceType }) {
      return {
        title,
        subtitle: `${pieceType === "video" ? "Video" : "Image"} by ${artist || "Unknown"}`,
        media: media || videoThumb,
      };
    },
  },
  orderings: [
    {
      title: "Published (Newest)",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
});
