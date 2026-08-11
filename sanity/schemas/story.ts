import { defineField, defineType } from "sanity";
import { sourceLinkAnnotation } from "./objects/sourceLink";

export default defineType({
  name: "story",
  title: "Story",
  type: "document",
  description:
    "Personal narrative / blog post — long-form writing without a Web Rating. Surfaces in the Journal timeline alongside diary entries.",
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
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      description:
        "Date this story appears on the timeline. Falls back to _createdAt if empty.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary shown on the Journal timeline card.",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt Text",
          type: "string",
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
              { title: "Code", value: "code" },
              { title: "Strikethrough", value: "strike-through" },
            ],
            annotations: [sourceLinkAnnotation],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt Text",
              type: "string",
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
        },
        {
          type: "object",
          name: "spoilerBlock",
          title: "Spoiler Block",
          fields: [
            defineField({
              name: "label",
              title: "Spoiler Label",
              type: "string",
              initialValue: "Spoiler",
            }),
            defineField({
              name: "content",
              title: "Spoiler Content",
              type: "array",
              of: [{ type: "block" }],
            }),
          ],
          preview: {
            select: { label: "label" },
            prepare({ label }) {
              return { title: `🕷️ Spoiler: ${label || "Spoiler"}` };
            },
          },
        },
        {
          type: "object",
          name: "pullquote",
          title: "Pullquote",
          icon: () => "❝",
          fields: [
            defineField({
              name: "text",
              title: "Quote Text",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "attribution",
              title: "Attribution",
              type: "string",
            }),
          ],
          preview: {
            select: { text: "text" },
            prepare({ text }: { text?: string }) {
              return {
                title: text
                  ? `"${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"`
                  : "Pullquote",
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
    }),
    defineField({
      name: "mediaType",
      title: "Related Media Type",
      type: "string",
      description: "Optional — surfaces a media-type pill on the timeline card.",
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
    }),
    defineField({
      name: "relatedMedia",
      title: "Related Media",
      type: "array",
      of: [{ type: "reference", to: [{ type: "media" }] }],
    }),
    defineField({
      name: "readingTime",
      title: "Reading Time (min)",
      type: "number",
    }),
    defineField({
      name: "spoilerFree",
      title: "Spoiler Free",
      type: "boolean",
      initialValue: false,
      description:
        "If true, this story contains no spoilers (validated — no spoiler blocks allowed).",
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!value) return true;
          const body =
            (context.document?.body as Array<{ _type: string }>) || [];
          const hasSpoilers = body.some(
            (block) => block._type === "spoilerBlock"
          );
          return hasSpoilers
            ? "Story is marked spoiler-free but contains spoiler blocks. Remove them or uncheck this."
            : true;
        }),
    }),
  ],
  preview: {
    select: {
      title: "title",
      mediaType: "mediaType",
      media: "heroImage",
    },
    prepare({ title, mediaType, media }) {
      return {
        title,
        subtitle: mediaType ? `Story · ${mediaType}` : "Story",
        media,
      };
    },
  },
  orderings: [
    {
      title: "Published (Newest)",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
    {
      title: "Created (Newest)",
      name: "createdDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
});
