import { cn } from "@/lib/utils";

interface DossierSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/** Reusable dossier panel — glassmorphism card with monospaced `/// TITLE` header */
export function DossierSection({ title, children, className }: DossierSectionProps) {
  return (
    <section className={cn("rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden", className)}>
      <div className="px-4 py-2.5 border-b border-border/50 bg-card/30">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          /// {title}
        </h2>
      </div>
      <div className="p-4 md:p-6">
        {children}
      </div>
    </section>
  );
}
