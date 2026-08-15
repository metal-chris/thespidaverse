"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ASPECT_CHIP, entryImageUrl, tierColor } from "./TierListChart";
import type { TierChipAspect, TierEntry, TierListBlock, TierRow } from "@/types";
import { SpidaverseMark } from "@/components/ui/SpidaverseMark";
import {
  UNRANKED,
  flatten,
  canonicalArrangement,
  encodeArrangement,
  decodeArrangement,
  type Arrangement,
  type FlatItem,
} from "@/lib/tierlist/arrangement";


/**
 * The Maker (phase 2): the published chart becomes a board the reader can
 * rearrange.
 *
 * It reads the same `tierList` block the chart renders, so every existing
 * Gauntlet gains it with no authoring and no schema change.
 *
 * Three input models, all first-class:
 *  - touch: tap a chip to pick it up, tap a tier to place it. No long-press and
 *    no drag threshold, so it never fights the page scroll — the failure that
 *    makes most tier makers unusable on a phone.
 *  - pointer: native HTML5 drag and drop.
 *  - keyboard: focus a chip, press a tier's first letter, or 0 for unranked.
 *
 * The arrangement lives in the URL (`?tl=` + base-36 entry indices grouped by
 * tier), so sharing needs no account, no storage, and nothing to track. Indices
 * address the block's canonical order, so adding an entry later leaves old
 * links valid — the new entry simply arrives unranked.
 */

/* ── Chip ───────────────────────────────────────────────────────── */

function Chip({
  item,
  rank,
  aspect,
  held,
  movedTo,
  onSelect,
  onDragStart,
}: {
  item: FlatItem;
  rank: number | null;
  aspect: TierChipAspect;
  held: boolean;
  movedTo: TierRow | null;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
}) {
  const t = useTranslations("tierList");
  const { entry } = item;
  const url = entryImageUrl(entry, 200);
  const label = entry.subtitle ?? entry.year;
  const full = label ? `${entry.title} (${label})` : entry.title;

  return (
    <button
      type="button"
      draggable
      onDragStart={onDragStart}
      onClick={onSelect}
      data-chip={entry._key}
      aria-pressed={held}
      title={full}
      aria-label={t("maker.chipLabel", { title: full })}
      className={cn(
        "group relative flex-none overflow-hidden rounded bg-muted ring-1 ring-border transition-transform",
        "hover:z-10 hover:scale-[1.05] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground",
        held && "z-10 scale-[1.05] ring-2 ring-accent",
        ASPECT_CHIP[aspect]
      )}
    >
      {url ? (
        <Image src={url} alt="" fill sizes="120px" className="object-cover" />
      ) : (
        <span className="absolute inset-0 grid place-items-center p-1 text-center text-[9px] leading-tight text-muted-foreground">
          {entry.title}
        </span>
      )}
      {rank !== null && (
        <span className="absolute left-0.5 top-0.5 rounded-sm bg-black/75 px-1 font-mono text-[10px] font-bold tabular-nums text-white">
          {rank}
        </span>
      )}
      {movedTo && (
        <span
          className="absolute bottom-0.5 right-0.5 rounded-sm px-1 font-mono text-[9px] font-bold text-black"
          style={{ backgroundColor: tierColor(movedTo) }}
        >
          {movedTo.label}
        </span>
      )}
    </button>
  );
}

/* ── Maker ──────────────────────────────────────────────────────── */

