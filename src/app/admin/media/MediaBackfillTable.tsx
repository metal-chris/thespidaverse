"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AdminArticle {
  _id: string;
  title: string;
  slug: string;
  categoryTitle?: string;
  heroUrl: string | null;
  hasHero: boolean;
}

type RowStatus =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "error"; message: string };

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ANALYTICS_PASSWORD;

export function MediaBackfillTable({ articles }: { articles: AdminArticle[] }) {
  const [items, setItems] = useState(articles);
  const [statuses, setStatuses] = useState<Record<string, RowStatus>>({});
  const [filter, setFilter] = useState<"all" | "missing" | "present">("missing");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    let missing = 0;
    let present = 0;
    for (const a of items) {
      if (a.hasHero) present++;
      else missing++;
    }
    return { missing, present, total: items.length };
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((a) => {
      if (filter === "missing" && a.hasHero) return false;
      if (filter === "present" && !a.hasHero) return false;
      if (q) {
        const hay = `${a.title} ${a.categoryTitle || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, filter, query]);

  const setStatus = useCallback((id: string, status: RowStatus) => {
    setStatuses((s) => ({ ...s, [id]: status }));
  }, []);

  const uploadFor = useCallback(
    async (article: AdminArticle, file: File) => {
      setStatus(article._id, { kind: "uploading" });
      // Defensive client-side cap: Netlify Functions reject sync request
      // bodies over ~6 MB before our route runs. Only resize when the file
      // would actually fail — pass small/in-spec files through untouched
      // to avoid an extra lossy JPEG pass.
      let upload: File;
      try {
        upload = await maybeDownscaleImage(file);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setStatus(article._id, { kind: "error", message: `Resize failed: ${message}` });
        return;
      }
      const form = new FormData();
      form.append("articleId", article._id);
      form.append("file", upload);

      try {
        const res = await fetch("/api/admin/media-backfill", {
          method: "POST",
          headers: ADMIN_PASSWORD ? { "x-admin-password": ADMIN_PASSWORD } : {},
          body: form,
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `HTTP ${res.status}`);
        }
        const body = (await res.json()) as { ok?: boolean; url?: string };
        if (body.ok && body.url) {
          setItems((list) =>
            list.map((a) =>
              a._id === article._id
                ? { ...a, hasHero: true, heroUrl: body.url || a.heroUrl }
                : a
            )
          );
          setStatus(article._id, { kind: "idle" });
        } else {
          throw new Error("Upload succeeded but response was missing url");
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setStatus(article._id, { kind: "error", message });
      }
    },
    [setStatus]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Media Backfill</h1>
          <p className="text-sm text-muted-foreground">
            Drag/drop or click to upload a hero image for any article. Writes
            directly to Sanity via the admin write token.
          </p>
        </header>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title or category…"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent text-sm"
          />
          <div className="flex gap-1 rounded-lg border border-border p-1 bg-card">
            {(
              [
                { key: "missing", label: `Missing (${counts.missing})` },
                { key: "present", label: `Present (${counts.present})` },
                { key: "all", label: `All (${counts.total})` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                onClick={() => setFilter(opt.key)}
                className={cn(
                  "px-3 py-1.5 rounded text-xs font-medium transition-colors",
                  filter === opt.key
                    ? "bg-accent text-background"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">
            No articles match the current filter.
          </p>
        ) : (
          <ul className="grid gap-3">
            {filtered.map((article) => (
              <ArticleRow
                key={article._id}
                article={article}
                status={statuses[article._id] || { kind: "idle" }}
                onUpload={(file) => uploadFor(article, file)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function ArticleRow({
  article,
  status,
  onUpload,
}: {
  article: AdminArticle;
  status: RowStatus;
  onUpload: (file: File) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (file) onUpload(file);
    },
    [onUpload]
  );

  return (
    <li
      className={cn(
        "relative flex gap-4 p-3 rounded-xl border bg-card transition-colors",
        dragOver
          ? "border-accent ring-2 ring-accent/30"
          : "border-border hover:border-accent/30"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted/30 ring-1 ring-border">
        {article.heroUrl ? (
          <Image
            src={article.heroUrl}
            alt=""
            fill
            sizes="96px"
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase tracking-wider text-muted-foreground">
            Missing
          </div>
        )}
      </div>

      {/* Title + meta */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-base leading-snug">
          <a
            href={`/articles/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-foreground hover:text-accent transition-colors"
          >
            {article.title}
            <ExternalLink className="w-3.5 h-3.5 opacity-60" strokeWidth={2} />
          </a>
        </h3>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
          {article.categoryTitle && <span>{article.categoryTitle}</span>}
          <span className="opacity-50">·</span>
          <code className="font-mono">{article.slug}</code>
        </div>
        {status.kind === "error" && (
          <p className="mt-2 text-xs text-red-400">Error: {status.message}</p>
        )}
      </div>

      {/* Drop zone / action */}
      <div className="flex flex-col items-end justify-center gap-1.5 min-w-[140px]">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status.kind === "uploading"}
          className={cn(
            "px-3 py-1.5 rounded-md text-xs font-medium border transition-colors",
            status.kind === "uploading"
              ? "border-border bg-muted text-muted-foreground cursor-wait"
              : "border-accent/40 bg-accent/10 text-accent hover:bg-accent/20"
          )}
        >
          {status.kind === "uploading" ? "Uploading…" : article.hasHero ? "Replace" : "Upload"}
        </button>
        <span className="text-[10px] text-muted-foreground">
          {dragOver ? "Drop to upload" : "or drag image here"}
        </span>
      </div>
    </li>
  );
}

// Netlify Functions cap sync request bodies at ~6 MB; uploads over that
// surface as a bare HTTP 500. Pass small in-spec files through untouched;
// only re-encode when the file would otherwise fail or the source exceeds
// 4K on its longest edge (no display path benefits from more pixels).
const MAX_LONGEST_EDGE = 3840;
const PLATFORM_LIMIT_BYTES = 5.5 * 1024 * 1024;

async function maybeDownscaleImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.size <= PLATFORM_LIMIT_BYTES) {
    // Probe dims before deciding — small bytes but huge dims is rare for
    // JPEGs but possible for PNGs, and serving a 7000px PNG to the hero is
    // wasteful regardless of bytes.
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    if (longest <= MAX_LONGEST_EDGE) return file;
    return encodeAt(bitmap, MAX_LONGEST_EDGE / longest, 0.92, file.name);
  }
  const bitmap = await createImageBitmap(file);
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = Math.min(1, MAX_LONGEST_EDGE / longest);
  return encodeAt(bitmap, scale, 0.92, file.name);
}

async function encodeAt(
  bitmap: ImageBitmap,
  scale: number,
  quality: number,
  originalName: string
): Promise<File> {
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas 2D context unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality)
  );
  if (!blob) throw new Error("canvas.toBlob returned null");
  const newName = originalName.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
