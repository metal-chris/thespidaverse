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
          Growing up, my dad and I bonded over nerdy stuff. He had his baseball cards and Magic: The Gathering collection, I had my Pokémon and Yu-Gi-Oh! decks. We&rsquo;d spend hours comparing pulls, debating strategies, geeking out over whatever we were into that week. That&rsquo;s what pop culture has always been for me: a way to connect. A language we speak when regular words don&rsquo;t cut it.
        </p>
        <p>
          When life got heavy (and it did), I found myself turning to Spider-Man comics. Not because they had all the answers, but because Peter Parker never gave up. No matter how bad things got, he kept swinging. That resilience became something I needed to see, over and over again. So here we are.
        </p>
        <p>
          <strong className="text-foreground">The Spidaverse</strong> is where I share the movies, games, anime, manga, and music that got me through. Every piece of media gets a <strong className="text-foreground">Web Rating</strong> out of 100, visualized as a spider web that fills based on the score. Not because I want to debate whether something deserves an 87 or a 91, but because sometimes you just need to quantify how much something mattered to you. It&rsquo;s like when you tell someone a movie is &ldquo;pretty good&rdquo; but you actually watched it three times in one week. The web doesn&rsquo;t lie.
        </p>
        <p>
          Look, I know what you&rsquo;re thinking. <em>&ldquo;Another person with Opinions™ about movies on the internet.&rdquo;</em> Fair. But I&rsquo;m not here to prove I&rsquo;m right or win arguments in the comments. I write like I&rsquo;m talking to a friend about something we&rsquo;re both into, not like a critic getting paid to dissect frame rates and symbolism. I&rsquo;m not paid enough to be that. What I <em>am</em> trying to do is the thing I wish I saw more of on the internet: constructive criticism that actually brightens your day, puts you onto something new, or respectfully challenges your perspective without making you feel like an idiot for disagreeing.
        </p>
        <p>
          You&rsquo;ll find me nerding out over <em>Jujutsu Kaisen</em>&rsquo;s subtle urban undertones, defending why <em>Fantastic Four</em> worked as both a sci-fi flick and a superhero movie, or explaining why J. Cole&rsquo;s <em>The Fall Off</em> is going to take you 26 listens to fully unpack. Games get special love here because they&rsquo;re interactive in ways other art forms can&rsquo;t match, and if you&rsquo;re sleeping on gaming as an art form, we need to talk. I also spoiler-mark everything because consent is key, and I wouldn&rsquo;t want to ruin your first impression of something with a blank slate. You can read safely.
        </p>
        <p>
          Expect seasonal vibes (Saturday morning cartoons energy, shout out to Kendrick&rsquo;s &ldquo;Cartoons & Cereal&rdquo;), vibe-based picks, and the occasional reader request. My current white whale? The entire MCU up to this point. It&rsquo;s a lot. We&rsquo;ll get there. Eventually. Maybe.
        </p>
        <p>
          I approach media the same way I approach food: with respect for everything I consume. Some of it&rsquo;s comfort food (Edgar Wright films are my go-tos when I need a reset). Some of it challenges you. Some of it disappoints (<em>Karate Kid: Legends</em> had <em>Cobra Kai</em> to springboard off of and still fell flat). But it all deserves to be engaged with thoughtfully. I&rsquo;ve changed my mind on plenty of things, especially music, because a lot of lyrics and musical elements are more complex than they&rsquo;re presented. That&rsquo;s the beauty of revisiting things. Giving them repeat listens. Letting them marinate.
        </p>
        <p>
          Spider-Man inspires hope. I&rsquo;m not him. I&rsquo;m just trying to be someone he&rsquo;d respect while being my own person. The Leap of Faith scene from <em>Into the Spider-Verse</em> lives in my head rent-free. That moment when Miles finally becomes Spider-Man, not by being perfect, but by taking the jump anyway. That&rsquo;s what this site is. A leap of faith. An invitation to connect over the things we love, challenge each other&rsquo;s perspectives, and maybe discover something new along the way.
        </p>
        <p>
          If you&rsquo;re kind, passionate, and open-minded, welcome to the web.
        </p>
      </div>
    </Container>
  );
}
