import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import crypto from "crypto";

const VALID_PIECE_TYPES = ["image", "video"];

// Simple rate limiting via IP hash
const recentSubmissions = new Map<string, number>();

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export async function POST(request: NextRequest) {
  // Rate limit: 1 submission per 5 minutes per IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const ipHash = hashIp(ip);
  const lastSubmission = recentSubmissions.get(ipHash);
  const now = Date.now();

  if (lastSubmission && now - lastSubmission < 300_000) {
    return NextResponse.json(
      { error: "Please wait before submitting again" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();

    const { title, artist_name, artist_url, piece_type, image_url, video_url, franchise, description, submitter_email } = body;

    // Validate required fields
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!artist_name || typeof artist_name !== "string" || artist_name.trim().length === 0) {
      return NextResponse.json({ error: "Artist name is required" }, { status: 400 });
    }
    if (!piece_type || !VALID_PIECE_TYPES.includes(piece_type)) {
      return NextResponse.json({ error: "Invalid piece type" }, { status: 400 });
    }
    // Type-specific validation
    if (piece_type === "image" && (!image_url || typeof image_url !== "string")) {
      return NextResponse.json({ error: "Image URL is required for art submissions" }, { status: 400 });
    }
    if (piece_type === "video" && (!video_url || typeof video_url !== "string")) {
      return NextResponse.json({ error: "Video URL is required for video submissions" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("gallery_submissions").insert({
      title: title.trim(),
      artist_name: artist_name.trim(),
      artist_url: artist_url?.trim() || null,
      piece_type,
      image_url: image_url?.trim() || null,
      video_url: video_url?.trim() || null,
      description: description?.trim() || null,
      submitter_email: submitter_email?.trim() || null,
      status: "pending",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
    }

    recentSubmissions.set(ipHash, now);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
