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
import { cn } from "@/lib/utils";
import { WebRating } from "./WebRating";
import { SourceLink } from "./SourceLink";
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
const TIER_COLORS: Record<string, string> = {
  S: "#E85A4F",
  A: "#E8944F",
  B: "#E8C94F",
  C: "#6FC46F",
  D: "#5FA8DC",
  E: "#4FC4B0",
  F: "#A66FC4",
};

const ASPECT_CHIP: Record<TierChipAspect, string> = {
  poster: "w-16 sm:w-20 aspect-[2/3]",
  square: "w-[4.2rem] sm:w-[4.8rem] aspect-square",
  wide: "w-[6rem] sm:w-[7rem] aspect-video",
};

const ASPECT_THUMB: Record<TierChipAspect, string> = {
  poster: "w-11 aspect-[2/3]",
  square: "w-12 aspect-square",
  wide: "w-16 aspect-video",
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

function tierColor(tier: TierRow): string {
  return tier.color || TIER_COLORS[tier.label] || "#8A8A8A";
}

function entryImageUrl(entry: TierEntry, width: number): string {
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
}: {
  children: React.ReactNode;
  labelledBy: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [progress, setProgress] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const range = el.scrollHeight - el.clientHeight;
    const can = range > 4;
    setScrollable(can);
    setProgress(can ? el.scrollTop / range : 0);
    setAtEnd(!can || range - el.scrollTop <= 4);
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
        className="source-scroll h-full overflow-y-auto px-4 pb-3 pt-1 text-[0.9rem] leading-[1.62] text-card-foreground focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent [&_p]:m-0 [&_p]:mb-[0.7em] [&_p:last-child]:mb-0 [&_strong]:text-accent"
      >
        {children}
      </div>
      {scrollable && (
        <div
          className="pointer-events-none absolute bottom-1 right-1 top-1 w-px bg-border"
          aria-hidden="true"
        >
          <span
            className="source-rail-dot absolute left-1/2 block h-[7px] w-[7px] -translate-x-1/2 rounded-full bg-accent"
            style={{ top: `calc(${progress * 100}% - ${progress * 7}px)` }}
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
  const posterUrl = entryImageUrl(entry, shell === "dialog" ? 480 : 160);

  return (
    <>
      {shell === "dialog" && (
        <div className="relative hidden min-h-full bg-muted sm:block">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt=""
              fill
              sizes="220px"
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
        <div className="flex flex-wrap items-center gap-2 px-4 pb-2 pt-3.5">
          {shell === "sheet" && (
            <span
              className={cn(
                "relative flex-none overflow-hidden rounded bg-muted ring-1 ring-border",
                ASPECT_THUMB[aspect]
              )}
            >
              {posterUrl ? (
                <Image src={posterUrl} alt="" fill sizes="64px" className="object-cover" />
              ) : (
                <span className="absolute inset-0 grid place-items-center p-0.5 text-center text-[8px] leading-tight text-muted-foreground">
                  {entry.title}
                </span>
              )}
            </span>
          )}
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

        <CapsuleBody labelledBy={titleId}>
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
        {value.title && (
          <figcaption className="border-b border-border bg-card px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {value.title}
          </figcaption>
        )}
        <div className="flex flex-col gap-px bg-border">
          {value.tiers.map((tier) => (
            <div key={tier._key} className="flex items-stretch gap-px">
              <div
                className="grid w-12 flex-none place-items-center text-xl font-black sm:w-16"
                style={{ backgroundColor: tierColor(tier), color: "#141414" }}
              >
                {tier.label}
              </div>
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
                className="relative grid max-h-[min(34rem,92vh)] w-full max-w-3xl grid-cols-1 overflow-hidden rounded-lg border border-border bg-card shadow-[0_24px_70px_rgba(0,0,0,0.6)] sm:grid-cols-[minmax(10rem,13rem)_1fr]"
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
    </>
  );
}
