"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { PortableText, type PortableTextComponents as PTComponents } from "@portabletext/react";
import { useTranslations } from "next-intl";
import { urlFor } from "@/lib/sanity/image";
import { cn, slugify } from "@/lib/utils";
import { WebRating } from "./WebRating";
import { SourceLink } from "./SourceLink";
import { TierMaker } from "./TierMaker";
import type { TierChipAspect, TierEntry, TierListBlock, TierRow } from "@/types";

/**
 * Tier list chart + capsules (`_type: "tierList"`).
 *
 * Phase 0 shipped the read-only chart: S/A/B/… rows of chips whose rank badges
 * run 1–N across tiers, deep-linking to headings. Phase 1 makes the chart the
 * reading surface: every chip opens a capsule — bottom sheet on touch, a
 * two-pane dialog on desktop — carrying the entry's write-up, rating, and
 * links. `mode: "capsule"` blocks keep the write-ups in the entries; `"index"`
 * blocks (the default, and every phase-0 block) show an excerpt plus the
 * anchor jump instead of teleporting blind.
 *
 * Phase 2 (the Maker) builds on this in place: the dialog becomes its
 * inspection surface, the sheet's gestures seed drag-to-rearrange, and the
 * `#tl-<key>` deep links grow into URL-encoded arrangements.
 */

// The classic tier ramp. Fixed rather than theme-derived on purpose: this is
// recognizable tier-list iconography, and it sits on the dark card in all
// three site themes. Schema `color` overrides per tier.
export const TIER_COLORS: Record<string, string> = {
  S: "#E85A4F",
  A: "#E8944F",
  B: "#E8C94F",
  C: "#6FC46F",
  D: "#5FA8DC",
  E: "#4FC4B0",
  F: "#A66FC4",
};

export const ASPECT_CHIP: Record<TierChipAspect, string> = {
  poster: "w-16 sm:w-20 aspect-[2/3]",
  square: "w-[4.2rem] sm:w-[4.8rem] aspect-square",
  wide: "w-[6rem] sm:w-[7rem] aspect-video",
};

/**
 * The desktop dialog's art panel. It must carry its own aspect: the panel is a
 * grid cell, so with only `min-h-full` its height comes from the row, and a
 * short capsule collapses a 2:3 poster into a square that `object-cover` then
 * crops. Locking the aspect makes the panel's height derive from the column
 * width instead, which holds for every art shape a tier list might use.
 */
const ASPECT_DIALOG: Record<TierChipAspect, string> = {
  poster: "aspect-[2/3]",
  square: "aspect-square",
  wide: "aspect-video",
};

/** Landscape art needs a wider column to read at all. */
const DIALOG_COLS: Record<TierChipAspect, string> = {
  poster: "sm:grid-cols-[minmax(10rem,13rem)_1fr]",
  square: "sm:grid-cols-[minmax(10rem,13rem)_1fr]",
  wide: "sm:grid-cols-[minmax(15rem,19rem)_1fr]",
};

/**
 * The sheet's art, which sits beside the details rather than above them.
 *
 * The sheet has no equivalent of the dialog's art panel, so this is the only
 * place the poster reads at a usable size on touch. It is deliberately ~2x the
 * old thumbnail: at `w-11` the art was a bullet point next to the title, which
 * wastes the one axis a bottom sheet has to spare. Kept under ~7rem so the
 * title column beside it never collapses to two words a line on a 360px
 * screen — the narrowest phone worth designing for.
 */
const ASPECT_SHEET: Record<TierChipAspect, string> = {
  poster: "w-24 aspect-[2/3]",
  square: "w-24 aspect-square",
  wide: "w-32 aspect-video",
};

/** Capsule write-ups allow normal text, bold/italic, and links — so source
 * citation cards work inside capsules. Defined locally (not the full article
 * serializer set) to keep the module graph acyclic. */
const capsuleComponents: PTComponents = {
  marks: {
    link: ({ children, value }) => <SourceLink value={value}>{children}</SourceLink>,
  },
};

interface FlatEntry {
  entry: TierEntry;
  tier: TierRow;
  rank: number;
}

function flatten(tiers: TierRow[]): FlatEntry[] {
  const out: FlatEntry[] = [];
  let rank = 0;
  for (const tier of tiers) {
    for (const entry of tier.entries ?? []) {
      rank += 1;
      out.push({ entry, tier, rank });
    }
  }
  return out;
}

