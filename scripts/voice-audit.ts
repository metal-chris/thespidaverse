/**
 * Voice audit — the tic thresholds from content-authoring-workflow.md, made runnable.
 *
 * The doc already describes this script ("Audit script pattern: strip frontmatter,
 * source definitions, headings and blockquotes, then count per 1,000 words") and
 * already carries the measured rates. This encodes them; it does not derive new ones.
 *
 * That distinction matters. The doc's "baseline problem" warning is explicit: the
 * published posts were written through the same co-authoring workflow, so measuring a
 * draft against them compares AI output to AI output. That reasoning was used in
 * Aug 2026 to argue "it's not X, it's Y" was his voice, and it was wrong. So:
 *
 *   - Corpus-derived numbers are used for MECHANICS only (rhythm, paragraph shape).
 *   - Anything on the external AI-tell checklist is judged against the checklist,
 *     never licensed by appearing in the corpus.
 *
 * Two deliberate non-rules:
 *   - `not X, but Y` INLINE is genuinely his (0.32 vs 0.08 in drafts). Not flagged.
 *     The tic is the paragraph-level antithesis, which is flagged at zero tolerance.
 *   - Em dashes in TITLES are house style. Only body prose is counted.
 *
 * Usage:
 *   npx tsx scripts/voice-audit.ts <file.md ...>       # markdown posts
 *   npx tsx scripts/voice-audit.ts --seed <file.ts>    # a seed script's p()/h2() prose
 *   npx tsx scripts/voice-audit.ts --calibrate         # check against the reference posts
 */
import { readFileSync } from "fs";

export interface VoiceReport {
  name: string;
  words: number;
  /** Per 1,000 words unless noted. */
  rates: Record<string, number>;
  /** Absolute counts that should be zero-ish. */
  absolute: Record<string, number>;
  /** Antithesis hits, verbatim, for the doc's concreteness test. */
  antithesis: string[];
  failures: string[];
}

/** Ceilings, transcribed from the doc's "Measured tic thresholds" table. */
const CEILINGS: Record<string, number> = {
  "single-sentence paragraphs": 2.3,
  "And/But paragraph openers": 1.4,
  ", which is pivot": 0.6,
  "Here's paragraph openers": 0.7,
  "paragraph antithesis": 0,
  "instructional imperatives": 0,
};

/** From the external AI-tell checklist, not from the corpus. */
const AI_VOCAB = /\b(crucial|delve|intricate|interplay|tapestry|testament|meticulous|pivotal|underscores?|garner(?:ed|s)?|vibrant|boasts|landscape|robust|seamless|leverag(?:e|ing)|nuanced|multifaceted)\b/gi;
const COPULA_AVOID = /\b(serves as|stands as|functions as|represents|boasts|features a|offers a)\b/gi;
const PARTICIPLE_TAIL = /,\s+(creating|highlighting|ensuring|reflecting|fostering|showcasing|underscoring)\b/gi;
const PUFFERY = /\b(is a testament to|cannot be overstated|marks a shift|key turning point)\b/gi;
const VAGUE_ATTRIB = /\b(industry reports|observers have cited|experts argue|some critics argue|many believe)\b/gi;

/** Strip what the doc says to strip, then split into paragraphs. */
export function paragraphsFromMarkdown(md: string): string[] {
  let s = md.replace(/^---\n[\s\S]*?\n---\n/, ""); // frontmatter
  s = s.replace(/^\s{0,3}>.*$/gm, ""); // blockquotes
  s = s.replace(/^\s{0,3}#{1,6}\s.*$/gm, ""); // headings
  s = s.replace(/^\s*\[[^\]]+\]:\s*\S+.*$/gm, ""); // link/source definitions
  s = s.replace(/```[\s\S]*?```/g, ""); // code
  return s
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, " ").trim())
    .filter((p) => p.length > 0 && !/^[-*|]/.test(p)); // drop lists and tables
}

/**
 * Prose out of a seed script. Headings excluded.
 *
 * Handles both shapes in the wild: the `p("...")` helper most scripts use, and
 * the inline `{ _type: "span", text: "..." }` construction PR #7 uses. Missing
 * the second shape made that file report zero words and therefore PASS, which
 * is worse than a false failure — a silent pass is how prose ships unaudited.
 */
