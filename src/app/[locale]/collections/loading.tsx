import { Container } from "@/components/ui/Container";

export default function CollectionsLoading() {
  return (
    <Container className="py-8 md:py-12">
      {/* Header skeleton */}
      <div className="space-y-2 mb-10">
        <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-4 w-80 bg-muted rounded animate-pulse" />
      </div>

      {/* Portrait card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-muted animate-pulse"
            style={{ aspectRatio: "3/4" }}
          />
        ))}
      </div>
    </Container>
  );
}
