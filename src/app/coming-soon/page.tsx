import type { Metadata } from "next";
import { ComingSoonPage } from "@/components/coming-soon/ComingSoonPage";

export const metadata: Metadata = {
  title: "Coming Soon",
  description:
    "The Spidaverse is coming soon. Be the first to explore the web. Sign up for early access.",
  openGraph: {
    title: "Coming Soon | The Spidaverse",
    description:
      "The Spidaverse is coming soon. Be the first to explore the web.",
  },
};

export default function Page() {
  return <ComingSoonPage />;
}
