import Link from "next/link";
import {
  Clapperboard,
  Gamepad2,
  Sparkles,
  Globe,
  Tv,
  Cpu,
  BookOpenText,
  Music,
  type LucideIcon,
} from "lucide-react";

interface CategoryDef {
  title: string;
  href: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
  borderHover: string;
  titleHover: string;
}

const primaryCategories: CategoryDef[] = [
  {
    title: "Movies",
    icon: Clapperboard,
    href: "/category/movies",
    color: "from-red-500/20 to-red-500/5",
    iconColor: "text-red-400",
    borderHover: "hover:border-red-500/40",
    titleHover: "group-hover:text-red-400",
  },
  {
    title: "Video Games",
    icon: Gamepad2,
    href: "/category/video-games",
    color: "from-blue-500/20 to-blue-500/5",
    iconColor: "text-blue-400",
    borderHover: "hover:border-blue-500/40",
    titleHover: "group-hover:text-blue-400",
  },
  {
    title: "Anime",
    icon: Sparkles,
    href: "/category/anime",
    color: "from-amber-500/20 to-amber-500/5",
    iconColor: "text-amber-400",
    borderHover: "hover:border-amber-500/40",
    titleHover: "group-hover:text-amber-400",
  },
  {
    title: "Culture",
    icon: Globe,
    href: "/category/culture",
    color: "from-purple-500/20 to-purple-500/5",
    iconColor: "text-purple-400",
    borderHover: "hover:border-purple-500/40",
    titleHover: "group-hover:text-purple-400",
  },
];

const secondaryCategories: CategoryDef[] = [
  {
    title: "TV",
    icon: Tv,
    href: "/category/tv",
    color: "from-orange-500/20 to-orange-500/5",
    iconColor: "text-orange-400",
    borderHover: "hover:border-orange-500/40",
    titleHover: "group-hover:text-orange-400",
  },
  {
    title: "Tech",
    icon: Cpu,
    href: "/category/tech",
    color: "from-cyan-500/20 to-cyan-500/5",
    iconColor: "text-cyan-400",
    borderHover: "hover:border-cyan-500/40",
    titleHover: "group-hover:text-cyan-400",
  },
  {
    title: "Manga",
    icon: BookOpenText,
    href: "/category/manga",
    color: "from-pink-500/20 to-pink-500/5",
    iconColor: "text-pink-400",
    borderHover: "hover:border-pink-500/40",
    titleHover: "group-hover:text-pink-400",
  },
  {
    title: "Music",
    icon: Music,
    href: "/category/music",
    color: "from-emerald-500/20 to-emerald-500/5",
    iconColor: "text-emerald-400",
    borderHover: "hover:border-emerald-500/40",
    titleHover: "group-hover:text-emerald-400",
  },
];

export function CategoryGrid() {
  return (
    <div className="space-y-3">
      {/* Primary categories — centered icon + label */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {primaryCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.title}
              href={cat.href}
              className={`group relative rounded-xl border border-border bg-card p-4 md:p-5 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:-translate-y-0.5 ${cat.borderHover} overflow-hidden flex flex-col items-center justify-center text-center`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                aria-hidden="true"
              />
              <div className="relative flex flex-col items-center gap-2">
                <Icon className={`w-7 h-7 ${cat.iconColor}`} strokeWidth={1.5} />
                <h3 className={`font-bold text-card-foreground text-sm ${cat.titleHover} transition-colors`}>
                  {cat.title}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Secondary categories — left-aligned icon + label with proper spacing */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {secondaryCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.title}
              href={cat.href}
              className={`group relative rounded-lg border border-border bg-card px-4 py-2.5 transition-all duration-300 hover:shadow-md hover:shadow-accent/5 ${cat.borderHover} overflow-hidden flex items-center justify-center gap-2.5`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-40 group-hover:opacity-80 transition-opacity duration-300`}
                aria-hidden="true"
              />
              <Icon className={`relative w-4 h-4 ${cat.iconColor} shrink-0`} strokeWidth={1.5} />
              <span className={`relative text-xs font-semibold text-card-foreground ${cat.titleHover} transition-colors`}>
                {cat.title}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
