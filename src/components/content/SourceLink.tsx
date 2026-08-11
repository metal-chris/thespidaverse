"use client";

import {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  safePolygon,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from "@floating-ui/react";
import type { PortableTextBlock } from "@portabletext/react";
import { urlFor } from "@/lib/sanity/image";
import { cn } from "@/lib/utils";
import { useSpoilerContext } from "./SpoilerBlock";
import type { SourceLinkValue, SourceType } from "@/types";

/* ────────────────────────────────────────────────────────────────
   Citation counts — "Cited 3×"

   Counting has to happen above the individual link, so the body is
   walked once per document and the result shared by context.
   ──────────────────────────────────────────────────────────────── */

const CitationContext = createContext<Map<string, number>>(new Map());

/** Walks a Portable Text body and tallies how often each href is cited. */
export function countCitations(
  body: PortableTextBlock[] | undefined
): Map<string, number> {
  const counts = new Map<string, number>();
  const visit = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!node || typeof node !== "object") return;
    const rec = node as Record<string, unknown>;
    if (rec._type === "link" && typeof rec.href === "string") {
      counts.set(rec.href, (counts.get(rec.href) ?? 0) + 1);
    }
    Object.values(rec).forEach(visit);
  };
  visit(body);
  return counts;
}

export function SourceCitationsProvider({
  body,
  children,
}: {
  body?: PortableTextBlock[];
  children: React.ReactNode;
}) {
  const counts = useMemo(() => countCitations(body), [body]);
  return (
    <CitationContext.Provider value={counts}>{children}</CitationContext.Provider>
  );
}

/* ────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────── */

/** Sanity asset refs encode dimensions: image-{hash}-{w}x{h}-{ext} */
function aspectFromRef(ref?: string): number | null {
  if (!ref) return null;
  const m = /-(\d+)x(\d+)-[a-z]+$/.exec(ref);
  if (!m) return null;
  const w = Number(m[1]);
  const h = Number(m[2]);
  if (!w || !h) return null;
  return w / h;
}

type MediaSlot = "banner" | "square" | "portrait";

function slotForAspect(aspect: number | null): MediaSlot {
  if (aspect === null) return "banner";
  if (aspect >= 1.45) return "banner"; // 3:2 and wider
  if (aspect >= 0.85) return "square";
  return "portrait";
}

