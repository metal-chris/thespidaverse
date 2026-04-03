import { defineField, defineType } from "sanity";

export default defineType({
  name: "mediaDiary",
  title: "Media Diary",
  type: "document",
  description: "Personal media consumption log",
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
          { title: "Books", value: "books" },
          { title: "Music", value: "music" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Watching", value: "watching" },
          { title: "Playing", value: "playing" },
          { title: "Listening", value: "listening" },
          { title: "Reading", value: "reading" },
          { title: "Completed", value: "completed" },
          { title: "Dropped", value: "dropped" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "startedAt",
      title: "Started",
      type: "date",
    }),
    defineField({
      name: "completedAt",
      title: "Completed",
      type: "date",
    }),
    defineField({
      name: "rating",
      title: "Rating (0-100)",
      type: "number",
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: "notes",
      title: "Notes",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "media",
      title: "Linked Media",
      type: "reference",
      to: [{ type: "media" }],
    }),
    defineField({
      name: "linkedArticle",
      title: "Linked Article",
      type: "reference",
      to: [{ type: "article" }],
      description: "Link to review/article about this media",
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "mediaType",
      status: "status",
    },
    prepare({ title, type, status }) {
      return {
        title,
        subtitle: `${type} — ${status}`,
      };
    },
  },
  orderings: [
    {
      title: "Started (Newest)",
      name: "startedDesc",
      by: [{ field: "startedAt", direction: "desc" }],
    },
  ],
});
