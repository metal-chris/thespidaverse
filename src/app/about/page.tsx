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
          Growing up, my dad and I bonded over nerdy stuff. He had his baseball cards and Magic: The Gathering collection, I had my Pokémon and Yu-Gi-Oh! decks. We&rsquo;d spend hours talking about the things we were passionate about&mdash;comparing pulls, debating strategies, geeking out over whatever we were into that week.
        </p>
        <p>
          That&rsquo;s what pop culture has always been for me: a way to connect. A language we speak when regular words don&rsquo;t cut it.
        </p>
        <p>
          When life got heavy&mdash;and <em>it did</em>&mdash;I found myself turning to Spider-Man comics. Not because they had all the answers, but because Peter Parker never gave up. No matter how bad things got, no matter how much the world pushed back, he kept swinging. That resilience became something I needed to see, over and over again.
        </p>
        <p>
          <strong className="text-foreground">The Spidaverse</strong> is my way of paying that forward. It&rsquo;s where I share the movies, games, anime, manga, and music that got me through&mdash;and continue to get me through. Every piece of media gets a <strong className="text-foreground">Web Rating</strong> out of 100, visualized as a spider web that fills based on the score. Not because I want to debate whether something deserves an 87 or a 91, but because sometimes you just need to quantify how much something mattered to you.
        </p>
        <p>
          Look, I know what you&rsquo;re thinking: <em>&ldquo;Another person with Opinions™ about movies on the internet.&rdquo;</em> Fair. But I&rsquo;m not here to prove I&rsquo;m right or win arguments in the comments (the internet&rsquo;s already got enough of that). I&rsquo;m just here to nerd out with you about the stuff we love. To share why a &ldquo;bad&rdquo; movie hit different for me. To put you on to that J-Pop/Rap artist you&rsquo;ve been sleeping on. To defend <em>Batman v Superman</em> like my life depends on it (yes, really&mdash;and no, I will not be taking questions at this time).
        </p>
        <p>
          Some hills I&rsquo;ll die on: J-Pop/Rap is criminally underrated. Pineapple does not belong on pizza. <em>Batman v Superman</em> got way more hate than it deserved. And if you disagree? Cool. That&rsquo;s what makes this fun.
        </p>
        <p>
          Spider-Man inspires hope. I&rsquo;m not him&mdash;I&rsquo;m just trying to be someone he&rsquo;d respect while being my own person. Because anyone can wear the mask. Anyone can be Spider-Man. And we&rsquo;re all in this together, connected by the stories that shape us.
        </p>
        <p className="text-muted-foreground text-sm border-l-2 border-border pl-4">
          With great power comes great responsibility to have correct opinions about anime. Welcome to the web.
        </p>
      </div>
    </Container>
  );
}
