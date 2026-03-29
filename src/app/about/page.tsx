import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { GlitchText } from "@/components/ui/GlitchText";

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
        <GlitchText className="text-3xl md:text-4xl font-bold">About</GlitchText>
      </header>

      <div className="space-y-5 text-foreground/90 text-base md:text-lg leading-relaxed">
        <p>
          Pop culture has always been a language. Not the kind you study; the kind you just <em>speak</em>. It&rsquo;s how my dad and I bonded growing up. He had his baseball cards and Magic: The Gathering collection. I had my Pokémon and Yu-Gi-Oh! decks. We&rsquo;d spend hours comparing pulls, debating strategies, geeking out over whatever we were into that week. That&rsquo;s what this stuff does. It connects people when regular words don&rsquo;t cut it.
        </p>
        <p>
          <strong className="text-foreground">The Spidaverse</strong> exists because that connection shouldn&rsquo;t stop at your living room.
        </p>
        <p>
          When life got heavy, I found myself turning to Spider-Man comics. Not because they had all the answers, but because Peter Parker never gave up. No matter how bad things got, he kept swinging. Fall down 7 times, get up 8. That resilience became something I needed to see, over and over again. And the thing about Spider-Man (the real thing) is that it was never about <em>him</em>. It&rsquo;s about the idea that anyone can wear the mask. That the web is bigger than one person.
        </p>
        <p>
          That&rsquo;s what this is.
        </p>
        <p>
          Every piece of media on this site gets a <strong className="text-foreground">Web Rating</strong> out of 100, visualized as a spider web that fills based on the score. Not because I want to debate whether something deserves an 87 or a 91, but because sometimes you need to put a number on how much something <em>mattered</em> to you. It&rsquo;s like when you tell someone a movie is &ldquo;pretty good&rdquo; but you actually watched it three times in one week. The web doesn&rsquo;t lie.
        </p>
        <p>
          You&rsquo;ll find deep dives into <em>Jujutsu Kaisen</em>&rsquo;s subtle urban undertones, arguments for why <em>Fantastic Four</em> worked as both a sci-fi flick and a superhero movie, breakdowns of why a J. Cole album takes 26 listens to fully unpack. Games get special love because they&rsquo;re interactive in ways other art forms can&rsquo;t match. And if you&rsquo;re sleeping on gaming as an art form? We need to talk.
        </p>
        <p>
          But here&rsquo;s the thing: <strong className="text-foreground">this isn&rsquo;t just my web.</strong>
        </p>
        <p>
          I write like I&rsquo;m talking to a friend about something we&rsquo;re both into. Not like a critic getting paid to dissect frame rates and symbolism. What I&rsquo;m trying to build is the thing I wish I saw more of online: constructive criticism that actually brightens your day, puts you onto something new, or respectfully challenges your perspective without making you feel like an idiot for disagreeing. And I want <em>you</em> to do the same.
        </p>
        <p>
          I approach media the same way I approach food; with respect for everything I consume. Some of it&rsquo;s comfort food. Some of it challenges you. Some of it disappoints. But it all deserves to be engaged with thoughtfully. I&rsquo;ve changed my mind on plenty of things because I gave them repeat listens, rewatches, and time to marinate. That&rsquo;s not weakness. That&rsquo;s the whole point.
        </p>
        <p>
          The Leap of Faith scene from <em>Into the Spider-Verse</em> lives in my head rent-free. That moment when Miles finally becomes Spider-Man (not by being perfect, not by being Peter) but by taking the jump anyway. That&rsquo;s what Spider-Man has always meant to me. Not the powers, not the suit. The decision to keep swinging. That&rsquo;s what this space is. A leap of faith. An invitation to connect over the things we love, challenge each other&rsquo;s perspectives, and maybe discover something new along the way.
        </p>
        <p>
          If you&rsquo;re kind, passionate, and open-minded? Welcome to the web. It&rsquo;s yours too.
        </p>
      </div>
    </Container>
  );
}