export function tierColor(tier: TierRow): string {
  return tier.color || TIER_COLORS[tier.label] || "#8A8A8A";
}

export function entryImageUrl(entry: TierEntry, width: number): string {
  let url = "";
  if (entry.image) {
    try {
      url = urlFor(entry.image).width(width).url() || "";
    } catch {
      // Mock data has fake asset refs — fall back to mockUrl below
    }
    if (!url) url = entry.image.mockUrl || "";
  }
  return url;
}

/* ── Scrollable capsule body with the line-and-dot rail ─────────── */

function CapsuleBody({
  children,
  labelledBy,
  shell,
}: {
  children: React.ReactNode;
  labelledBy: string;
  /** Which shell owns the scroll box — the two bound their height differently.
   *  Dialog: the grid row is `minmax(0,1fr)`, so a definite track height flows
   *  down and `h-full` resolves. Sheet: the panel is sized by its CONTENT under
   *  a `max-h-[86%]` cap, so no ancestor has a definite height and a percentage
   *  height silently resolves to `auto` — the box grows to its content, the
   *  panel clips it, and it never scrolls. A viewport-relative max-height is the
   *  only bound that holds there, and it keeps short capsules hugging their
   *  content instead of forcing a full-height sheet. */
  shell: "dialog" | "sheet";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [progress, setProgress] = useState(0);
  const [atEnd, setAtEnd] = useState(false);
  /** Visible fraction of the content — the thumb's share of the track, exactly
   *  as a native scrollbar sizes itself. A fixed-size dot cannot say how much
   *  is left to read; a proportional thumb says it at a glance. */
  const [ratio, setRatio] = useState(1);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const range = el.scrollHeight - el.clientHeight;
    const can = range > 4;
    setScrollable(can);
    setProgress(can ? el.scrollTop / range : 0);
    setAtEnd(!can || range - el.scrollTop <= 4);
    setRatio(el.scrollHeight > 0 ? el.clientHeight / el.scrollHeight : 1);
  }, []);

  useEffect(() => {
    sync();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [sync, children]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={ref}
        onScroll={sync}
        tabIndex={scrollable ? 0 : -1}
        role={scrollable ? "region" : undefined}
        aria-labelledby={labelledBy}
        className={cn(
          "source-scroll overflow-y-auto overscroll-contain px-4 pb-3 pt-1 text-[0.9rem] leading-[1.62] text-card-foreground focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent [&_p]:m-0 [&_p]:mb-[0.7em] [&_p:last-child]:mb-0 [&_strong]:text-accent",
          // `touch-pan-y` re-grants vertical touch scrolling inside the sheet,
          // whose panel sets `touch-none` so the swipe-to-close / swipe-to-nav
          // pointer gestures work. Without it the body is unscrollable by
          // finger — the gesture handler swallows the drag.
          shell === "sheet" ? "max-h-[60vh] touch-pan-y" : "h-full"
        )}
      >
        {children}
      </div>
      {scrollable && (
        <div
          className="pointer-events-none absolute bottom-1.5 right-1.5 top-1.5 w-1.5 rounded-full bg-muted-foreground/20"
          aria-hidden="true"
        >
          {/* Thumb height and offset are driven by one custom property so the
              two can never disagree: `top` has to subtract the thumb's own
              height to land flush with the track's end at progress 1, and the
              height is `max()`-clamped so a very long write-up still leaves
              something big enough to see. Doing that arithmetic in calc keeps
              it exact at every ratio instead of approximating in JS. */}
          <span
            className="source-rail-thumb absolute inset-x-0 rounded-full bg-accent"
            style={
              {
                "--thumb": `max(1.75rem, ${(ratio * 100).toFixed(2)}%)`,
                height: "var(--thumb)",
                top: `calc(${progress.toFixed(4)} * (100% - var(--thumb)))`,
              } as React.CSSProperties
            }
          />
        </div>
      )}
      {scrollable && !atEnd && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-transparent to-card"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/* ── The tier badge, and the note it can carry ───────────────────── */

/**
 * The tier badge. Inert unless the tier carries a `description`, in which case
 * it becomes a disclosure for that note.
 *
 * Three input models, one control. A hover-only tooltip would be invisible on
 * every phone and tablet — touch has no hover — and unreachable by keyboard, so
 * the note is a real <button>: pointer-enter opens it for a MOUSE only (gated
 * on pointerType, or a tap would both open it via enter and close it via the
 * click that follows), focus opens it for the keyboard, and click toggles it
 * for touch and for anyone who prefers clicking. Escape and an outside press
 * close it.
 *
 * The panel is portalled to the body because the chart's <figure> clips its
 * overflow — rendered in place, the note would be cropped at the row edge — and
 * it is positioned from the badge's own rect, flipping above the badge when
 * there is no room below and clamping to the viewport so it never hangs off a
 * narrow screen.
 */
function TierBadge({ tier }: { tier: TierRow }) {
  const t = useTranslations("tierList");
  const note = tier.description;
  const hasNote = Array.isArray(note) && note.length > 0;

  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const panelId = `tier-note-${tier._key}`;

  const place = useCallback(() => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.min(320, window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));
    // Flip above when the space below cannot hold a reasonable panel.
    const below = window.innerHeight - r.bottom;
    const top = below < 180 && r.top > below ? Math.max(8, r.top - 8) : r.bottom + 8;
    setPos({ top, left });
  }, []);

  const show = useCallback(() => {
    place();
    setOpen(true);
  }, [place]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    // Reposition rather than drift: the panel is fixed, so a scroll would
    // otherwise leave it stranded away from its badge.
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  const swatch = {
    backgroundColor: tierColor(tier),
    color: "#141414",
  } as React.CSSProperties;

  if (!hasNote) {
    return (
      <div
        className="grid w-12 flex-none place-items-center text-xl font-black sm:w-16"
        style={swatch}
      >
        {tier.label}
      </div>
    );
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={t("tierNote", { label: tier.label })}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") show();
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") setOpen(false);
        }}
        onFocus={show}
        onBlur={() => setOpen(false)}
        onClick={() => (open ? setOpen(false) : show())}
        className="grid w-12 flex-none cursor-help place-items-center text-xl font-black underline decoration-black/35 decoration-dotted underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black sm:w-16"
        style={swatch}
      >
        {tier.label}
      </button>
      {open &&
        pos &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="note"
            className="fixed z-[110] w-[min(20rem,calc(100vw-1rem))] rounded-lg border border-border bg-card p-3 text-[0.85rem] leading-[1.6] text-card-foreground shadow-[0_16px_44px_rgba(0,0,0,0.55)] [&_p]:m-0 [&_p]:mb-[0.6em] [&_p:last-child]:mb-0 [&_strong]:text-accent"
            style={{ top: pos.top, left: pos.left }}
          >
            <p className="mb-1.5 text-[0.7rem] font-bold uppercase tracking-widest text-muted-foreground">
              {t("tierHeading", { label: tier.label })}
            </p>
            <PortableText value={note} components={capsuleComponents} />
          </div>,
          document.body
        )}
    </>
  );
}

