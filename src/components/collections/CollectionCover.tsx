import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { urlFor } from "@/lib/sanity/image";
import { getCollectionTemplate } from "@/lib/collections/template";
import { CategoryPlaceholder } from "@/components/ui/CategoryPlaceholder";
import type { Collection, CollectionTemplate } from "@/types";

interface CollectionCoverProps {
  collection: Collection & { articleCount?: number };
  featured?: boolean;
  index?: number;
}

function formatThemeLabel(theme: string): string {
  return theme
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getImageUrl(collection: CollectionCoverProps["collection"]): string | null {
  if (collection.heroImageUrl) return collection.heroImageUrl;
  if (collection.heroImage) return urlFor(collection.heroImage).width(600).height(900).url() || null;
  return null;
}

/** Template icon — small decorative element per template type */
function TemplateIcon({ template }: { template: CollectionTemplate }) {
  const cls = "w-3.5 h-3.5";
  switch (template) {
    case "poster":
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="currentColor">
          <path d="M2 3a1 1 0 011-1h10a1 1 0 011 1v1H2V3zm0 2h12v7a1 1 0 01-1 1H3a1 1 0 01-1-1V5zm5 1.5v4l3-2-3-2z" />
        </svg>
      );
    case "vinyl":
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="currentColor">
          <path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.895 2.5 2zm9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2z" />
          <path fillRule="evenodd" d="M14 11V2h1v9h-1zM6 3v10H5V3h1z" />
          <path d="M5 2.905a1 1 0 01.9-.995l8-.8a1 1 0 011.1.995V3L6 4V2.905z" />
        </svg>
      );
    case "books":
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="currentColor">
          <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 16 16" className={cls} fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
      );
  }
}

export function CollectionCover({ collection, featured = false, index = 0 }: CollectionCoverProps) {
  const template = getCollectionTemplate(collection.theme);
  const imageUrl = getImageUrl(collection);
  const articleCount = collection.articleCount ?? collection.articles?.length ?? 0;

  return (
    <Link
      href={`/collections/${collection.slug.current}`}
      data-template={template}
      className="group block collection-cover card-tendril-hover collection-cover-enter"
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Cover image */}
      <div className="collection-cover-image">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={collection.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized
          />
        ) : (
          <CategoryPlaceholder className="absolute inset-0" />
        )}

        {/* Gradient overlay */}
        <div className="collection-cover-gradient" />

        {/* Content overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 z-10">
          {/* Badges row */}
          <div className="flex items-center gap-2 mb-1.5">
            {collection.season && (
              <span className="text-[10px] font-semibold text-accent uppercase tracking-wider">
                {collection.season}
              </span>
            )}
            {collection.theme && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider rounded-md bg-white/10 text-white/80 border border-white/15 backdrop-blur-sm">
                <TemplateIcon template={template} />
                {formatThemeLabel(collection.theme)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-bold text-white leading-snug group-hover:text-accent transition-colors ${
              featured ? "text-xl md:text-2xl" : "text-sm md:text-base"
            }`}
          >
            {collection.title}
          </h3>

          {/* Description — featured only */}
          {featured && collection.description && (
            <p className="mt-1 text-xs text-white/75 line-clamp-2">
              {collection.description}
            </p>
          )}

          {/* Article count */}
          <p className="mt-1.5 text-[10px] text-white/50 font-mono">
            {articleCount} {articleCount === 1 ? "article" : "articles"}
          </p>
        </div>
      </div>
    </Link>
  );
}
