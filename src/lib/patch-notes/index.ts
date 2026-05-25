import fs from "node:fs";
import path from "node:path";

export interface PatchNote {
  slug: string;
  title: string;
  date: string;
  category: string;
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "content", "patch-notes");

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key) meta[key] = value;
  }
  return { meta, body: match[2].trim() };
}

export function getAllPatchNotes(): PatchNote[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const notes: PatchNote[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { meta, body } = parseFrontmatter(raw);
    if (!meta.title || !meta.date) continue;
    notes.push({
      slug: file.replace(/\.md$/, ""),
      title: meta.title,
      date: meta.date,
      category: meta.category || "Site",
      body,
    });
  }
  notes.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.slug.localeCompare(a.slug);
  });
  return notes;
}

const INLINE = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\w])_(.+?)_(?=[^\w]|$)/g, "$1<em>$2</em>")
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-accent text-[0.9em]">$1</code>')
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-accent underline decoration-accent/30 hover:decoration-accent">$1</a>'
    );

/** Minimal markdown → HTML for editorial patch-note bodies (paragraphs, lists, inline). */
export function renderMarkdown(body: string): string {
  const blocks = body.split(/\n{2,}/);
  const html: string[] = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (/^[-*]\s+/.test(trimmed)) {
      const items = trimmed
        .split("\n")
        .map((line) => line.replace(/^[-*]\s+/, "").trim())
        .filter(Boolean)
        .map((item) => `<li>${INLINE(item)}</li>`)
        .join("");
      html.push(`<ul class="list-disc list-inside space-y-1 text-foreground/85">${items}</ul>`);
      continue;
    }
    if (trimmed.startsWith("> ")) {
      const quote = trimmed
        .split("\n")
        .map((line) => line.replace(/^>\s?/, ""))
        .join(" ");
      html.push(
        `<blockquote class="border-l-2 border-accent pl-4 text-muted-foreground">${INLINE(quote)}</blockquote>`
      );
      continue;
    }
    html.push(`<p>${INLINE(trimmed.replace(/\n/g, " "))}</p>`);
  }
  return html.join("\n");
}
