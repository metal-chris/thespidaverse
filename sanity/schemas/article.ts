import { defineField, defineType } from "sanity";
import { sourceLinkAnnotation } from "./objects/sourceLink";

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
      name: "heroVideo",
      title: "Hero Video",
      type: "object",
      description:
        "Optional hero video. When set, plays at the top of the article and takes priority over the hero image (which becomes the poster).",
      fields: [
        defineField({
          name: "provider",
          title: "Provider",
          type: "string",
          options: {
            list: [
              { title: "YouTube", value: "youtube" },
              { title: "Vimeo", value: "vimeo" },
              { title: "Direct MP4 / WebM URL", value: "mp4" },
            ],
            layout: "radio",
          },
          initialValue: "youtube",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "url",
          title: "Video URL",
          type: "url",
          description:
            "YouTube/Vimeo watch URL (e.g. https://youtube.com/watch?v=…), or a direct MP4/WebM URL",
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
        }),
      ],
      preview: {
        select: { provider: "provider", url: "url" },
        prepare({ provider, url }) {
          return {
            title: provider ? `🎬 ${provider}` : "Hero Video",
            subtitle: url,
          };
        },
      },
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
        {
          type: "object",
          name: "videoEmbed",
          title: "Video Embed",
          icon: () => "🎬",
          fields: [
            defineField({
              name: "provider",
              title: "Provider",
              type: "string",
              options: {
                list: [
                  { title: "YouTube", value: "youtube" },
                  { title: "Vimeo", value: "vimeo" },
                  { title: "Direct MP4 / WebM URL", value: "mp4" },
                ],
                layout: "radio",
              },
              initialValue: "youtube",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "url",
              title: "Video URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "caption",
              title: "Caption",
              type: "string",
            }),
          ],
          preview: {
            select: { provider: "provider", caption: "caption", url: "url" },
            prepare({ provider, caption, url }) {
              return {
                title: caption || `🎬 ${provider || "Video"}`,
                subtitle: url,
              };
            },
          },
        },
        {
          type: "object",
          name: "imageGallery",
          title: "Image Gallery",
          icon: () => "🖼️",
          fields: [
            defineField({
              name: "images",
              title: "Images",
              type: "array",
              of: [
                {
                  type: "image",
                  options: { hotspot: true },
                  fields: [
                    defineField({ name: "alt", title: "Alt Text", type: "string" }),
                    defineField({ name: "caption", title: "Caption", type: "string" }),
                  ],
                },
              ],
              validation: (rule) => rule.min(2).max(12),
            }),
            defineField({
              name: "layout",
              title: "Layout",
              type: "string",
              options: {
                list: [
                  { title: "Grid (auto-fit)", value: "grid" },
                  { title: "Two-column", value: "two-col" },
                  { title: "Three-column", value: "three-col" },
                ],
                layout: "radio",
              },
              initialValue: "grid",
            }),
          ],
          preview: {
            select: { images: "images" },
            prepare({ images }: { images?: unknown[] }) {
              const count = images?.length || 0;
              return { title: `🖼️ Gallery — ${count} image${count === 1 ? "" : "s"}` };
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
              description: 'Optional source — e.g. "Character Name"',
            }),
          ],
          preview: {
            select: { text: "text" },
            prepare({ text }: { text?: string }) {
              return {
                title: text ? `"${text.slice(0, 60)}${text.length > 60 ? "…" : ""}"` : "Pullquote",
              };
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
          { title: "Books", value: "books" },
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
                      { title: "This or That", value: "this_or_that" },
                      { title: "Ranking", value: "ranking" },
                      { title: "Hot Take Meter", value: "hot_take" },
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
                  description:
                    "Custom answer options (multiple choice: any number; this or that: exactly 2)",
                  hidden: ({ parent }) =>
                    parent?.questionType !== "multiple_choice" &&
                    parent?.questionType !== "this_or_that",
                  validation: (rule) =>
                    rule.custom((value, context) => {
                      const parent = context.parent as { questionType?: string };
                      if (
                        parent?.questionType === "this_or_that" &&
                        (!value || value.length !== 2)
                      ) {
                        return "This or That requires exactly 2 options";
                      }
                      return true;
                    }),
                }),
                defineField({
                  name: "rankingItems",
                  title: "Ranking Items",
                  type: "array",
                  of: [{ type: "string" }],
                  description: "Items for readers to rank (3–5 items)",
                  hidden: ({ parent }) =>
                    parent?.questionType !== "ranking",
                  validation: (rule) =>
                    rule.custom((value, context) => {
                      const parent = context.parent as { questionType?: string };
                      if (parent?.questionType === "ranking") {
                        if (!value || value.length < 3)
                          return "Ranking needs at least 3 items";
                        if (value.length > 5)
                          return "Ranking supports at most 5 items";
                      }
                      return true;
                    }),
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
