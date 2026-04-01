"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubsectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Subsection({ title, isOpen, onToggle, children }: SubsectionProps) {
  return (
    <div className="border-b border-border/30 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 py-3 px-1 text-left group"
      >
        <span className="font-mono text-xs uppercase tracking-[0.15em] text-foreground/80 group-hover:text-accent transition-colors">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-300 shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-300 ease-in-out"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="pb-4 px-1 space-y-4 text-foreground/90 text-sm md:text-base leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function OriginFile() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div>
      <Subsection
        title="Canon Event #001: The Shared Language"
        isOpen={openIndex === 0}
        onToggle={() => toggle(0)}
      >
        <p>
          Pop culture was never just entertainment in my house. It was how my dad and I talked. He had his baseball cards and Magic: The Gathering collection. I had my Pok&eacute;mon and Yu-Gi-Oh! decks. We&rsquo;d spend hours comparing pulls, debating strategies, geeking out over whatever we were into that week. It wasn&rsquo;t about the cards. It was about having a language that was <em>ours</em>.
        </p>
        <p>
          Every Spider-Person has a canon event, something that shapes who they become. This was mine. The moment I learned that the things we love aren&rsquo;t just things. They&rsquo;re bridges. <strong className="text-accent">The Spidaverse</strong> exists because that bridge shouldn&rsquo;t stop at your living room.
        </p>
      </Subsection>

      <Subsection
        title="Canon Event #002: The Weight"
        isOpen={openIndex === 1}
        onToggle={() => toggle(1)}
      >
        <p>
          I lost my father to the pandemic. And in the years since, aunts, uncles, friends. People who shaped me in ways I&rsquo;m still figuring out. Every Spider-Person loses someone. Uncle Ben. Aunt May. Captain Stacy. It&rsquo;s supposed to be the event that forges you, the thing the multiverse says you <em>have</em> to go through.
        </p>
        <p>
          But Spider-Man isn&rsquo;t a mask I wear to hide from that. It&rsquo;s a symbol I carry with me <em>because</em> of it. When things got heavy, I kept coming back to Peter Parker. Not because he had answers, but because he never stopped swinging. <strong className="text-accent">Fall down 7, get up 8.</strong> That resilience became something I needed to see, over and over again. The web is bigger than one person. And the people I&rsquo;ve lost are woven into every strand of it.
        </p>
      </Subsection>

      <Subsection
        title="Canon Event #003: The Leap of Faith"
        isOpen={openIndex === 2}
        onToggle={() => toggle(2)}
      >
        <p>
          In <em>Into the Spider-Verse</em>, Miles doesn&rsquo;t become Spider-Man by following the script. He breaks it. The multiverse tells him there are canon events he has to accept, and he says no. I&rsquo;m choosing my own path. That&rsquo;s the version of Spider-Man that lives in my head.
        </p>
        <p>
          I wish I&rsquo;d taken more leaps when my pops was around. I wanted to make him as proud of me as I am to have had him as a dad. But the thing about a leap of faith is that you don&rsquo;t get to pick the timing. <strong className="text-accent">You just have to jump when you&rsquo;re ready.</strong> This is that jump. Not perfect, not following anyone else&rsquo;s blueprint. Just swinging.
        </p>
        <p>
          If you&rsquo;re kind, passionate, and open-minded? Welcome to the web. It&rsquo;s yours too.
        </p>
      </Subsection>
    </div>
  );
}
