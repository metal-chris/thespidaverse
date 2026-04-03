import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getProvider } from "@/lib/providers";
import { Container } from "@/components/ui/Container";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { CurrentlyConsumingWidget } from "@/components/widgets/CurrentlyConsuming";
import { DossierSection } from "@/components/about/DossierSection";
import { IDCardHeader } from "@/components/about/IDCardHeader";
import { OriginFile } from "@/components/about/OriginFile";
import { AbilitiesMatrix } from "@/components/about/AbilitiesMatrix";
import { ArsenalPanel } from "@/components/about/ArsenalPanel";
import { PhilosophyConsole } from "@/components/about/PhilosophyConsole";

export const metadata: Metadata = {
  title: "About",
  description: "About The Spidaverse and Spida-Mane. Pop culture analyst, web-slinger, and the person behind the web.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const t = await getTranslations();
  const provider = getProvider();
  const consuming = await provider.getCurrentlyConsuming();

  return (
    <Container as="section" className="pt-4 pb-8 md:pt-6 md:pb-12 max-w-4xl space-y-6">
      {/* ID Card — above the fold */}
      <ScrollReveal>
        <IDCardHeader />
      </ScrollReveal>

      {/* Origin File — expandable bio accordion */}
      <ScrollReveal delay={60}>
        <DossierSection title={t("about.originFile")}>
          <OriginFile />
        </DossierSection>
      </ScrollReveal>

      {/* Abilities — category stat grid */}
      <ScrollReveal delay={120}>
        <DossierSection title={t("about.skills")}>
          <AbilitiesMatrix />
        </DossierSection>
      </ScrollReveal>

      {/* Arsenal — platforms + article formats */}
      <ScrollReveal delay={180}>
        <DossierSection title={t("about.gearLoadout")}>
          <ArsenalPanel />
        </DossierSection>
      </ScrollReveal>

      {/* Philosophy — WebRating demo + core beliefs */}
      <ScrollReveal delay={240}>
        <DossierSection title={t("about.principles")}>
          <PhilosophyConsole />
        </DossierSection>
      </ScrollReveal>

      {/* Live Feed — currently consuming + Spotify */}
      <ScrollReveal delay={300}>
        <DossierSection title={t("about.liveFeed")}>
          <CurrentlyConsumingWidget data={consuming} />
        </DossierSection>
      </ScrollReveal>
    </Container>
  );
}
