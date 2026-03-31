import { defineField, defineType } from "sanity";

export default defineType({
  name: "article",
  title: "Article",
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
      name: "format",
      title: "Format",
      type: "string",
      options: {
        list: [
          { title: "First Bite", value: "first-bite" },
          { title: "The Full Web", value: "the-full-web" },
          { title: "Spin the Block", value: "spin-the-block" },
          { title: "The Sinister Six", value: "the-sinister-six" },
          { title: "The Gauntlet", value: "the-gauntlet" },
          { title: "Versus", value: "versus" },
          { title: "The Daily Bugle", value: "the-daily-bugle" },
          { title: "Spida Sense", value: "spida-sense" },
          { title: "The Web Sling", value: "the-web-sling" },
          { title: "State of the Game", value: "state-of-the-game" },
          { title: "The Rotation", value: "the-rotation" },
          { title: "One Year Later", value: "one-year-later" },
        ],
        layout: "dropdown",
      },
      initialValue: "first-bite",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "series",
      title: "Series / Column",
      type: "string",
      options: {
        list: [
          { title: "Cartoons & Cereal", value: "cartoons-and-cereal" },
        ],
      },
      description:
        "Recurring column this post belongs to (e.g. Cartoons & Cereal for Saturday anime/manga posts)",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      description:
        "Override publish date (for backdating backlog content). Falls back to _createdAt if empty.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Brief summary for cards and SEO",
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
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Link",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "URL",
                  },
                ],
              },
            ],
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
              description: 'e.g. "Major Plot Spoiler", "Ending Spoiler"',
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
      ],
    }),
    defineField({
      name: "spoilerFree",
      title: "Spoiler Free",
      type: "boolean",
      description: "If true, this article contains no spoilers (validated — no spoiler blocks allowed).",
      initialValue: false,
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!value) return true;
          const body = (context.document?.body as Array<{ _type: string }>) || [];
          const hasSpoilers = body.some((block) => block._type === "spoilerBlock");
          return hasSpoilers
            ? "Article is marked spoiler-free but contains spoiler blocks. Remove them or uncheck this."
            : true;
        }),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "reference", to: [{ type: "tag" }] }],
    }),
    defineField({
      name: "moodTags",
      title: "Mood Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
      description: "e.g. hype, chill, nostalgic, emotional, intense",
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
    }),
    defineField({
      name: "webRating",
      title: "Web Rating",
      type: "number",
      description: "Score from 0–100. Fills the spider web SVG.",
      validation: (rule) => rule.min(0).max(100),
    }),
    defineField({
      name: "readingTime",
      title: "Reading Time (min)",
      type: "number",
    }),
    defineField({
      name: "mediaLength",
      title: "Media Length",
      type: "string",
      description: 'e.g. "2h 15m", "12 episodes", "45 chapters"',
    }),
    defineField({
      name: "ambientAudioUrl",
      title: "Ambient Audio URL",
      type: "url",
      description: "URL to ambient audio file for this article",
    }),
    defineField({
      name: "relatedMedia",
      title: "Related Media",
      type: "array",
      of: [{ type: "reference", to: [{ type: "media" }] }],
    }),
    defineField({
      name: "pollConfig",
      title: "Poll Configuration",
      type: "object",
      fields: [
        defineField({
          name: "enableCommunityRating",
          title: "Enable Community Web Rating",
          type: "boolean",
          initialValue: true,
          description:
            "Show the 1-100 community rating slider on this post",
        }),
        defineField({
          name: "pollQuestions",
          title: "Poll Questions",
          type: "array",
          of: [
            {
              type: "object",
              fields: [
                defineField({
                  name: "questionKey",
                  title: "Question Key",
                  type: "string",
                  description:
                    'Machine-readable key (e.g. "have_you_watched")',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "questionText",
                  title: "Question Text",
                  type: "string",
                  description:
                    'What the reader sees (e.g. "Have you watched this?")',
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "questionType",
                  title: "Question Type",
                  type: "string",
                  options: {
                    list: [
                      { title: "Yes / No", value: "yes_no" },
                      {
                        title: "Agree / Disagree / Middle",
                        value: "agree_scale",
                      },
                      { title: "Multiple Choice", value: "multiple_choice" },
                      { title: "Slider (1–10)", value: "slider" },
                    ],
                    layout: "radio",
                  },
                  initialValue: "yes_no",
                  validation: (rule) => rule.required(),
                }),
                defineField({
                  name: "options",
                  title: "Options",
                  type: "array",
                  of: [{ type: "string" }],
                  description: "Custom answer options (for multiple choice)",
                  hidden: ({ parent }) =>
                    parent?.questionType !== "multiple_choice",
                }),
              ],
              preview: {
                select: { text: "questionText", type: "questionType" },
                prepare({ text, type }) {
                  return {
                    title: text || "Untitled question",
                    subtitle: type,
                  };
                },
              },
            },
          ],
          validation: (rule) => rule.max(3),
          description:
            "Add up to 3 quick questions for this post. Keep it lightweight.",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
      format: "format",
      series: "series",
      media: "heroImage",
    },
    prepare({ title, format, series, media }) {
      const parts = [format?.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())];
      if (series) parts.push(series.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()));
      return {
        title,
        subtitle: parts.filter(Boolean).join(" · "),
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
