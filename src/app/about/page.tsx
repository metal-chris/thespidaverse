import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About",
  description: "About The Spidaverse and Spida Mane.",
};

export default function AboutPage() {
  return (
    <Container as="section" className="py-8 md:py-12 max-w-3xl">
      <header className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
          Who&rsquo;s Behind the Web
        </p>
        <h1 className="text-3xl md:text-4xl font-bold">About</h1>
      </header>

      <div className="space-y-5 text-foreground/90 text-base md:text-lg leading-relaxed">
        <p>
          <strong className="text-foreground">The Spidaverse</strong> is a personal pop culture
          and media blog by <strong className="text-accent">Spida Mane</strong>.
        </p>
        <p>
          This is where I write about the movies I watch, the games I play, the anime I binge,
          the manga I read, and the music I vibe to. No PR copy, no sponsored takes &mdash; just
          honest thoughts from someone who genuinely loves this stuff.
        </p>
        <p>
          Every piece of media gets a <strong className="text-foreground">Web Rating</strong> out
          of 100, visualized as a spider web that fills up based on the score. Because if
          you&rsquo;re going to rate things, you might as well make it look cool.
        </p>
        <p>
          The site runs on two modes: <strong className="text-foreground">Miles Mode</strong>{" "}
          (light) and <strong className="text-foreground">Venom Mode</strong> (dark). Toggle
          the spider emblem in the header to switch.
        </p>
        <p className="text-muted-foreground text-sm border-l-2 border-border pl-4">
          Built with Next.js, Sanity, and a lot of CSS that probably didn&rsquo;t need to be
          that complicated. Deployed on Netlify.
        </p>
      </div>
    </Container>
  );
}