export function TierMaker({ value }: { value: TierListBlock }) {
  const t = useTranslations("tierList");
  const tiers = useMemo(() => value.tiers ?? [], [value.tiers]);
  const items = useMemo(() => flatten(tiers), [tiers]);
  const aspect = value.chipAspect ?? "poster";
  const panelId = useId();

  const byKey = useMemo(() => {
    const m = new Map<string, FlatItem>();
    items.forEach((it) => m.set(it.entry._key, it));
    return m;
  }, [items]);
  const keyToIndex = useMemo(() => {
    const m = new Map<string, number>();
    items.forEach((it) => m.set(it.entry._key, it.index));
    return m;
  }, [items]);
  const canonical = useMemo(() => canonicalArrangement(tiers), [tiers]);

  const [open, setOpen] = useState(false);
  const [arr, setArr] = useState<Arrangement>(canonical);
  const [held, setHeld] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropTier, setDropTier] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  /* A link with an arrangement opens the Maker already showing it. Read from
     location rather than useSearchParams so this needs no Suspense boundary.

     Two link shapes arrive here. `?tl=` is the form the address bar keeps.
     `/r/<code>` is the form Share hands out, because a path segment can have
     its own route and its own OG card while article pages stay static. That
     route used to convert the path to the query form with an inline script
     "before hydration" — but React streams the script inside a hidden
     placeholder and then MOVES it into the document, and a script inserted by
     DOM insertion never executes. So the conversion never happened and every
     shared link opened the author's ranking instead of the reader's. Reading
     both shapes here removes the ordering assumption entirely: whatever the
     route does or does not run, the Maker sees the code. */
  useEffect(() => {
    const [base, pathCode] = window.location.pathname.split("/r/");
    const code =
      new URLSearchParams(window.location.search).get("tl") ??
      (pathCode ? decodeURIComponent(pathCode) : null);
    const decoded = code ? decodeArrangement(code, tiers, items) : null;

    /* Leave the path form behind either way. A code that decoded belongs in
       the address bar as `?tl=`; one that did not is a dead link the reader
       should not pass on, so it goes rather than riding along. */
    if (pathCode) {
      const u = new URL(window.location.href);
      u.pathname = base;
      if (decoded && code) u.searchParams.set("tl", code);
      else u.searchParams.delete("tl");
      window.history.replaceState(null, "", u.toString());
    }

    if (decoded) {
      setArr(decoded);
      setOpen(true);
    }
  }, [tiers, items]);

  const canonicalTierOf = useCallback(
    (key: string) => byKey.get(key)?.tier ?? null,
    [byKey]
  );
  const tierOf = useCallback(
    (key: string) => {
      for (const [tk, keys] of Object.entries(arr)) if (keys.includes(key)) return tk;
      return UNRANKED;
    },
    [arr]
  );

  const move = useCallback((key: string, toTierKey: string) => {
    setArr((prev) => {
      const next: Arrangement = {};
      for (const [k, list] of Object.entries(prev)) next[k] = list.filter((x) => x !== key);
      (next[toTierKey] ??= []).push(key);
      return next;
    });
    setHeld(null);
  }, []);

  const moves = useMemo(
    () =>
      items.filter((it) => {
        const now = tierOf(it.entry._key);
        return now !== it.tier._key;
      }).length,
    [items, tierOf]
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    // Share the PATH form (/articles/…/r/<tl>), not the ?tl= query form the
    // address bar uses. Metadata for a query param would force every article
    // page out of ISR (generateMetadata would have to read searchParams); a
    // path segment gets its own route with its own OG card — the person's
    // actual arrangement drawn as an image — while article pages stay static.
    // The /r/ page bounces humans straight back to the ?tl= form on load.
    const code = encodeArrangement(arr, tiers, keyToIndex);
    const base = window.location.pathname.split("/r/")[0].replace(/\/$/, "");
    return `${window.location.origin}${base}/r/${encodeURIComponent(code)}`;
  }, [arr, tiers, keyToIndex]);

  /* Keep the address bar in step without pushing history entries or scrolling. */
  useEffect(() => {
    if (!open) return;
    const u = new URL(window.location.href);
    if (moves === 0 && (arr[UNRANKED] ?? []).length === 0) u.searchParams.delete("tl");
    else u.searchParams.set("tl", encodeArrangement(arr, tiers, keyToIndex));
    window.history.replaceState(null, "", u.toString());
  }, [arr, open, moves, tiers, keyToIndex]);

  /* Keyboard: a tier's first letter assigns, 0 unranks, arrows walk chips. */
  const shortcuts = useMemo(() => {
    const m = new Map<string, string>();
    for (const tier of tiers) {
      const ch = (tier.label ?? "").trim().charAt(0).toUpperCase();
      if (ch && !m.has(ch)) m.set(ch, tier._key);
    }
    return m;
  }, [tiers]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const el = (e.target as HTMLElement).closest?.("[data-chip]") as HTMLElement | null;
      if (!el) return;
      const key = el.dataset.chip!;
      const ch = e.key.toUpperCase();

      if (shortcuts.has(ch)) {
        e.preventDefault();
        move(key, shortcuts.get(ch)!);
      } else if (e.key === "0") {
        e.preventDefault();
        move(key, UNRANKED);
      } else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const all = Array.from(boardRef.current?.querySelectorAll("[data-chip]") ?? []);
        const i = all.indexOf(el);
        (all[i + (e.key === "ArrowRight" ? 1 : -1)] as HTMLElement | undefined)?.focus();
        return;
      } else if (e.key === "Escape" && held) {
        e.preventDefault();
        setHeld(null);
        return;
      } else {
        return;
      }
      // Keep focus on the chip after it relocates.
      requestAnimationFrame(() =>
        boardRef.current
          ?.querySelector<HTMLElement>(`[data-chip="${CSS.escape(key)}"]`)
          ?.focus()
      );
    },
    [held, move, shortcuts]
  );

  if (items.length === 0) return null;

  const heldItem = held ? byKey.get(held) : null;
  const diffRows = items
    .map((it) => ({ it, now: tierOf(it.entry._key) }))
    .filter((r) => r.now !== r.it.tier._key);

  /* ── Collapsed: the CTA ── */
  if (!open) {
    return (
      // One row at every width. The blurb used to carry "No account needed."
      // inline, which made the text block wide enough that the button had to
      // drop below it on phones. With the reassurance on its own line the
      // text column is narrow enough for the button to sit beside it — so
      // the sm: stacking variants are gone rather than tuned.
      <div className="not-prose my-8 flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        {/* The Maker's identity badge. Hidden below sm on purpose: the whole
            point of the layout note above is that the button sits beside the
            text on a phone, and a third element in that row is what would push
            it back down. The mark earns its place at widths that have room
            for it. */}
        <SpidaverseMark className="hidden sm:block h-9 w-9 shrink-0 text-accent" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-sm font-bold text-foreground">{t("maker.ctaTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("maker.ctaBlurb")}</p>
          <p className="text-xs text-muted-foreground">{t("maker.ctaNoAccount")}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={false}
          aria-controls={panelId}
          className="flex-none rounded-md bg-accent px-4 py-2 text-sm font-bold text-background transition-colors hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {t("maker.ctaButton")}
        </button>
      </div>
    );
  }

  /* ── Expanded: the board ── */
  return (
    <div
      id={panelId}
      ref={boardRef}
      onKeyDown={onKeyDown}
      className="not-prose my-8 overflow-hidden rounded-lg border border-border"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2.5">
        <span className="text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-muted-foreground">
          {t("maker.boardTitle")}
        </span>
        <span className="ml-auto rounded-full border border-border px-2 py-0.5 font-mono text-[0.66rem] text-muted-foreground">
          {(arr[UNRANKED] ?? []).length > 0
            ? t("maker.unrankedCount", { n: (arr[UNRANKED] ?? []).length })
            : t("maker.allPlaced")}
        </span>
      </div>

      {heldItem && (
        <div className="flex items-center gap-2 border-b border-border bg-accent/15 px-3 py-2 text-[0.78rem]">
          <span>
            {t.rich("maker.holding", {
              title: heldItem.entry.title,
              b: (c) => <b className="text-accent">{c}</b>,
            })}
          </span>
          <button
            type="button"
            onClick={() => setHeld(null)}
            className="ml-auto text-muted-foreground hover:text-foreground"
            aria-label={t("maker.cancelHold")}
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col gap-px bg-border">
        {tiers.map((tier) => {
          let rank = 0;
          for (const tr of tiers) {
            if (tr._key === tier._key) break;
            rank += (arr[tr._key] ?? []).length;
          }
          return (
            <div
              key={tier._key}
              onDragOver={(e) => {
                if (!dragKey) return;
                e.preventDefault();
                setDropTier(tier._key);
              }}
              onDragLeave={() => setDropTier((d) => (d === tier._key ? null : d))}
              onDrop={(e) => {
                e.preventDefault();
                if (dragKey) move(dragKey, tier._key);
                setDragKey(null);
                setDropTier(null);
              }}
              className={cn(
                "flex min-h-[5rem] items-stretch gap-px",
                dropTier === tier._key && "outline outline-2 -outline-offset-2 outline-dashed outline-accent"
              )}
            >
              <button
                type="button"
                onClick={() => held && move(held, tier._key)}
                aria-label={t("maker.placeIn", { tier: tier.label })}
                style={{ backgroundColor: tierColor(tier), color: "#141414" }}
                className="grid w-12 flex-none place-items-center font-mono text-xl font-black focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white sm:w-16"
              >
                {tier.label}
              </button>
              <div className="flex flex-1 flex-wrap content-start gap-2 bg-card p-2">
                {(arr[tier._key] ?? []).map((key) => {
                  const item = byKey.get(key);
                  if (!item) return null;
                  rank += 1;
                  const canon = canonicalTierOf(key);
                  return (
                    <Chip
                      key={key}
                      item={item}
                      rank={rank}
                      aspect={aspect}
                      held={held === key}
                      movedTo={canon && canon._key !== tier._key ? canon : null}
                      onSelect={() => setHeld((h) => (h === key ? null : key))}
                      onDragStart={() => setDragKey(key)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        onDragOver={(e) => {
          if (!dragKey) return;
          e.preventDefault();
          setDropTier(UNRANKED);
        }}
        onDrop={(e) => {
          e.preventDefault();
          if (dragKey) move(dragKey, UNRANKED);
          setDragKey(null);
          setDropTier(null);
        }}
        onClick={() => held && move(held, UNRANKED)}
        className={cn(
          "border-t border-border bg-background p-2.5",
          dropTier === UNRANKED && "outline outline-2 -outline-offset-2 outline-dashed outline-accent"
        )}
      >
        <p className="mb-2 flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-muted-foreground after:h-px after:flex-1 after:bg-border after:content-['']">
          {t("maker.unranked")}
        </p>
        <div className="flex min-h-[3.5rem] flex-wrap content-start gap-2">
          {(arr[UNRANKED] ?? []).map((key) => {
            const item = byKey.get(key);
            if (!item) return null;
            return (
              <Chip
                key={key}
                item={item}
                rank={null}
                aspect={aspect}
                held={held === key}
                movedTo={null}
                onSelect={() => setHeld((h) => (h === key ? null : key))}
                onDragStart={() => setDragKey(key)}
              />
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 border-t border-border bg-card px-3 py-2.5">
        <button
          type="button"
          onClick={() => {
            setShowShare((s) => !s);
            setShowDiff(false);
          }}
          className="rounded-md bg-accent px-3 py-1.5 text-[0.78rem] font-bold text-background hover:bg-accent-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {t("maker.share")}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowDiff((s) => !s);
            setShowShare(false);
          }}
          className="rounded-md border border-border px-3 py-1.5 text-[0.78rem] font-semibold text-foreground hover:border-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("maker.compare")}
        </button>
        <button
          type="button"
          onClick={() => {
            setArr({ ...Object.fromEntries(tiers.map((x) => [x._key, []])), [UNRANKED]: items.map((i) => i.entry._key) });
            setHeld(null);
          }}
          className="rounded-md border border-border px-3 py-1.5 text-[0.78rem] font-semibold text-foreground hover:border-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("maker.clear")}
        </button>
        <button
          type="button"
          disabled={moves === 0 && (arr[UNRANKED] ?? []).length === 0}
          onClick={() => {
            setArr(canonical);
            setHeld(null);
          }}
          className="rounded-md border border-border px-3 py-1.5 text-[0.78rem] font-semibold text-foreground hover:border-muted-foreground disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {t("maker.reset")}
        </button>
        <span className="ml-auto font-mono text-[0.66rem] text-muted-foreground">
          {moves === 0 ? t("maker.matches") : t("maker.moveCount", { n: moves })}
        </span>
      </div>

      {showShare && (
        <div className="flex flex-col gap-2 border-t border-border bg-background px-3 py-2.5">
          <p className="m-0 text-[0.76rem] text-muted-foreground">{t("maker.shareBlurb")}</p>
          <p className="select-all break-all rounded-md border border-border bg-muted px-2 py-1.5 font-mono text-[0.66rem] text-foreground">
            {shareUrl}
          </p>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(shareUrl);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              }}
              className="rounded-md border border-border px-3 py-1.5 text-[0.78rem] font-semibold hover:border-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {copied ? t("maker.copied") : t("maker.copy")}
            </button>
            <button
              type="button"
              onClick={() => setShowShare(false)}
              className="rounded-md border border-border px-3 py-1.5 text-[0.78rem] font-semibold hover:border-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {t("close")}
            </button>
          </div>
        </div>
      )}

      {showDiff && (
        <div className="flex flex-col gap-2 border-t border-border bg-background px-3 py-2.5">
          <p className="m-0 text-[0.76rem] text-muted-foreground">
            {diffRows.length === 0
              ? t("maker.diffNone")
              : t("maker.diffCount", { n: diffRows.length })}
          </p>
          <div>
            {diffRows.map(({ it, now }) => {
              const target = tiers.find((x) => x._key === now);
              return (
                <div
                  key={it.entry._key}
                  className="flex items-center gap-2 border-b border-border py-1 text-[0.78rem] last:border-b-0"
                >
                  <span
                    className="rounded-sm px-1.5 font-mono text-[0.62rem] font-bold text-black"
                    style={{ backgroundColor: tierColor(it.tier) }}
                  >
                    {it.tier.label}
                  </span>
                  <span aria-hidden="true" className="text-muted-foreground">
                    →
                  </span>
                  <span
                    className={cn(
                      "rounded-sm px-1.5 font-mono text-[0.62rem] font-bold",
                      target ? "text-black" : "text-foreground"
                    )}
                    style={{ backgroundColor: target ? tierColor(target) : "#333" }}
                  >
                    {target ? target.label : "—"}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {it.entry.title}
                    {(it.entry.subtitle ?? it.entry.year) && (
                      <span className="text-muted-foreground">
                        {" "}
                        {it.entry.subtitle ?? it.entry.year}
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowDiff(false)}
            className="self-start rounded-md border border-border px-3 py-1.5 text-[0.78rem] font-semibold hover:border-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t("close")}
          </button>
        </div>
      )}

      <p className="border-t border-border bg-card px-3 py-2 text-[0.68rem] text-muted-foreground">
        {t("maker.keyboardHint")}
      </p>

      {/* Maker credit. "Made with" is true HERE and only here — this board is
          the reader's arrangement, so crediting them for making it is
          accurate. The published chart above says "The Spidaverse" instead,
          because claiming the author's ranking was made by whoever screenshots
          it would not be.

          Same reason it exists at all: a screenshot of the board keeps the
          tiers and loses the page, so the credit has to live inside the
          border. Centred to match the chart's, so the two read as one family
          rather than two different footers stacked. */}
      <div className="flex items-center justify-center gap-2 border-t border-border bg-card px-3 py-2">
        <SpidaverseMark className="h-3.5 w-3.5 shrink-0 text-accent" />
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {t("brandMadeWith")}
        </span>
      </div>
    </div>
  );
}
