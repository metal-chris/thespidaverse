import { WebSpinner } from "@/components/ui/WebSpinner";

export function GraphEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <WebSpinner size="lg" className="mb-6 text-muted-foreground" />
      <h2 className="text-2xl font-bold mb-2">The web is still being spun&hellip;</h2>
      <p className="text-muted-foreground max-w-md">
        This is where you&rsquo;ll be able to explore how everything in the Spidaverse
        connects &mdash; movies, shows, games, and more, all linked together. Check back soon.
      </p>
    </div>
  );
}
