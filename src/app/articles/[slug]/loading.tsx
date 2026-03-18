import { Container } from "@/components/ui/Container";
import { ArticleSkeleton } from "@/components/ui/Skeleton";

export default function ArticleLoading() {
  return (
    <Container className="py-8">
      <ArticleSkeleton />
    </Container>
  );
}
