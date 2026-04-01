import Link from "next/link";
import { CATEGORY_CONFIG, DEFAULT_CATEGORY } from "@/lib/categories";

interface CategoryDef {
  title: string;
  href: string;
}

const primaryCategories: CategoryDef[] = [
  { title: "Movies", href: "/category/movies" },
  { title: "Video Games", href: "/category/video-games" },
  { title: "Anime", href: "/category/anime" },
  { title: "Culture", href: "/category/culture" },
];

const secondaryCategories: CategoryDef[] = [
  { title: "TV", href: "/category/tv" },
  { title: "Tech", href: "/category/tech" },
  { title: "Manga", href: "/category/manga" },
  { title: "Music", href: "/category/music" },
];

function cfg(title: string) {
  return CATEGORY_CONFIG[title] || DEFAULT_CATEGORY;
}

// Paired columns: primary[i] stacks on top of secondary[i]
const pairs = primaryCategories.map((primary, i) => ({
  primary,
  secondary: secondaryCategories[i],
}));

export function CategoryGrid() {
  return (
    <>
      {/* Mobile: 2-column grid, each column = primary stacked on secondary */}
      <div className="grid grid-cols-2 gap-3 md:hidden">
        {pairs.map(({ primary, secondary }) => {
          const pc = cfg(primary.title);
          const sc = cfg(secondary.title);
          const PIcon = pc.icon;
          const SIcon = sc.icon;
          return (
            <div key={primary.title} className="flex flex-col gap-1">
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
                    {primary.title}
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
                  {secondary.title}
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
            const c = cfg(cat.title);
            const Icon = c.icon;
            return (
              <Link
                key={cat.title}
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
                    {cat.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {secondaryCategories.map((cat) => {
            const c = cfg(cat.title);
            const Icon = c.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className={`group relative rounded-lg border border-border bg-card px-4 py-2.5 transition-all duration-300 hover:shadow-md hover:shadow-accent/5 ${c.borderHover} overflow-hidden flex items-center justify-center gap-2.5`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${c.gradient} opacity-40 group-hover:opacity-80 transition-opacity duration-300`}
                  aria-hidden="true"
                />
                <Icon className={`relative w-4 h-4 ${c.iconColor} shrink-0`} strokeWidth={1.5} />
                <span className={`relative text-xs font-semibold text-card-foreground ${c.titleHover} transition-colors`}>
                  {cat.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
