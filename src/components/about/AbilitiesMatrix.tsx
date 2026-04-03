"use client";

import {
  Globe,
  Lightbulb,
  Layers,
  BarChart3,
  Kanban,
  Briefcase,
  PenTool,
  Palette,
  Library,
  Target,
  Users,
  Megaphone,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface Skill {
  nameKey: string;
  taglineKey: string;
  icon: LucideIcon;
  type: "tech" | "creative";
}

const skills: Skill[] = [
  // Tech / Business
  { nameKey: "skillWebDev", icon: Globe, taglineKey: "skillWebDevTagline", type: "tech" },
  { nameKey: "skillProductDesign", icon: Lightbulb, taglineKey: "skillProductDesignTagline", type: "tech" },
  { nameKey: "skillSystemsArch", icon: Layers, taglineKey: "skillSystemsArchTagline", type: "tech" },
  { nameKey: "skillDataAnalytics", icon: BarChart3, taglineKey: "skillDataAnalyticsTagline", type: "tech" },
  { nameKey: "skillProjectMgmt", icon: Kanban, taglineKey: "skillProjectMgmtTagline", type: "tech" },
  { nameKey: "skillBizDev", icon: Briefcase, taglineKey: "skillBizDevTagline", type: "tech" },
  // Creative
  { nameKey: "skillWriting", icon: PenTool, taglineKey: "skillWritingTagline", type: "creative" },
  { nameKey: "skillDesign", icon: Palette, taglineKey: "skillDesignTagline", type: "creative" },
  { nameKey: "skillCuration", icon: Library, taglineKey: "skillCurationTagline", type: "creative" },
  { nameKey: "skillContentStrategy", icon: Target, taglineKey: "skillContentStrategyTagline", type: "creative" },
  { nameKey: "skillCommunity", icon: Users, taglineKey: "skillCommunityTagline", type: "creative" },
  { nameKey: "skillBranding", icon: Megaphone, taglineKey: "skillBrandingTagline", type: "creative" },
];

export function AbilitiesMatrix() {
  const t = useTranslations("about");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      {skills.map((skill) => {
        const Icon = skill.icon;
        const isTech = skill.type === "tech";
        return (
          <div
            key={skill.nameKey}
            className={cn(
              "group relative rounded-lg border border-border bg-card p-3 md:p-4 transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-md",
              isTech
                ? "hover:border-cyan-500/40 hover:shadow-cyan-500/5"
                : "hover:border-purple-500/40 hover:shadow-purple-500/5",
              "overflow-hidden"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-70 transition-opacity duration-200",
                isTech
                  ? "from-cyan-500/20 to-cyan-500/5"
                  : "from-purple-500/20 to-purple-500/5"
              )}
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-center text-center gap-1.5">
              <Icon
                className={cn(
                  "w-6 h-6",
                  isTech ? "text-cyan-400" : "text-purple-400"
                )}
                strokeWidth={1.5}
              />
              <h3
                className={cn(
                  "font-bold text-xs text-card-foreground transition-colors",
                  isTech
                    ? "group-hover:text-cyan-400"
                    : "group-hover:text-purple-400"
                )}
              >
                {t(skill.nameKey)}
              </h3>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {t(skill.taglineKey)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
