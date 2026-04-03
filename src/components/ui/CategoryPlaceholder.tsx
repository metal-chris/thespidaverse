import { cn } from "@/lib/utils";
import { getCategoryConfig } from "@/lib/categories";

interface CategoryPlaceholderProps {
  /** Category title — "Movies", "TV", "Video Games", etc. */
  category?: string;
  /** Container sizing classes (e.g. "aspect-[16/10]", "absolute inset-0") */
  className?: string;
  /** Add gradient overlay for text readability (default true) */
  overlay?: boolean;
  /** Show centered category icon (default true) */
  iconVisible?: boolean;
  /** Pattern opacity multiplier: "subtle" (default), "medium", "bold" */
  intensity?: "subtle" | "medium" | "bold";
}

/**
 * Category-aware placeholder background with generative SVG patterns.
 * Server component — no client-side logic, pure SVG rendering.
 */
const INTENSITY_MAP = {
  subtle: { base: 0.18, strong: 0.28 },
  medium: { base: 0.35, strong: 0.5 },
  bold: { base: 0.55, strong: 0.7 },
};

export function CategoryPlaceholder({
  category,
  className,
  overlay = true,
  iconVisible = true,
  intensity = "subtle",
}: CategoryPlaceholderProps) {
  const config = getCategoryConfig(category);
  const Icon = config.icon;
  const rgb = config.rgb;
  const opacities = INTENSITY_MAP[intensity];

  // Build gradient background — subtle uses Tailwind classes (static, scannable),
  // medium/bold use inline styles since their rgba values are computed at runtime
  const useInlineGradient = intensity !== "subtle";
  const inlineGradientStyle = useInlineGradient
    ? {
        // Opaque dark base ensures the category gradient is visible regardless of parent bg
        backgroundColor: "#111",
        backgroundImage: intensity === "bold"
          ? `linear-gradient(to bottom right, rgba(${rgb},0.45), rgba(${rgb},0.15))`
          : `linear-gradient(to bottom right, rgba(${rgb},0.25), rgba(${rgb},0.08))`,
      }
    : undefined;

  return (
    <div
      className={cn(
        "overflow-hidden",
        className
      )}
      style={inlineGradientStyle}
    >
      {/* Inner positioned container — isolates internal absolute children from consumer positioning */}
      <div
        className={cn(
          "relative w-full h-full",
          !useInlineGradient && `bg-gradient-to-br ${config.gradient}`,
        )}
      >
      {/* Light wash — gives SVG patterns contrast against dark backgrounds */}
      {intensity !== "subtle" && (
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at 50% 30%, rgba(${rgb},${intensity === "bold" ? 0.25 : 0.12}) 0%, transparent 70%)`,
          }}
        />
      )}

      {/* SVG pattern layer */}
      <div className="absolute inset-0" aria-hidden="true">
        <PatternSVG category={category} rgb={rgb} baseOpacity={opacities.base} strongOpacity={opacities.strong} />
      </div>

      {/* Optional gradient overlay for text readability */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      )}

      {/* Optional centered category icon in circle backdrop */}
      {iconVisible && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={cn(
              "rounded-full flex items-center justify-center",
              intensity === "bold"
                ? "w-24 h-24 bg-black/40 backdrop-blur-sm border border-white/10"
                : "w-16 h-16 bg-black/30 backdrop-blur-sm border border-white/8"
            )}
          >
            <Icon
              className={cn(
                intensity === "bold" ? "w-12 h-12 opacity-50" : "w-8 h-8 opacity-40",
                config.iconColor
              )}
              strokeWidth={1.5}
            />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

/* ── Pattern SVG per category ── */

function PatternSVG({ category, rgb, baseOpacity, strongOpacity }: { category?: string; rgb: string; baseOpacity: number; strongOpacity: number }) {
  const c = `rgba(${rgb},${baseOpacity})`;
  const cStrong = `rgba(${rgb},${strongOpacity})`;

  switch (category) {
    case "Movies":
      return <MoviesPattern c={c} cStrong={cStrong} />;
    case "TV":
      return <TVPattern c={c} cStrong={cStrong} />;
    case "Video Games":
      return <GamesPattern c={c} cStrong={cStrong} />;
    case "Anime":
      return <AnimePattern c={c} cStrong={cStrong} />;
    case "Books":
      return <BooksPattern c={c} cStrong={cStrong} />;
    case "Music":
      return <MusicPattern c={c} cStrong={cStrong} />;
    case "Culture":
      return <CulturePattern c={c} cStrong={cStrong} />;
    case "Tech":
      return <TechPattern c={c} cStrong={cStrong} />;
    default:
      return <DefaultPattern c={c} />;
  }
}

interface PatternProps {
  c: string;
  cStrong?: string;
}

/** Movies — Film strip perforations + diagonal light beams */
function MoviesPattern({ c, cStrong }: PatternProps) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 250">
      {/* Film strip perforations along top and bottom */}
      {Array.from({ length: 16 }).map((_, i) => (
        <g key={i}>
          <rect x={i * 25 + 4} y={4} width={10} height={14} rx={2} fill={c} />
          <rect x={i * 25 + 4} y={232} width={10} height={14} rx={2} fill={c} />
        </g>
      ))}
      {/* Horizontal film borders */}
      <rect x={0} y={20} width={400} height={2} fill={c} />
      <rect x={0} y={228} width={400} height={2} fill={c} />
      {/* Diagonal projector light beams */}
      <line x1={350} y1={0} x2={150} y2={250} stroke={cStrong} strokeWidth={50} opacity={0.3} />
      <line x1={380} y1={0} x2={180} y2={250} stroke={c} strokeWidth={30} opacity={0.4} />
      <line x1={320} y1={0} x2={120} y2={250} stroke={c} strokeWidth={20} opacity={0.3} />
    </svg>
  );
}

/** TV — Horizontal scan lines with static noise */
function TVPattern({ c, cStrong }: PatternProps) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 250">
      {/* Scan lines */}
      {Array.from({ length: 50 }).map((_, i) => (
        <rect key={i} x={0} y={i * 5} width={400} height={1.5} fill={c} />
      ))}
      {/* Static noise dots — deterministic pseudo-random positions */}
      {Array.from({ length: 40 }).map((_, i) => {
        const x = ((i * 137 + 43) % 380) + 10;
        const y = ((i * 89 + 17) % 230) + 10;
        const s = ((i * 31) % 3) + 1;
        return <rect key={`n${i}`} x={x} y={y} width={s} height={s} fill={cStrong} />;
      })}
      {/* Faint horizontal glitch bars */}
      <rect x={0} y={80} width={400} height={3} fill={cStrong} opacity={0.5} />
      <rect x={0} y={170} width={260} height={2} fill={c} opacity={0.6} />
    </svg>
  );
}

/** Video Games — Pixel grid with scattered glow dots */
function GamesPattern({ c, cStrong }: PatternProps) {
  const gridSize = 20;
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 250">
      {/* Pixel grid */}
      {Array.from({ length: 20 }).map((_, col) =>
        Array.from({ length: 13 }).map((_, row) => (
          <rect
            key={`${col}-${row}`}
            x={col * gridSize + 1}
            y={row * gridSize + 1}
            width={gridSize - 2}
            height={gridSize - 2}
            fill="none"
            stroke={c}
            strokeWidth={1}
          />
        ))
      )}
      {/* Scattered glow dots — "power-ups" */}
      {[
        [60, 40], [180, 70], [320, 50], [100, 160], [250, 140],
        [350, 190], [40, 210], [200, 200], [300, 100], [140, 110],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill={cStrong} opacity={0.9} />
      ))}
    </svg>
  );
}

/** Anime — Speed lines radiating from center */
function AnimePattern({ c, cStrong }: PatternProps) {
  const cx = 200;
  const cy = 125;
  const lineCount = 24;
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 250">
      {Array.from({ length: lineCount }).map((_, i) => {
        const angle = (i / lineCount) * Math.PI * 2;
        const innerR = 40 + (i % 3) * 15;
        const outerR = 300;
        const x1 = cx + Math.cos(angle) * innerR;
        const y1 = cy + Math.sin(angle) * innerR;
        const x2 = cx + Math.cos(angle) * outerR;
        const y2 = cy + Math.sin(angle) * outerR;
        const width = i % 2 === 0 ? 3 : 1.5;
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={i % 3 === 0 ? cStrong : c}
            strokeWidth={width}
          />
        );
      })}
      {/* Central burst */}
      <circle cx={cx} cy={cy} r={20} fill="none" stroke={cStrong} strokeWidth={1.5} />
    </svg>
  );
}

/** Books — Halftone Ben-Day dots */
function BooksPattern({ c, cStrong }: PatternProps) {
  const rows = 12;
  const cols = 18;
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 250">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: cols }).map((_, col) => {
          const x = col * 22 + (row % 2 === 0 ? 0 : 11) + 8;
          const y = row * 21 + 8;
          // Size gradient — larger toward bottom-right (screentone density)
          const dist = Math.sqrt(
            Math.pow((x - 400) / 400, 2) + Math.pow((y - 250) / 250, 2)
          );
          const r = 1.5 + (1 - dist) * 3;
          return (
            <circle
              key={`${row}-${col}`}
              cx={x} cy={y} r={r}
              fill={dist < 0.5 ? cStrong : c}
            />
          );
        })
      )}
    </svg>
  );
}

/** Music — Sound wave / EQ bar pattern */
function MusicPattern({ c, cStrong }: PatternProps) {
  // Deterministic bar heights resembling an equalizer
  const barHeights = [30, 60, 45, 80, 55, 90, 40, 70, 50, 85, 35, 75, 60, 95, 45, 65, 80, 50, 70, 40, 55, 90, 35, 60, 75, 45, 85, 50];
  const barWidth = 10;
  const gap = 4;
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 250">
      {barHeights.map((h, i) => {
        const x = i * (barWidth + gap) + 6;
        const y = 125 - h / 2;
        return (
          <rect
            key={i}
            x={x} y={y}
            width={barWidth} height={h}
            rx={2}
            fill={i % 3 === 0 ? cStrong : c}
          />
        );
      })}
      {/* Center line */}
      <line x1={0} y1={125} x2={400} y2={125} stroke={c} strokeWidth={0.5} />
    </svg>
  );
}

/** Culture — Concentric circles rippling outward */
function CulturePattern({ c, cStrong }: PatternProps) {
  const cx = 200;
  const cy = 125;
  const ringCount = 8;
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 250">
      {Array.from({ length: ringCount }).map((_, i) => {
        const r = (i + 1) * 30;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={i % 2 === 0 ? cStrong : c}
            strokeWidth={i === 0 ? 3 : 2}
            strokeDasharray={i > 4 ? "12 6" : undefined}
          />
        );
      })}
      {/* Center dot */}
      <circle cx={cx} cy={cy} r={6} fill={cStrong} />
    </svg>
  );
}

/** Tech — Circuit board traces with node dots */
function TechPattern({ c, cStrong }: PatternProps) {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 250">
      {/* Horizontal traces */}
      {[40, 80, 125, 170, 210].map((y, i) => (
        <line key={`h${i}`} x1={0} y1={y} x2={400} y2={y} stroke={c} strokeWidth={1.5} />
      ))}
      {/* Vertical traces */}
      {[50, 120, 200, 280, 350].map((x, i) => (
        <line key={`v${i}`} x1={x} y1={0} x2={x} y2={250} stroke={c} strokeWidth={1.5} />
      ))}
      {/* Right-angle connectors */}
      <polyline points="50,40 90,40 90,80" fill="none" stroke={cStrong} strokeWidth={1.5} />
      <polyline points="200,125 200,80 280,80" fill="none" stroke={cStrong} strokeWidth={1.5} />
      <polyline points="120,170 180,170 180,210" fill="none" stroke={cStrong} strokeWidth={1.5} />
      <polyline points="280,125 350,125 350,170" fill="none" stroke={cStrong} strokeWidth={1.5} />
      {/* Node dots at intersections */}
      {[
        [50, 40], [120, 80], [200, 125], [280, 80], [350, 170],
        [50, 170], [120, 125], [200, 210], [280, 170], [350, 40],
        [90, 80], [180, 170], [180, 210], [350, 125],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={4} fill={cStrong} />
      ))}
      {/* IC chip rectangles */}
      <rect x={85} y={115} width={24} height={18} rx={2} fill="none" stroke={cStrong} strokeWidth={1.5} />
      <rect x={270} y={160} width={20} height={20} rx={2} fill="none" stroke={cStrong} strokeWidth={1.5} />
    </svg>
  );
}

/** Default — Spider web radial pattern */
function DefaultPattern({ c }: { c: string }) {
  const cx = 200;
  const cy = 125;
  const spokeCount = 8;
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 250">
      {/* Spokes */}
      {Array.from({ length: spokeCount }).map((_, i) => {
        const angle = (i / spokeCount) * Math.PI * 2;
        const x2 = cx + Math.cos(angle) * 250;
        const y2 = cy + Math.sin(angle) * 250;
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke={c} strokeWidth={1} />;
      })}
      {/* Rings */}
      {[40, 80, 130, 190].map((r, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={c} strokeWidth={0.8} />
      ))}
    </svg>
  );
}
