import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "The Spidaverse";
  const category = searchParams.get("category") || "";
  const rating = searchParams.get("rating") || "";

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

        {/* Rating */}
        {rating && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "24px",
            }}
          >
            <span
              style={{
                fontSize: "32px",
                fontWeight: "bold",
                color: "#E82334",
              }}
            >
              {rating}
            </span>
            <span style={{ fontSize: "18px", color: "#666" }}>/100</span>
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
