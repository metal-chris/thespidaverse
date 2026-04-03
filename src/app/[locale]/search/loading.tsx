import { Container } from "@/components/ui/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <Container className="py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Search bar skeleton */}
        <Skeleton className="h-12 w-full rounded-lg" />
        {/* Filter row */}
        <div className="flex gap-3">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
        {/* Results */}
        <div className="space-y-4 pt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 items-start">
              <Skeleton className="w-24 h-16 rounded-md shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
