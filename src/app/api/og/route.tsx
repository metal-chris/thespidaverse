import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

/**
 * The F1 mark, for Satori. Geometry EXTRACTED from
 * src/components/ui/SpidaverseMark.tsx rather than retyped — that component
 * paints in `currentColor`, which Satori does not resolve, so the colour has
 * to be explicit here. Regenerate if the mark changes.
 */
function SpidaverseMarkOG({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <polyline points="69.43,48.44 80.23,28.13 89.07,23.82" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="50.57,48.44 39.77,28.13 30.93,23.82" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="72.18,52.75 93.38,39.5 105.61,40.36" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="47.82,52.75 26.62,39.5 14.39,40.36" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="71.95,57.92 96.89,59.66 106.14,66.38" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="48.05,57.92 23.11,59.66 13.86,66.38" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="68.36,62.43 86.97,75.95 93.85,91.4" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="51.64,62.43 33.03,75.95 26.15,91.4" fill="none" stroke={color} strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 60 64 C 69.18 64 73.5 73 73.5 82.6 C 73.5 89.2 67.29 94 60 94 C 52.71 94 46.5 89.2 46.5 82.6 C 46.5 73 50.82 64 60 64 Z" fill={color} />
      <ellipse cx="60" cy="55" rx="12.5" ry="10" fill={color} />
      <ellipse cx="60" cy="39" rx="8.5" ry="7.5" fill={color} />
      <polygon points="108.04,79.9 79.9,108.04 40.1,108.04 11.96,79.9 11.96,40.1 40.1,11.96 79.9,11.96 108.04,40.1" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <polygon points="94.59,74.33 74.33,94.59 45.67,94.59 25.41,74.33 25.41,45.67 45.67,25.41 74.33,25.41 94.59,45.67" fill="none" stroke={color} strokeWidth="1.1" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "The Spidaverse";
  const category = searchParams.get("category") || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "60px 80px",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            background: "#E82334",
          }}
        />

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "80px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Mark beside the wordmark. The card carried the name in type
              alone, so a share preview — the most-seen surface this site has —
              was the one place the brand appeared without its mark. */}
          <SpidaverseMarkOG size={34} color="#E82334" />
          <span
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#E82334",
              letterSpacing: "-0.5px",
            }}
          >
            THE SPIDAVERSE
          </span>
        </div>

        {/* Category pill */}
        {category && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <span
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#E82334",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {category}
            </span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            fontSize: title.length > 60 ? "42px" : "56px",
            fontWeight: "bold",
            color: "#FFFFFF",
            lineHeight: 1.15,
            maxWidth: "900px",
            letterSpacing: "-1px",
          }}
        >
          {title}
        </div>

      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
