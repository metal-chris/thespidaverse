import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "16", 10);
  const franchise = searchParams.get("franchise") || undefined;
  const pieceType = searchParams.get("type") || undefined;

  try {
    const provider = getProvider();
    const pieces = await provider.getGalleryPieces({
      offset,
      limit,
      franchise,
      pieceType,
    });

    return NextResponse.json({ pieces });
  } catch {
    return NextResponse.json({ pieces: [] }, { status: 500 });
  }
}
