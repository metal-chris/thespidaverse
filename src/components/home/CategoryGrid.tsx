"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CATEGORY_CONFIG, DEFAULT_CATEGORY } from "@/lib/categories";

interface CategoryDef {
  titleKey: string;
  configTitle: string;
  href: string;
}

const primaryCategories: CategoryDef[] = [
  { titleKey: "categories.movies", configTitle: "Movies", href: "/category/movies" },
  { titleKey: "categories.videoGames", configTitle: "Video Games", href: "/category/video-games" },
  { titleKey: "categories.anime", configTitle: "Anime", href: "/category/anime" },
  { titleKey: "categories.culture", configTitle: "Culture", href: "/category/culture" },
];

const secondaryCategories: CategoryDef[] = [
  { titleKey: "categories.tv", configTitle: "TV", href: "/category/tv" },
  { titleKey: "categories.tech", configTitle: "Tech", href: "/category/tech" },
  { titleKey: "categories.books", configTitle: "Books", href: "/category/books" },
  { titleKey: "categories.music", configTitle: "Music", href: "/category/music" },
];

function cfg(configTitle: string) {
  return CATEGORY_CONFIG[configTitle] || DEFAULT_CATEGORY;
}

// Paired columns: primary[i] stacks on top of secondary[i]
const pairs = primaryCategories.map((primary, i) => ({
  primary,
  secondary: secondaryCategories[i],
}));

export function CategoryGrid() {
  const t = useTranslations();

  return (
    <>
      {/* Mobile: 2-column grid, each column = primary stacked on secondary */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {pairs.map(({ primary, secondary }) => {
          const pc = cfg(primary.configTitle);
          const sc = cfg(secondary.configTitle);
          const PIcon = pc.icon;
          const SIcon = sc.icon;
          return (
            <div key={primary.configTitle} className="flex flex-col gap-1">
              <Link
                href={primary.href}
                className={`group relative rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 ${pc.borderHover} overflow-hidden flex flex-col items-center justify-center text-center`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${pc.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  aria-hidden="true"
                />
                <div className="relative flex flex-col items-center gap-2">
                  <PIcon className={`w-7 h-7 ${pc.iconColor}`} strokeWidth={1.5} />
                  <h3 className={`font-bold text-card-foreground text-sm ${pc.titleHover} transition-colors`}>
                    {t(primary.titleKey)}
                  </h3>
                </div>
              </Link>
              <Link
                href={secondary.href}
                className={`group relative rounded-lg border border-border bg-card px-4 py-2.5 transition-all duration-300 hover:shadow-md hover:shadow-accent/5 ${sc.borderHover} overflow-hidden flex items-center justify-center gap-2.5`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${sc.gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-300`}
                  aria-hidden="true"
                />
                <SIcon className={`relative w-4 h-4 ${sc.iconColor} shrink-0`} strokeWidth={1.5} />
                <span className={`relative text-xs font-semibold text-card-foreground ${sc.titleHover} transition-colors`}>
                  {t(secondary.titleKey)}
                </span>
              </Link>
            </div>
          );
        })}
      </div>

      {/* Desktop: two-tier layout (4 primary row + 4 secondary row) */}
      <div className="hidden md:flex md:flex-col md:gap-1.5">
        <div className="grid grid-cols-4 gap-3">
          {primaryCategories.map((cat) => {
            const c = cfg(cat.configTitle);
            const Icon = c.icon;
            return (
              <Link
                key={cat.configTitle}
                href={cat.href}
                className={`group relative rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 ${c.borderHover} overflow-hidden flex flex-col items-center justify-center text-center`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                  aria-hidden="true"
                />
                <div className="relative flex flex-col items-center gap-2">
                  <Icon className={`w-7 h-7 ${c.iconColor}`} strokeWidth={1.5} />
                  <h3 className={`font-bold text-card-foreground text-sm ${c.titleHover} transition-colors`}>
                    {t(cat.titleKey)}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {secondaryCategories.map((cat) => {
            const c = cfg(cat.configTitle);
            const Icon = c.icon;
            return (
              <Link
                key={cat.configTitle}
                href={cat.href}
                className={`group relative rounded-lg border border-border bg-card px-4 py-2.5 transition-all duration-300 hover:shadow-md hover:shadow-accent/5 ${c.borderHover} overflow-hidden flex items-center justify-center gap-2.5`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-300`}
                  aria-hidden="true"
                />
                <Icon className={`relative w-4 h-4 ${c.iconColor} shrink-0`} strokeWidth={1.5} />
                <span className={`relative text-xs font-semibold text-card-foreground ${c.titleHover} transition-colors`}>
                  {t(cat.titleKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
