import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { GlitchText } from "@/components/ui/GlitchText";
import { getAllPatchNotes, renderMarkdown, type PatchNote } from "@/lib/patch-notes";

export const metadata: Metadata = {
  title: "Patch Notes",
  description:
    "A running log of what's changed across the Spidaverse — philosophy shifts, new features, series launches.",
};

const CATEGORY_STYLES: Record<string, string> = {
  Philosophy: "bg-accent/15 text-accent border-accent/30",
  Feature: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "Series Launch": "bg-purple-500/15 text-purple-300 border-purple-500/30",
  Design: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Site: "bg-blue-500/15 text-blue-300 border-blue-500/30",
};

function formatDisplayDate(iso: string): string {
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00Z" : ""));
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function buildVersion(date: string, index: number, total: number): string {
  const year = date.slice(0, 4);
  const rank = String(total - index).padStart(2, "0");
  return `v${year}.${rank}`;
}

export default function PatchNotesPage() {
  const notes = getAllPatchNotes();

  return (
    <Container className="pt-3 pb-16 max-w-3xl">
      <header className="mt-6 mb-12 pb-8 border-b-2 border-border">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-2">
          // changelog
        </p>
        <GlitchText className="text-4xl md:text-5xl font-bold leading-tight">
          Patch Notes
        </GlitchText>
        <p className="mt-4 text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
          What changed, when it changed, and why. The Spidaverse is a living project — these are
          the moments that shaped it.
        </p>
      </header>

      {notes.length === 0 ? (
        <p className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-xl">
          No entries yet.
        </p>
      ) : (
        <ol className="space-y-12">
          {notes.map((note, i) => (
            <PatchNoteEntry
              key={note.slug}
              note={note}
              version={buildVersion(note.date, i, notes.length)}
            />
          ))}
        </ol>
      )}
    </Container>
  );
}

function PatchNoteEntry({ note, version }: { note: PatchNote; version: string }) {
  const pill = CATEGORY_STYLES[note.category] ?? CATEGORY_STYLES.Site;
  return (
    <li className="relative pl-6 border-l-2 border-border hover:border-accent/40 transition-colors">
      <span
        aria-hidden="true"
        className="absolute -left-[7px] top-2 w-3 h-3 rounded-full bg-background border-2 border-accent"
      />
      <article>
        <div className="flex flex-wrap items-center gap-2 text-[11px] mb-2">
          <span className="font-mono uppercase tracking-wider text-accent">{version}</span>
          <span className="w-1 h-1 rounded-full bg-border" aria-hidden="true" />
          <time dateTime={note.date} className="tabular-nums text-muted-foreground">
            {formatDisplayDate(note.date)}
          </time>
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full border ${pill}`}
          >
            {note.category}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-bold leading-snug mb-3">{note.title}</h2>
        <div
          className="patch-note-body space-y-4 text-sm md:text-base text-foreground/85 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(note.body) }}
        />
      </article>
    </li>
  );
}