function hostOf(href?: string): string {
  if (!href) return "";
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function isVideoHref(href?: string): boolean {
  const h = hostOf(href);
  return /(^|\.)(youtube\.com|youtu\.be|vimeo\.com)$/.test(h);
}

/** A link only gets a card once it carries something worth showing. */
export function hasSourceCard(value?: SourceLinkValue): boolean {
  if (!value) return false;
  return Boolean(
    value.context || value.sourceName || value.sourceTitle || value.sourceImage
  );
}

/* ────────────────────────────────────────────────────────────────
   Icons — lucide paths, inlined to avoid a runtime lookup per card
   ──────────────────────────────────────────────────────────────── */

const TYPE_PATHS: Record<SourceType, string> = {
  reporting:
    "M4 3h13v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5M17 8h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2M6 7h7M6 11h7M6 15h4",
  interview:
    "M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM5 10v1a7 7 0 0 0 14 0v-1M12 19v3",
  review: "m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  data: "M3 3v18h18M7 14v4M12 10v8M17 6v12",
  primary:
    "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z",
  reference:
    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
};

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const LOCK_D = "M3 11h18v11H3zM7 11V7a5 5 0 0 1 10 0v4";
const ARCHIVE_D = "M21 8v13H3V8M1 3h22v5H1zM10 12h4";
const EXTERNAL_D = "M7 17 17 7M9 7h8v8";
const EYE_OFF_D =
  "M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.53 13.53 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20";

/* ────────────────────────────────────────────────────────────────
   Scrollable context with the line-and-dot rail
   ──────────────────────────────────────────────────────────────── */

function ScrollableContext({ text, label }: { text: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [progress, setProgress] = useState(0);
  const [atEnd, setAtEnd] = useState(false);

  const sync = () => {
    const el = ref.current;
    if (!el) return;
    const range = el.scrollHeight - el.clientHeight;
    const can = range > 4;
    setScrollable(can);
    setProgress(can ? el.scrollTop / range : 0);
    setAtEnd(!can || range - el.scrollTop <= 4);
  };

  // Measure after paint, and again if the box resizes (image load, font swap).
  useEffect(() => {
    sync();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={sync}
        tabIndex={scrollable ? 0 : -1}
        role={scrollable ? "region" : undefined}
        aria-label={scrollable ? label : undefined}
        className={cn(
          "source-scroll max-h-[8.5rem] overflow-y-auto text-[0.83rem] leading-[1.55] text-card-foreground",
          scrollable ? "pr-3" : "pr-0",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        )}
      >
        {text.split(/\n{2,}/).map((para, i) => (
          <p key={i} className="m-0 mb-[0.6em] last:mb-0">
            {para}
          </p>
        ))}
      </div>

      {/* Line-and-dot rail: present whenever the region can scroll, so the
          "there's more" cue exists before the reader touches it. */}
      {scrollable && (
        <div
          className="pointer-events-none absolute right-[2px] top-[2px] bottom-[2px] w-px bg-border"
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
          className="pointer-events-none absolute inset-x-0 bottom-0 h-9 bg-gradient-to-b from-transparent to-card"
          aria-hidden="true"
        />
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   Card body
   ──────────────────────────────────────────────────────────────── */

function SourceCardContent({
  value,
  citedCount,
  inSheet,
}: {
  value: SourceLinkValue;
  citedCount: number;
  inSheet: boolean;
}) {
  const t = useTranslations("source");
  const host = hostOf(value.href);
  const aspect = aspectFromRef(value.sourceImage?.asset?._ref);
  const slot = slotForAspect(aspect);
  const isVideo = isVideoHref(value.href);
  const typeKey: SourceType = value.sourceType ?? "reference";

  let imageUrl = "";
  if (value.sourceImage?.asset?._ref) {
    try {
      imageUrl = urlFor(value.sourceImage).width(slot === "banner" ? 640 : 220).url() || "";
    } catch {
      imageUrl = "";
    }
  }

  const media = imageUrl ? (
    <div
      className={cn(
        "relative flex-none overflow-hidden bg-muted",
        slot === "banner" && "aspect-[1200/630] w-full",
        slot === "square" && "aspect-square w-[4.6rem]",
        slot === "portrait" && "aspect-[2/3] w-[5.4rem]"
      )}
    >
      <Image
        src={imageUrl}
        alt={value.sourceTitle || value.sourceName || ""}
        fill
        sizes={slot === "banner" ? "360px" : "110px"}
        className="object-cover"
      />
      {isVideo && (
        <>
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-10 w-10 place-items-center rounded-full border border-white/85 bg-black/55">
              <svg viewBox="0 0 24 24" className="ml-[2px] h-3.5 w-3.5 fill-white" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          {value.duration && (
            <span className="absolute bottom-1.5 left-1.5 bg-black/60 px-1.5 py-[1px] font-mono text-[0.62rem] tabular-nums text-white">
              {value.duration}
            </span>
          )}
        </>
      )}
    </div>
  ) : null;

  const header = (
    <div className="flex items-center gap-2 text-[0.66rem] font-bold uppercase tracking-[0.09em] text-accent">
      <Icon d={TYPE_PATHS[typeKey]} className="h-[13px] w-[13px] flex-none" />
      <span className="truncate">{value.sourceName || t(`types.${typeKey}`)}</span>
      {citedCount > 1 && (
        <span className="flex-none border border-dashed border-border px-1.5 py-[1px] text-[0.6rem] normal-case tracking-[0.07em] text-muted-foreground">
          {t("cited", { count: citedCount })}
        </span>
      )}
      {value.sourceDate && (
        <span className="ml-auto flex-none font-medium normal-case tracking-[0.04em] tabular-nums text-muted-foreground">
          {value.sourceDate}
        </span>
      )}
    </div>
  );

  const title = value.sourceTitle ? (
    <div className="line-clamp-2 text-[0.86rem] font-semibold leading-snug text-card-foreground">
      {value.sourceTitle}
    </div>
  ) : null;

  const context = value.context ? (
    <ScrollableContext text={value.context} label={t("context")} />
  ) : null;

  const credit = value.artistCredit ? (
    <div className="text-[0.66rem] text-muted-foreground">{value.artistCredit}</div>
  ) : null;

  const stack = (
    <>
      {header}
      {title}
      {context}
    </>
  );

  return (
    <>
      {slot === "banner" || !media ? (
        <>
          {media}
          <div className="flex flex-col gap-[0.55rem] px-[0.95rem] py-[0.8rem]">
            {stack}
            {credit}
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-[0.55rem] px-[0.95rem] py-[0.8rem]">
          <div className="flex items-start gap-3">
            {media}
            <div className="flex min-w-0 flex-1 flex-col gap-[0.45rem]">{stack}</div>
          </div>
          {credit}
        </div>
      )}

      {/* Footer. Inside the sheet the open action lives in the sheet's own
          button, so it isn't repeated here. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 border-t border-border px-[0.95rem] py-[0.55rem] text-[0.68rem] text-muted-foreground">
        {host && <span className="font-mono tracking-tight">{host}</span>}

        {value.access === "paywalled" && (
          <span className="inline-flex items-center gap-1 border border-accent/45 px-1.5 py-[1px] text-[0.6rem] uppercase tracking-[0.07em] text-accent">
            <Icon d={LOCK_D} className="h-[9px] w-[9px]" />
            {t("paywall")}
          </span>
        )}
        {value.access === "metered" && (
          <span className="inline-flex items-center gap-1 border border-border px-1.5 py-[1px] text-[0.6rem] uppercase tracking-[0.07em]">
            {t("metered")}
          </span>
        )}
        {value.archiveUrl && (
          <a
            href={value.archiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 border border-border px-1.5 py-[1px] text-[0.6rem] uppercase tracking-[0.07em] hover:border-muted-foreground hover:text-card-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Icon d={ARCHIVE_D} className="h-[9px] w-[9px]" />
            {t("archived")}
          </a>
        )}

        {!inSheet && (
          <span className="ml-auto inline-flex items-center gap-1 font-semibold text-accent">
            {t("openNewTab")}
            <Icon d={EXTERNAL_D} className="h-[11px] w-[11px]" />
          </span>
        )}
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────
   Card shell — handles the spoiler cover
   ──────────────────────────────────────────────────────────────── */

function SourceCard({
  value,
  citedCount,
  inSheet = false,
}: {
  value: SourceLinkValue;
  citedCount: number;
  inSheet?: boolean;
}) {
  const t = useTranslations("source");
  const { revealAll } = useSpoilerContext();
  const [revealed, setRevealed] = useState(false);
  const isCovered = Boolean(value.spoilerSource) && !revealed && !revealAll;

  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden bg-card font-sans text-card-foreground",
        !inSheet && "w-[min(22.5rem,calc(100vw-1.6rem))] border border-l-4 border-border border-l-accent shadow-[0_12px_34px_rgba(0,0,0,0.5)]"
      )}
      data-pagefind-ignore
    >
      <div
        className={cn(
          "flex flex-col transition-[filter] duration-300 motion-reduce:transition-none",
          isCovered && "pointer-events-none select-none blur-[9px]"
        )}
        aria-hidden={isCovered || undefined}
      >
        <SourceCardContent value={value} citedCount={citedCount} inSheet={inSheet} />
      </div>

      {/* Stacked cover: header line + full-width button. Both are real DOM
          text so they translate; a CSS ::after label could not. */}
      {isCovered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-card/60 px-[0.95rem] py-4 text-center">
          <Icon d={EYE_OFF_D} className="h-[18px] w-[18px] text-accent" />
          <p className="max-w-full text-[0.68rem] font-bold uppercase leading-normal tracking-[0.11em] text-card-foreground">
            {t("spoilerHeader")}
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setRevealed(true);
            }}
            className="w-full rounded-[0.3rem] bg-accent px-3 py-2 text-[0.76rem] font-bold text-background transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {t("reveal")}
          </button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────
   SourceLink — the mark serializer's entry point
   ──────────────────────────────────────────────────────────────── */

export function SourceLink({
  value,
  children,
}: {
  value?: SourceLinkValue;
  children: React.ReactNode;
}) {
  const t = useTranslations("source");
  const counts = useContext(CitationContext);
  const [open, setOpen] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const labelId = useId();

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const apply = () => setIsTouch(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const href = value?.href || "#";
  const isExternal = /^https?:\/\//.test(href);
  const enriched = hasSourceCard(value);
  const host = hostOf(href);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom",
    middleware: [offset(10), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  });

  const hover = useHover(context, {
    enabled: enriched && !isTouch,
    delay: { open: 400, close: 150 },
    handleClose: safePolygon({ blockPointerEvents: false }),
  });
  const focus = useFocus(context, { enabled: enriched && !isTouch });
  const dismiss = useDismiss(context, { enabled: enriched, outsidePress: true });
  const role = useRole(context, { role: "tooltip" });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const anchorProps = isExternal
    ? { target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  // Unenriched links keep the original behaviour exactly.
  if (!enriched) {
    return (
      <a href={href} className={isExternal ? "spidey-sense-hover" : ""} {...anchorProps}>
        {children}
      </a>
    );
  }

  const citedCount = counts.get(href) ?? 1;

  return (
    <>
      <a
        ref={refs.setReference}
        href={href}
        {...anchorProps}
        {...getReferenceProps({
          onClick(event) {
            // On touch the first tap opens the sheet; the sheet's button navigates.
            if (isTouch) {
              event.preventDefault();
              setOpen((v) => !v);
            }
          },
        })}
        className="source-link text-accent decoration-dotted underline-offset-[3px]"
      >
        {children}
      </a>

      {open && (
        <FloatingPortal>
          {isTouch ? (
            <FloatingFocusManager context={context} modal={false}>
              <div
                ref={refs.setFloating}
                className="fixed inset-0 z-[100]"
                {...getFloatingProps()}
              >
                <button
                  type="button"
                  aria-label={t("dismiss")}
                  className="absolute inset-0 h-full w-full bg-black/50"
                  onClick={() => setOpen(false)}
                />
                <div
                  id={labelId}
                  role="group"
                  aria-label={t("details")}
                  className="absolute inset-x-0 bottom-0 flex flex-col rounded-t-[0.9rem] border-t border-border bg-card"
                >
                  <span
                    className="mx-auto mt-2 mb-0.5 h-1 w-10 rounded-full bg-muted-foreground/55"
                    aria-hidden="true"
                  />
                  <SourceCard value={value!} citedCount={citedCount} inSheet />
                  <a
                    href={href}
                    {...anchorProps}
                    className="mx-[0.95rem] mb-3.5 mt-1.5 flex items-center justify-center gap-1.5 rounded-[0.35rem] bg-accent px-3 py-2.5 text-[0.78rem] font-bold text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    {host ? t("openOn", { host }) : t("openNewTab")}
                    <Icon d={EXTERNAL_D} className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </FloatingFocusManager>
          ) : (
            <div
              ref={refs.setFloating}
              style={floatingStyles}
              className="z-[100]"
              {...getFloatingProps()}
            >
              <SourceCard value={value!} citedCount={citedCount} />
            </div>
          )}
        </FloatingPortal>
      )}
    </>
  );
}
