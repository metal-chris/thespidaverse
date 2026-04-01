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
import { cn } from "@/lib/utils";

interface Skill {
  name: string;
  icon: LucideIcon;
  tagline: string;
  type: "tech" | "creative";
}

const skills: Skill[] = [
  // Tech / Business
  { name: "Web Dev", icon: Globe, tagline: "Full-stack, front to back", type: "tech" },
  { name: "Product Design", icon: Lightbulb, tagline: "From concept to screen", type: "tech" },
  { name: "Systems Architecture", icon: Layers, tagline: "Building the blueprint", type: "tech" },
  { name: "Data & Analytics", icon: BarChart3, tagline: "Numbers tell stories too", type: "tech" },
  { name: "Project Mgmt", icon: Kanban, tagline: "Shipping on schedule", type: "tech" },
  { name: "BizDev", icon: Briefcase, tagline: "Growth with intention", type: "tech" },
  // Creative
  { name: "Writing", icon: PenTool, tagline: "Words are the first web", type: "creative" },
  { name: "Design", icon: Palette, tagline: "Visual language, crafted", type: "creative" },
  { name: "Curation", icon: Library, tagline: "Taste is a skill", type: "creative" },
  { name: "Content Strategy", icon: Target, tagline: "Plan the spin, then spin", type: "creative" },
  { name: "Community", icon: Users, tagline: "The web needs people in it", type: "creative" },
  { name: "Branding", icon: Megaphone, tagline: "Voice, tone, identity", type: "creative" },
];

export function AbilitiesMatrix() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      {skills.map((skill) => {
        const Icon = skill.icon;
        const isTech = skill.type === "tech";
        return (
          <div
            key={skill.name}
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
                {skill.name}
              </h3>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {skill.tagline}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
