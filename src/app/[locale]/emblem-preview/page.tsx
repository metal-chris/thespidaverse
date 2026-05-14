import { SpiderEmblemV3Preview } from "@/components/about/SpiderEmblemV3";

export default function EmblemPreviewPage() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-2">Spider Emblem V3 Explorations</h1>
        <p className="text-center text-muted-foreground text-sm mb-8">
          Hybrid approach: PS4 elongated body + Miles angular legs + ATSV sweep
        </p>
        <SpiderEmblemV3Preview />
      </div>
    </div>
  );
}
