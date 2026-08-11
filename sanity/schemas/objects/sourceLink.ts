/**
 * The `link` annotation, shared by the article and story body blocks.
 *
 * Beyond `href` it carries optional source metadata that powers the hover/tap
 * citation card (see docs/SOURCE_TOOLTIP_SPEC.md). Everything past `href` is
 * optional by design: links authored before this existed keep working and
 * simply render without a card.
 *
 * Both schemas import this object so the two can never drift apart.
 */
export const SOURCE_TYPES = [
  { title: "Reporting", value: "reporting" },
  { title: "Interview", value: "interview" },
  { title: "Review / Opinion", value: "review" },
  { title: "Data / Scores", value: "data" },
  { title: "Primary source", value: "primary" },
  { title: "Reference", value: "reference" },
] as const;

export const ACCESS_LEVELS = [
  { title: "Free", value: "free" },
  { title: "Metered", value: "metered" },
  { title: "Paywalled", value: "paywalled" },
] as const;

export const sourceLinkAnnotation = {
  name: "link",
  type: "object",
  title: "Link",
  fields: [
    {
      name: "href",
      type: "url",
      title: "URL",
      validation: (Rule: any) =>
        Rule.uri({ scheme: ["http", "https", "mailto", "tel"], allowRelative: true }),
    },

    // ── Source card ────────────────────────────────────────────────
    // Leave every field below empty for an ordinary link.
    {
      name: "sourceName",
      type: "string",
      title: "Source name",
      description: 'Publication or creator. "Deadline", "@gc50art". Hydratable from og:site_name.',
      fieldset: "source",
    },
    {
      name: "sourceTitle",
      type: "string",
      title: "Source headline",
      description: "Headline of the cited piece. Hydratable from og:title.",
      fieldset: "source",
    },
    {
      name: "context",
      type: "text",
      rows: 4,
      title: "Why this source",
      description:
        "What it says and why it's cited. No length limit — the card scrolls past ~6 lines.",
      fieldset: "source",
    },
    {
      name: "sourceDate",
      type: "date",
      title: "Source date",
      options: { dateFormat: "YYYY-MM-DD" },
      fieldset: "source",
    },
    {
      name: "sourceType",
      type: "string",
      title: "Source type",
      options: { list: [...SOURCE_TYPES] },
      fieldset: "source",
    },
    {
      name: "sourceImage",
      type: "image",
      title: "Source image",
      options: { hotspot: true },
      description:
        "og:image, cover art, poster, or a frame. Aspect decides the card layout automatically.",
      fieldset: "source",
    },
    {
      name: "duration",
      type: "string",
      title: "Duration",
      description: 'Video sources only. "2:38".',
      fieldset: "source",
    },
    {
      name: "access",
      type: "string",
      title: "Access",
      options: { list: [...ACCESS_LEVELS] },
      description: "Warns the reader before they spend a click on a paywall.",
      fieldset: "source",
    },
    {
      name: "archiveUrl",
      type: "url",
      title: "Archive URL",
      description: "Wayback snapshot. Insurance against link rot.",
      fieldset: "source",
    },
    {
      name: "artistCredit",
      type: "string",
      title: "Artist credit",
      description: 'Attribution line under the image. "Art: @gc50art, shared with permission".',
      fieldset: "source",
    },
    {
      name: "spoilerSource",
      type: "boolean",
      title: "Spoiler-adjacent source",
      description:
        "The citation itself spoils something — the card ships covered until the reader reveals it.",
      initialValue: false,
      fieldset: "source",
    },
  ],
  // Collapsed by default: an ordinary link only needs the URL, and the
  // annotation popover is small. Open it when a link deserves a card.
  fieldsets: [
    {
      name: "source",
      title: "Source card (optional)",
      options: { collapsible: true, collapsed: true },
    },
  ],
  preview: {
    select: { title: "sourceName", subtitle: "href" },
    prepare(value: { title?: string; subtitle?: string }) {
      return {
        title: value.title || "Link",
        subtitle: value.subtitle,
      };
    },
  },
};

export default sourceLinkAnnotation;
