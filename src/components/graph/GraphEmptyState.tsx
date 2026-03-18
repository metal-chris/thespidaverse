import Link from "next/link";
import { WebSpinner } from "@/components/ui/WebSpinner";

export function GraphEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <WebSpinner size="lg" className="mb-6 text-muted-foreground" />
      <h2 className="text-2xl font-bold mb-2">The web is still being spun&hellip;</h2>
      <p className="text-muted-foreground max-w-md">
        This is where you&rsquo;ll be able to explore how everything in the Spidaverse
        connects &mdash; movies, shows, games, and more, all linked together.
      </p>
      <p className="text-muted-foreground max-w-md mt-2">
        As articles are published, the web will grow with connections between media, tags, and categories.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border border-border bg-card hover:bg-muted hover:border-accent/30 text-foreground transition-colors"
      >
        &larr; Explore articles
      </Link>
    </div>
  );
}
