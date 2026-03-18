import Link from "next/link";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="py-16 md:py-24 text-center relative overflow-hidden">
      {/* Background grid animation */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-accent) 1px, transparent 1px), linear-gradient(90deg, var(--color-accent) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          animation: "grid-scroll 20s linear infinite",
        }}
      />

      <div className="max-w-lg mx-auto relative z-10">
        {/* Portal shard SVG decorations */}
        <div className="relative mb-6" aria-hidden="true">
          <svg
            viewBox="0 0 200 200"
            className="absolute -top-8 -left-8 w-32 h-32 text-accent/10"
            style={{ animation: "portal-drift 8s ease-in-out infinite" }}
          >
            <polygon points="100,10 190,60 160,170 40,170 10,60" fill="currentColor" />
          </svg>
          <svg
            viewBox="0 0 200 200"
            className="absolute -top-4 -right-4 w-24 h-24 text-accent/8"
            style={{ animation: "portal-drift 10s ease-in-out infinite reverse" }}
          >
            <polygon points="100,20 180,80 140,180 60,180 20,80" fill="currentColor" />
          </svg>
        </div>

        {/* WRONG DIMENSION heading with chromatic aberration */}
        <p
          className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground mb-4"
          style={{ animation: "dimension-glitch 3s ease-in-out infinite" }}
        >
          Wrong Dimension
        </p>

        {/* Glitch 404 number */}
        <h1 className="text-[8rem] md:text-[12rem] font-black leading-none text-accent relative select-none">
          <span className="relative inline-block">
            404
            {/* Red channel offset */}
            <span
              className="absolute inset-0 text-[#E82334]/30"
              style={{
                textShadow: "2px -1px 0 rgba(232,35,52,0.3), -2px 1px 0 rgba(0,200,255,0.2)",
                animation: "dimension-glitch 2.5s ease-in-out infinite",
              }}
              aria-hidden="true"
            >
              404
            </span>
            {/* Cyan channel offset */}
            <span
              className="absolute inset-0 text-[#00C8FF]/20 translate-x-[3px] -translate-y-[2px]"
              style={{ animation: "dimension-glitch 3.5s ease-in-out infinite reverse" }}
              aria-hidden="true"
            >
              404
            </span>
          </span>
        </h1>

        <h2 className="mt-2 text-2xl md:text-3xl font-bold">
          This page doesn&rsquo;t exist in this universe.
        </h2>
        <p className="mt-3 text-muted-foreground text-lg max-w-sm mx-auto">
          You&rsquo;ve glitched into a dimension where this content was never created.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="spidey-sense-hover px-6 py-3 bg-accent text-background font-medium rounded-lg hover:opacity-90 transition-opacity"
          >
            Swing Back Home
          </Link>
          <Link
            href="/search"
            className="spidey-sense-hover px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
          >
            Search Instead
          </Link>
        </div>
      </div>
    </Container>
  );
}
