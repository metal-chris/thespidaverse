import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/coming-soon/ComingSoonPage";

export const metadata: Metadata = {
  title: "The Spidaverse",
  description:
    "The Spidaverse — the web is ready. Are you? Pop culture, reviews, and community from Spida-Mane.",
  openGraph: {
    title: "The Spidaverse",
    description:
      "The web is ready. Are you?",
  },
};

export default function Page() {
  return <ComingSoonPage />;
}
