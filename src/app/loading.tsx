import { WebSpinner } from "@/components/ui/WebSpinner";

export default function RootLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <WebSpinner size="lg" />
    </div>
  );
}
