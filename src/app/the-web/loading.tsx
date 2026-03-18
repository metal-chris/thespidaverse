import { WebSpinner } from "@/components/ui/WebSpinner";

export default function TheWebLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0A0A0A]">
      <WebSpinner size="lg" className="text-white/50" />
    </div>
  );
}
