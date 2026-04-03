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

export interface CategoryConfig {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Tailwind text color for the icon */
  iconColor: string;
  /** Tailwind gradient for card/grid backgrounds */
  gradient: string;
  /** Tailwind classes for category pill (bg + text + border) */
  pill: string;
  /** Tailwind hover border for grid cards */
  borderHover: string;
  /** Tailwind group-hover text color for grid titles */
  titleHover: string;
  /** Raw RGB values for SVG pattern fills (no alpha) */
  rgb: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  Movies: {
    icon: Clapperboard,
    iconColor: "text-red-400",
    gradient: "from-red-500/20 to-red-500/5",
    pill: "bg-red-500/15 text-red-500 border-red-500/25",
    borderHover: "hover:border-red-500/40",
    titleHover: "group-hover:text-red-400",
    rgb: "239,68,68",
  },
  TV: {
    icon: Tv,
    iconColor: "text-orange-400",
    gradient: "from-orange-500/20 to-orange-500/5",
    pill: "bg-orange-500/15 text-orange-400 border-orange-500/25",
    borderHover: "hover:border-orange-500/40",
    titleHover: "group-hover:text-orange-400",
    rgb: "249,115,22",
  },
  "Video Games": {
    icon: Gamepad2,
    iconColor: "text-blue-400",
    gradient: "from-blue-500/20 to-blue-500/5",
    pill: "bg-blue-500/15 text-blue-500 border-blue-500/25",
    borderHover: "hover:border-blue-500/40",
    titleHover: "group-hover:text-blue-400",
    rgb: "59,130,246",
  },
  Anime: {
    icon: Sparkles,
    iconColor: "text-amber-400",
    gradient: "from-amber-500/20 to-amber-500/5",
    pill: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    borderHover: "hover:border-amber-500/40",
    titleHover: "group-hover:text-amber-400",
    rgb: "245,158,11",
  },
  Books: {
    icon: BookOpenText,
    iconColor: "text-pink-400",
    gradient: "from-pink-500/20 to-pink-500/5",
    pill: "bg-pink-500/15 text-pink-400 border-pink-500/25",
    borderHover: "hover:border-pink-500/40",
    titleHover: "group-hover:text-pink-400",
    rgb: "236,72,153",
  },
  Music: {
    icon: Music,
    iconColor: "text-emerald-400",
    gradient: "from-emerald-500/20 to-emerald-500/5",
    pill: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25",
    borderHover: "hover:border-emerald-500/40",
    titleHover: "group-hover:text-emerald-400",
    rgb: "16,185,129",
  },
  Culture: {
    icon: Globe,
    iconColor: "text-purple-400",
    gradient: "from-purple-500/20 to-purple-500/5",
    pill: "bg-purple-500/15 text-purple-500 border-purple-500/25",
    borderHover: "hover:border-purple-500/40",
    titleHover: "group-hover:text-purple-400",
    rgb: "168,85,247",
  },
  Tech: {
    icon: Cpu,
    iconColor: "text-cyan-400",
    gradient: "from-cyan-500/20 to-cyan-500/5",
    pill: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
    borderHover: "hover:border-cyan-500/40",
    titleHover: "group-hover:text-cyan-400",
    rgb: "6,182,212",
  },
};

/** Default config for unknown categories */
export const DEFAULT_CATEGORY: CategoryConfig = {
  icon: Globe,
  iconColor: "text-accent",
  gradient: "from-accent/15 to-accent/5",
  pill: "bg-accent/10 text-accent border-accent/20",
  borderHover: "hover:border-accent/40",
  titleHover: "group-hover:text-accent",
  rgb: "150,150,150",
};

/** Get category config by title, with fallback */
export function getCategoryConfig(title?: string): CategoryConfig {
  if (!title) return DEFAULT_CATEGORY;
  return CATEGORY_CONFIG[title] || DEFAULT_CATEGORY;
}