/* ── The capsule (shared by dialog and sheet shells) ────────────── */

function CapsuleContent({
  item,
  total,
  mode,
  aspect,
  shell,
  onNav,
  onClose,
}: {
  item: FlatEntry;
  total: number;
  mode: "index" | "capsule";
  aspect: TierChipAspect;
  shell: "dialog" | "sheet";
  onNav: (delta: number) => void;
  onClose: () => void;
}) {
  const t = useTranslations("tierList");
  const { entry, tier, rank } = item;
  const titleId = `tl-cap-title-${entry._key}`;
  const label = entry.subtitle ?? entry.year;
  const excerpt = mode === "index" ? entry.content?.slice(0, 1) : undefined;
  const bodyContent = mode === "capsule" ? entry.content : excerpt;
  const posterUrl = entryImageUrl(entry, shell === "dialog" ? 480 : 288);

  return (
    <>
      {shell === "dialog" && (
        <div
          className={cn(
            "relative hidden self-start overflow-hidden bg-muted sm:block",
            ASPECT_DIALOG[aspect]
          )}
        >
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt=""
              fill
              sizes="(max-width: 640px) 0px, 300px"
              className="object-cover"
            />
          ) : (
            <span className="absolute inset-0 grid place-items-center p-3 text-center text-xs text-muted-foreground">
              {entry.title}
            </span>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        {/* Art beside the details, not above them. The details were previously
            siblings of the poster in one wrap container, so the `basis-full`
            title always broke to the line below the art and pinned the art to
            thumbnail width. Nesting them in their own column frees the poster
            to take real space while the title still wraps within what is left. */}
        <div className="flex items-start gap-3 px-4 pb-2 pt-3.5">
          {shell === "sheet" && (
            <span
              className={cn(
                "relative flex-none overflow-hidden rounded bg-muted ring-1 ring-border",
                ASPECT_SHEET[aspect]
              )}
            >
              {posterUrl ? (
                <Image src={posterUrl} alt="" fill sizes="128px" className="object-cover" />
              ) : (
                <span className="absolute inset-0 grid place-items-center p-1 text-center text-[10px] leading-tight text-muted-foreground">
                  {entry.title}
                </span>
              )}
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <span
              className="rounded px-1.5 py-1 text-sm font-black leading-none"
              style={{ backgroundColor: tierColor(tier), color: "#141414" }}
            >
              {tier.label}
            </span>
            <span className="font-mono text-xs font-bold tabular-nums text-muted-foreground">
              #{rank}
            </span>
            {typeof entry.rating === "number" && (
              <span className="ml-auto">
                <WebRating score={entry.rating} variant="badge" />
              </span>
            )}
            <span id={titleId} className="basis-full text-[1.02rem] font-bold leading-snug text-card-foreground">
              {entry.title}
            </span>
            {label && <span className="-mt-1.5 text-xs text-muted-foreground">{label}</span>}
          </div>
        </div>

        <CapsuleBody labelledBy={titleId} shell={shell}>
          {bodyContent?.length ? (
            <PortableText value={bodyContent} components={capsuleComponents} />
          ) : null}
          {mode === "index" && entry.anchor && (
            <p className="!mt-3 font-semibold">
              <a
                href={`#${entry.anchor}`}
                onClick={onClose}
                className="text-accent no-underline hover:underline"
              >
                {t("readFull")} ↓
              </a>
            </p>
          )}
          {mode === "capsule" && entry.href && (
            <p className="!mt-3 font-semibold">
              <a href={entry.href} className="text-accent no-underline hover:underline">
                {t("fullReview")} →
              </a>
            </p>
          )}
        </CapsuleBody>

        {/* Footer contract: previous left, counter centered, next right. */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-border px-4 py-2.5">
          <button
            type="button"
            disabled={rank === 1}
            onClick={() => onNav(-1)}
            className="justify-self-start rounded border border-border bg-muted px-2.5 py-1.5 text-xs font-semibold text-card-foreground hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-40"
          >
            ← {t("previous")}
          </button>
          <span aria-live="polite" className="font-mono text-xs font-semibold tabular-nums text-muted-foreground">
            {t("counter", { n: rank, total })}
          </span>
          <button
            type="button"
            disabled={rank === total}
            onClick={() => onNav(1)}
            className="justify-self-end rounded border border-border bg-muted px-2.5 py-1.5 text-xs font-semibold text-card-foreground hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:cursor-default disabled:opacity-40"
          >
            {t("next")} →
          </button>
        </div>
      </div>
    </>
  );
}

/* ── The chart ──────────────────────────────────────────────────── */

export function TierListChart({ value }: { value: TierListBlock }) {
  const t = useTranslations("tierList");
  const mode = value.mode ?? "index";
  const aspect = value.chipAspect ?? "poster";
  const items = useMemo(() => flatten(value.tiers ?? []), [value.tiers]);
  const hasCapsuleContent = items.some((i) => i.entry.content?.length);

  const [mounted, setMounted] = useState(false);
  const [openIdx, setOpenIdx] = useState<number>(-1);
  const [isTouch, setIsTouch] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(hover: none)");
    const apply = () => setIsTouch(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const open = useCallback(
    (idx: number, opener?: HTMLButtonElement) => {
      if (idx < 0 || idx >= items.length) return;
      if (opener) openerRef.current = opener;
      setOpenIdx(idx);
    },
    [items]
  );

  const close = useCallback(() => {
    setOpenIdx(-1);
    if (location.hash.startsWith("#tl-")) {
      history.replaceState(null, "", location.pathname + location.search);
    }
    openerRef.current?.focus();
  }, []);

  const nav = useCallback(
    (delta: number) => {
      setOpenIdx((cur) => {
        const next = cur + delta;
        return next < 0 || next >= items.length ? cur : next;
      });
    },
    [items]
  );

  // Hash sync lives in an effect, never inside a state updater: Next patches
  // history.replaceState, so calling it mid-render is a Router setState.
  useEffect(() => {
    if (openIdx < 0) return;
    history.replaceState(null, "", `#tl-${items[openIdx].entry._key}`);
  }, [openIdx, items]);

  // Deep link: a URL arriving with #tl-<key> opens that capsule.
  useEffect(() => {
    if (!mounted || !location.hash.startsWith("#tl-")) return;
    const key = location.hash.slice(4);
    const idx = items.findIndex((i) => i.entry._key === key);
    if (idx >= 0) setOpenIdx(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // Keyboard: Esc closes, arrows travel the ranking, Tab stays in the dialog.
  useEffect(() => {
    if (openIdx < 0) return;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") close();
      else if (ev.key === "ArrowRight") nav(1);
      else if (ev.key === "ArrowLeft") nav(-1);
      else if (ev.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex="0"]'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (ev.shiftKey && document.activeElement === first) {
          last.focus();
          ev.preventDefault();
        } else if (!ev.shiftKey && document.activeElement === last) {
          first.focus();
          ev.preventDefault();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openIdx, close, nav]);

  // Focus lands inside the dialog when it opens.
  useEffect(() => {
    if (openIdx < 0 || isTouch) return;
    const f = dialogRef.current?.querySelector<HTMLElement>("button:not([disabled])");
    f?.focus();
  }, [openIdx, isTouch]);

  if (!value?.tiers?.length) return null;

  let rank = 0;
  const openItem = openIdx >= 0 ? items[openIdx] : null;

  return (
    <>
      <figure className="not-prose my-10 overflow-hidden rounded-lg ring-1 ring-border">
        {/* A real <h2> inside the figcaption, not styled text. The chart is a
            named section of the article — often the one readers want most —
            but the TOC is built from `style: h2 | h3` blocks, and a tierList
            block carries no style, so the chart was the one destination "Jump
            to section" could not offer. The caption styling is unchanged; only
            the semantics and the anchor id are new. `scroll-mt-24` matches the
            body headings so the sticky header never covers the target. */}
        {value.title && (
          <figcaption className="border-b border-border bg-card px-4 py-2.5">
            <h2
              id={slugify(value.title)}
              className="scroll-mt-24 text-xs font-bold uppercase tracking-widest text-muted-foreground"
            >
              {value.title}
            </h2>
          </figcaption>
        )}
        <div className="flex flex-col gap-px bg-border">
          {value.tiers.map((tier) => (
            <div key={tier._key} className="flex items-stretch gap-px">
              <TierBadge tier={tier} />
              <div className="flex flex-1 flex-wrap gap-2 bg-card p-2">
                {tier.entries?.map((entry) => {
                  rank += 1;
                  const idx = rank - 1;
                  const label = entry.subtitle ?? entry.year;
                  const full = label ? `${entry.title} (${label})` : entry.title;
                  const imageUrl = entryImageUrl(entry, 200);
                  return (
                    <button
                      key={entry._key}
                      type="button"
                      onClick={(e) => open(idx, e.currentTarget)}
                      aria-haspopup="dialog"
                      aria-label={t("open", { title: full })}
                      className={cn(
                        "group relative block overflow-hidden rounded bg-muted ring-1 ring-border transition-transform duration-150 hover:scale-[1.04] hover:ring-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none",
                        ASPECT_CHIP[aspect]
                      )}
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={`${full} poster`}
                          fill
                          sizes="120px"
                          className="object-cover"
                        />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center p-1 text-center text-[9px] leading-tight text-muted-foreground">
                          {entry.title}
                        </span>
                      )}
                      <span className="absolute left-0.5 top-0.5 rounded-sm bg-black/75 px-1 font-mono text-[10px] font-bold tabular-nums text-white">
                        {rank}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </figure>

      {/* The static layer. Indexed by Pagefind and readable without JS — in
          capsule mode this is the only copy of the write-ups in the document,
          so it must never carry data-pagefind-ignore. */}
      {hasCapsuleContent && (
        <details className="not-prose my-4 rounded border border-border bg-card px-4 py-2.5 text-sm text-card-foreground">
          <summary className="cursor-pointer font-semibold text-muted-foreground">
            {t("textList")}
          </summary>
          <ol className="mt-3 flex list-decimal flex-col gap-4 pl-5">
            {items.map(({ entry, tier }) =>
              entry.content?.length ? (
                <li key={entry._key}>
                  <p className="font-bold">
                    {tier.label} · {entry.title}
                    {(entry.subtitle ?? entry.year) ? ` (${entry.subtitle ?? entry.year})` : ""}
                  </p>
                  <div className="[&_p]:my-2">
                    <PortableText value={entry.content} components={capsuleComponents} />
                  </div>
                </li>
              ) : null
            )}
          </ol>
        </details>
      )}

      {mounted &&
        openItem &&
        createPortal(
          isTouch ? (
            <div className="fixed inset-0 z-[100]">
              <button
                type="button"
                aria-label={t("close")}
                onClick={close}
                className="absolute inset-0 h-full w-full bg-black/50"
              />
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                onPointerDown={(e) => {
                  dragRef.current = { x: e.clientX, y: e.clientY };
                }}
                onPointerUp={(e) => {
                  const d = dragRef.current;
                  dragRef.current = null;
                  if (!d) return;
                  const dx = e.clientX - d.x;
                  const dy = e.clientY - d.y;
                  if (dy > 70 && Math.abs(dy) > Math.abs(dx)) close();
                  else if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) nav(dx < 0 ? 1 : -1);
                }}
                className="absolute inset-x-0 bottom-0 flex max-h-[86%] touch-none flex-col rounded-t-[0.9rem] border-t border-border bg-card"
              >
                {/* The sheet previously closed only by swiping down or tapping
                    the backdrop. Both are invisible affordances, and neither is
                    reachable by keyboard or a switch device — the drag handle
                    below is `aria-hidden` decoration, not a control. An explicit
                    button is the only close path that announces itself. */}
                <button
                  type="button"
                  onClick={close}
                  aria-label={t("close")}
                  className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-card-foreground hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  ✕
                </button>
                <span
                  className="mx-auto mb-0.5 mt-2 h-1 w-10 flex-none rounded-full bg-muted-foreground/55"
                  aria-hidden="true"
                />
                <CapsuleContent
                  item={openItem}
                  total={items.length}
                  mode={mode}
                  aspect={aspect}
                  shell="sheet"
                  onNav={nav}
                  onClose={close}
                />
              </div>
            </div>
          ) : (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4"
              onClick={(e) => {
                if (e.target === e.currentTarget) close();
              }}
            >
              <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                className={cn(
                  // `grid-rows-[minmax(0,1fr)]` is load-bearing, not cosmetic: a
                  // grid row defaults to `auto`, which sizes to content and grows
                  // straight past the panel's max-height. The `min-h-0` already on
                  // the inner column cannot help while the TRACK itself refuses to
                  // shrink, so the scroll box inherited the full content height,
                  // `overflow-y-auto` never engaged, and `overflow-hidden` here
                  // simply cropped the tail — taking the Previous/Next footer with
                  // it. Letting the row shrink below content is what hands the
                  // scroll box a real height.
                  "relative grid max-h-[min(34rem,92vh)] w-full max-w-3xl grid-cols-1 grid-rows-[minmax(0,1fr)] overflow-hidden rounded-lg border border-border bg-card shadow-[0_24px_70px_rgba(0,0,0,0.6)]",
                  DIALOG_COLS[aspect]
                )}
              >
                <button
                  type="button"
                  onClick={close}
                  aria-label={t("close")}
                  className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded border border-border bg-card text-card-foreground hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                >
                  ✕
                </button>
                <CapsuleContent
                  item={openItem}
                  total={items.length}
                  mode={mode}
                  aspect={aspect}
                  shell="dialog"
                  onNav={nav}
                  onClose={close}
                />
              </div>
            </div>
          ),
          document.body
        )}

      {/* The Maker sits behind its own CTA rather than auto-expanding: on a
          long ranking piece the reading rhythm matters more than discovery. */}
      <TierMaker value={value} />
    </>
  );
}
