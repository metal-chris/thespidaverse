import { defineField, defineType } from "sanity";

export default defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  description: "Seasonal or thematic article collections",
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
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "season",
      title: "Season",
      type: "string",
      description: 'e.g. "Summer 2024", "Holiday 2024"',
    }),
    defineField({
      name: "theme",
      title: "Theme",
      type: "string",
      description: 'e.g. "Best of 2024", "Superhero Month"',
    }),
    defineField({
      name: "articles",
      title: "Articles",
      type: "array",
      of: [{ type: "reference", to: [{ type: "article" }] }],
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
  ],
});
