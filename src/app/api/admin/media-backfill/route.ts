import { NextResponse, type NextRequest } from "next/server";
import { writeClient } from "@/lib/sanity/writeClient";

/**
 * POST /api/admin/media-backfill
 *
 * multipart/form-data:
 *   - articleId: string   — Sanity _id of the article to patch
 *   - file: File          — image to upload as the new heroImage
 *   - alt?: string        — optional alt text for the image
 *
 * Headers:
 *   - x-admin-password    — matched against NEXT_PUBLIC_ANALYTICS_PASSWORD
 *
 * Uploads the file as a Sanity asset, then patches the article's
 * heroImage to reference it. Returns the new asset id + URL.
 */
export async function POST(request: NextRequest) {
  const adminPassword = process.env.NEXT_PUBLIC_ANALYTICS_PASSWORD;

  // If a password is configured, require it. If unset (dev), allow through.
  if (adminPassword) {
    const provided = request.headers.get("x-admin-password");
    if (provided !== adminPassword) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  if (!writeClient) {
    return NextResponse.json(
      { error: "Sanity write client not configured (missing token or project ID)" },
      { status: 500 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const articleId = formData.get("articleId");
  const file = formData.get("file");
  const alt = formData.get("alt");

  if (typeof articleId !== "string" || !articleId) {
    return NextResponse.json({ error: "articleId is required" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file is required" }, { status: 400 });
  }

  // Basic file validation
  if (!file.type.startsWith("image/")) {
    return NextResponse.json(
      { error: `Unsupported file type: ${file.type} (image/* required)` },
      { status: 400 }
    );
  }
  const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB; max 15 MB)` },
      { status: 400 }
    );
  }

  try {
    // 1. Upload the asset
    const buffer = Buffer.from(await file.arrayBuffer());
    const asset = await writeClient.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    // 2. Patch the article to reference it
    await writeClient
      .patch(articleId)
      .set({
        heroImage: {
          _type: "image",
          asset: { _type: "reference", _ref: asset._id },
          ...(typeof alt === "string" && alt ? { alt } : {}),
        },
      })
      .commit();

    return NextResponse.json({
      ok: true,
      assetId: asset._id,
      url: asset.url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Sanity write failed: ${message}` },
      { status: 500 }
    );
  }
}
