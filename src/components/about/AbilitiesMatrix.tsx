import { CATEGORY_CONFIG } from "@/lib/categories";
import { cn } from "@/lib/utils";

const descriptors: Record<string, string> = {
  Movies: "Blockbusters to indie gems",
  TV: "Prestige dramas to guilty pleasures",
  "Video Games": "Interactive art advocate",
  Anime: "Shonen to psychological thrillers",
  Manga: "Panel-by-panel deep dives",
  Music: "Albums on repeat, dissected",
  Culture: "The bigger picture",
  Tech: "Tools of the trade",
};

export function AbilitiesMatrix() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
      {Object.entries(CATEGORY_CONFIG).map(([name, config]) => {
        const Icon = config.icon;
        return (
          <div
            key={name}
            className={cn(
              "group relative rounded-lg border border-border bg-card p-3 md:p-4 transition-all duration-200",
              "hover:-translate-y-0.5 hover:shadow-md hover:shadow-accent/5",
              config.borderHover,
              "overflow-hidden"
            )}
          >
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-70 transition-opacity duration-200",
                config.gradient
              )}
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-center text-center gap-1.5">
              <Icon className={cn("w-6 h-6", config.iconColor)} strokeWidth={1.5} />
              <h3 className={cn("font-bold text-xs text-card-foreground", config.titleHover, "transition-colors")}>
                {name}
              </h3>
              <p className="text-[10px] text-muted-foreground leading-tight">
                {descriptors[name]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
