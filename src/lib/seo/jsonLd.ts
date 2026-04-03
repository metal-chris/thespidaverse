const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thespidaverse.com";

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "The Spidaverse",
    url: siteUrl,
    description:
      "Movies. TV. Games. Anime. Books. Music. One web connects them all.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function blogPostingJsonLd({
  title,
  excerpt,
  url,
  publishedAt,
  modifiedAt,
  imageUrl,
  category,
}: {
  title: string;
  excerpt?: string;
  url: string;
  publishedAt: string;
  modifiedAt?: string;
  imageUrl?: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description: excerpt || "",
    url,
    datePublished: publishedAt,
    ...(modifiedAt && { dateModified: modifiedAt }),
    ...(imageUrl && { image: imageUrl }),
    author: {
      "@type": "Person",
      name: "Spida-Mane",
      url: `${siteUrl}/about`,
    },
    publisher: {
      "@type": "Organization",
      name: "The Spidaverse",
      url: siteUrl,
    },
    ...(category && {
      articleSection: category,
    }),
  };
}

export function reviewJsonLd({
  title,
  url,
  rating,
  itemName,
  itemType = "CreativeWork",
}: {
  title: string;
  url: string;
  rating: number;
  itemName: string;
  itemType?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    name: title,
    url,
    reviewRating: {
      "@type": "Rating",
      ratingValue: rating,
      bestRating: 100,
      worstRating: 0,
    },
    itemReviewed: {
      "@type": itemType,
      name: itemName,
    },
    author: {
      "@type": "Person",
      name: "Spida-Mane",
    },
  };
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
