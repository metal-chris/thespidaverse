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
        title="The Foundation"
        isOpen={openIndex === 0}
        onToggle={() => toggle(0)}
      >
        <p>
          Pop culture has always been a language. Not the kind you study; the kind you just <em>speak</em>. It&rsquo;s how my dad and I bonded growing up. He had his baseball cards and Magic: The Gathering collection. I had my Pok&eacute;mon and Yu-Gi-Oh! decks. We&rsquo;d spend hours comparing pulls, debating strategies, geeking out over whatever we were into that week. That&rsquo;s what this stuff does. It connects people when regular words don&rsquo;t cut it.
        </p>
        <p>
          <strong className="text-foreground">The Spidaverse</strong> exists because that connection shouldn&rsquo;t stop at your living room.
        </p>
      </Subsection>

      <Subsection
        title="The Catalyst"
        isOpen={openIndex === 1}
        onToggle={() => toggle(1)}
      >
        <p>
          When life got heavy, I found myself turning to Spider-Man comics. Not because they had all the answers, but because Peter Parker never gave up. No matter how bad things got, he kept swinging. Fall down 7 times, get up 8. That resilience became something I needed to see, over and over again. And the thing about Spider-Man (the real thing) is that it was never about <em>him</em>. It&rsquo;s about the idea that anyone can wear the mask. That the web is bigger than one person.
        </p>
        <p>
          That&rsquo;s what this is.
        </p>
      </Subsection>

      <Subsection
        title="The Leap of Faith"
        isOpen={openIndex === 2}
        onToggle={() => toggle(2)}
      >
        <p>
          The Leap of Faith scene from <em>Into the Spider-Verse</em> lives in my head rent-free. That moment when Miles finally becomes Spider-Man &mdash; not by being perfect, not by being Peter, but by taking the jump anyway. That&rsquo;s what Spider-Man has always meant to me. Not the powers, not the suit. The decision to keep swinging. That&rsquo;s what this space is. A leap of faith. An invitation to connect over the things we love, challenge each other&rsquo;s perspectives, and maybe discover something new along the way.
        </p>
        <p>
          If you&rsquo;re kind, passionate, and open-minded? Welcome to the web. It&rsquo;s yours too.
        </p>
      </Subsection>
    </div>
  );
}
