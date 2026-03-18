import { Container } from "@/components/ui/Container";

export function HeroSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Layered background: radial glow + grid pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 40%, var(--color-accent) 0%, transparent 45%),
            radial-gradient(circle at 70% 60%, var(--color-accent) 0%, transparent 45%)
          `,
          opacity: 0.06,
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-foreground) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
        aria-hidden="true"
      />

      {/* SVG spider web accent (decorative) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
        <svg
          viewBox="0 0 400 400"
          className="w-[500px] h-[500px] md:w-[700px] md:h-[700px] text-accent opacity-[0.04]"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
        >
          {/* Radial lines */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={`r-${i}`}
                x1="200"
                y1="200"
                x2={Math.round(200 + 190 * Math.cos(angle))}
                y2={Math.round(200 + 190 * Math.sin(angle))}
              />
            );
          })}
          {/* Concentric rings */}
          {[50, 100, 150, 190].map((r) => (
            <circle key={r} cx="200" cy="200" r={r} />
          ))}
        </svg>
      </div>

      <Container className="relative text-center">
        {/* Mono tagline above heading */}
        <p className="font-mono text-xs md:text-sm uppercase tracking-[0.25em] text-accent mb-4">
          A Pop Culture Web
        </p>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-balance leading-[0.9]">
          The{" "}
          <span className="text-accent relative [html[data-theme='venom']_&]:text-white">
            Spidaverse
            {/* Underline accent */}
            <span
              className="absolute left-0 -bottom-1 w-full h-1 bg-accent/30 rounded-full"
              aria-hidden="true"
            />
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl mx-auto text-balance leading-relaxed">
          Movies. TV. Games. Anime. Manga. Music.
          <br />
          <span className="text-foreground font-medium">One web connects them all.</span>
        </p>

        {/* Category pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {["Movies & TV", "Video Games", "Anime & Manga", "Music"].map(
            (cat) => (
              <span
                key={cat}
                className="px-3 py-1 text-xs font-medium rounded-full border border-border text-muted-foreground bg-card/50 backdrop-blur-sm"
              >
                {cat}
              </span>
            )
          )}
        </div>
      </Container>
    </section>
  );
}
