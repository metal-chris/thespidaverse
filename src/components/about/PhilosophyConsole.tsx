"use client";

import { WebRating } from "@/components/content/WebRating";

const beliefs = [
  {
    title: "Constructive Criticism",
    text: "I write like I'm putting a friend onto something. Honest, but never just to be loud.",
  },
  {
    title: "Repeat Engagement",
    text: "Not everything needs to be a masterpiece to be worth your time. Some things are comfort, some things challenge you. I try to meet all of it where it is.",
  },
  {
    title: "The Web Is Yours Too",
    text: "This isn't a one-person operation. If something resonates, if you disagree, if you want to put me onto something I missed, that's the whole point.",
  },
];

export function PhilosophyConsole() {
  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
      {/* WebRating demo */}
      <div className="shrink-0 flex flex-col items-center gap-2">
        <WebRating score={100} variant="full" />
        <p className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-wider text-center">
          The Web Rating System
        </p>
      </div>

      {/* Philosophy cards */}
      <div className="flex-1 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Every piece of media gets a <strong className="text-foreground">Web Rating</strong> out of 100, visualized as a spider web that fills based on the score. Not because I want to debate whether something deserves an 87 or a 91, but because sometimes you need to put a number on how much something <em>mattered</em> to you.
        </p>
        {beliefs.map((belief, i) => (
          <div
            key={belief.title}
            className="rounded-lg border border-border/50 bg-card/30 px-4 py-3"
          >
            <h4 className="text-xs font-bold text-accent uppercase tracking-wider mb-1">
              {String(i + 1).padStart(2, "0")} &mdash; {belief.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {belief.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