export function paragraphsFromSeed(src: string): string[] {
  const out: string[] = [];
  const helper = /(?:^|[\s,([])p\(\s*"((?:[^"\\]|\\.)*)"/g;
  let m: RegExpExecArray | null;
  while ((m = helper.exec(src))) out.push(m[1]);
  if (!out.length) {
    // Inline spans: pull the paragraph strings fed to the span builder.
    const span = /\btext:\s*"((?:[^"\\]|\\.){40,})"/g;
    while ((m = span.exec(src))) out.push(m[1]);
    const arr = /(?:^|[\s[(,])"((?:[^"\\]|\\.){60,})"/g;
    while ((m = arr.exec(src))) out.push(m[1]);
  }
  return out
    .map((t) => t.replace(/\\"/g, '"').replace(/\\n/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

const sentences = (p: string) => p.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 1);

export function audit(name: string, paras: string[]): VoiceReport {
  const text = paras.join("\n\n");
  const words = text.split(/\s+/).filter(Boolean).length;
  const per1k = (n: number) => (words ? (n * 1000) / words : 0);

  const singles = paras.filter((p) => sentences(p).length === 1).length;
  const andBut = paras.filter((p) => /^(And|But)\b/.test(p)).length;
  const heres = paras.filter((p) => /^Here'?s\b/i.test(p)).length;
  const whichIs = (text.match(/,\s+which is\b/gi) || []).length;
  // Paragraph-level antithesis: a negation immediately answered by its mirror.
  /* Reported verbatim rather than merely counted. The doc's rule is a judgement,
     not a threshold: "can the reader hold a concrete substitute?" — "It isn't the
     train, it's the swing" survives, abstract-versus-abstract does not. Note the
     reference corpus itself scores 0.46/1k here against a documented 0.00, which
     is the contamination the baseline warning describes, not a licence. */
  const antithesisHits = (text.match(/\b(?:That'?s|It'?s|This is)\s+not\b[^.!?]*[.!?]\s+(?:That'?s|It'?s|This is)\b[^.!?]*[.!?]/gi) || [])
    .map((h) => h.replace(/\s+/g, " ").trim());
  const antithesis = antithesisHits.length;
  const imperatives = (text.match(/\b(?:Sit with that|Look at what|Notice how)\b/gi) || []).length;

  const rates: Record<string, number> = {
    "single-sentence paragraphs": per1k(singles),
    "And/But paragraph openers": per1k(andBut),
    ", which is pivot": per1k(whichIs),
    "Here's paragraph openers": per1k(heres),
    "paragraph antithesis": per1k(antithesis),
    "instructional imperatives": per1k(imperatives),
  };

  const absolute: Record<string, number> = {
    "em dashes in body": (text.match(/—/g) || []).length,
    "AI vocabulary": (text.match(AI_VOCAB) || []).length,
    "copula avoidance": (text.match(COPULA_AVOID) || []).length,
    "participle tails": (text.match(PARTICIPLE_TAIL) || []).length,
    "significance puffery": (text.match(PUFFERY) || []).length,
    "vague attribution": (text.match(VAGUE_ATTRIB) || []).length,
  };

  const failures: string[] = [];
  for (const [k, ceiling] of Object.entries(CEILINGS)) {
    if (rates[k] > ceiling) failures.push(`${k} ${rates[k].toFixed(2)}/1k > ${ceiling}`);
  }
  // Em dashes are an absolute rule, not a rate: published posts run 0-2.
  if (absolute["em dashes in body"] > 2) {
    failures.push(`em dashes in body ${absolute["em dashes in body"]} > 2`);
  }
  for (const k of ["AI vocabulary", "copula avoidance", "participle tails", "significance puffery", "vague attribution"]) {
    if (absolute[k] > 0) failures.push(`${k} ${absolute[k]}`);
  }

  return { name, words, rates, absolute, antithesis: antithesisHits, failures };
}

export function render(r: VoiceReport): string {
  const head = `${r.name}  (${r.words}w)`;
  const rateLines = Object.entries(r.rates)
    .map(([k, v]) => {
      const c = CEILINGS[k];
      const flag = v > c ? "  ✗" : "";
      return `    ${k.padEnd(28)} ${v.toFixed(2).padStart(5)}/1k  (ceiling ${c})${flag}`;
    })
    .join("\n");
  const absLines = Object.entries(r.absolute)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `    ${k.padEnd(28)} ${String(v).padStart(5)}`)
    .join("\n");
  const anti = r.antithesis.length
    ? "\n" + r.antithesis.map((a) => `    antithesis? ${a.slice(0, 96)}`).join("\n")
    : "";
  return `${head}\n${rateLines}${absLines ? "\n" + absLines : ""}${anti}\n    ${
    r.failures.length ? `FAIL: ${r.failures.join("; ")}` : "PASS"
  }\n`;
}

/* ── CLI ───────────────────────────────────────────────────────── */
if (require.main === module) {
  const args = process.argv.slice(2);
  const seedMode = args.includes("--seed");
  const files = args.filter((a) => !a.startsWith("--"));
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    const paras = seedMode ? paragraphsFromSeed(src) : paragraphsFromMarkdown(src);
    process.stdout.write(render(audit(f.split("/").pop() ?? f, paras)));
  }
}
