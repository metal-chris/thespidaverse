"use client";

import { Fragment, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { ASPECT_CHIP, entryImageUrl, tierColor } from "./TierListChart";
import type { TierChipAspect, TierEntry, TierListBlock, TierRow } from "@/types";
import { SpidaverseMark } from "@/components/ui/SpidaverseMark";
import {
  HISTORY_LIMIT,
  canRedo,
  canUndo,
  initHistory,
  push as pushHistory,
  redo as redoHistory,
  reset as resetHistory,
  sameArrangement,
  undo as undoHistory,
  type History,
} from "@/lib/tierlist/history";
import {
  UNRANKED,
  flatten,
  canonicalArrangement,
  encodeArrangement,
  numberedRanks,
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

/* ── Chrome ─────────────────────────────────────────────────────────
   The board is an instrument, and its chrome says so. Three kinds of thing
   live around the tiers and they used to look identical: views that can be
   OPEN (Share, Compare), actions that change the board (clear, restore), and
   readouts that only display. A flat strip of matching pills told a reader
   none of that — nothing showed Compare was already open, so it read as a
   button that had failed rather than a panel that was showing.

   So: views are a segmented pair that fills with accent while their panel is
   up, actions sit in their own group behind a divider, and every readout
   wears the same recessed mono field wherever it appears. Sizing is 44px on
   touch and tightens on pointer, matching the header pass. */

const READOUT =
  "rounded-md border border-border bg-muted px-2 py-1 font-mono text-[0.66rem] tabular-nums text-muted-foreground";

const CONTROL =
  "inline-flex min-h-[44px] items-center justify-center px-3 text-[0.78rem] transition-colors sm:min-h-0 sm:py-1.5";

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

interface PollResult {
  count: number;
  belowThreshold?: boolean;
  crowd?: Record<string, string>;
  perEntry?: Record<string, Record<string, number>>;
  undecodable?: number;
}

export function TierMaker({ value }: { value: TierListBlock }) {
  const t = useTranslations("tierList");
  const tiers = useMemo(() => value.tiers ?? [], [value.tiers]);
  const items = useMemo(() => flatten(tiers), [tiers]);
  const aspect = value.chipAspect ?? "poster";
  /* Numbered lists: rows are tie buckets. The board still moves entries the
     same way — a bucket is a bucket — but a row wears the position it starts
     at, and the grade-letter shortcuts have nothing to key on. */
  const numbered = value.listType === "numbered";
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
  /* Phase 4: the arrangement lives inside an undo stack. `arr` stays the
     read path everywhere below, so nothing else had to learn about history. */
  const [hist, setHist] = useState<History<Arrangement>>(() => initHistory(canonical));
  const arr = hist.present;
  /** Record a step. A move that changes nothing costs no undo press. */
  const setArr = useCallback(
    (next: Arrangement | ((prev: Arrangement) => Arrangement)) =>
      setHist((h) => pushHistory(h, typeof next === "function" ? next(h.present) : next, sameArrangement)),
    []
  );
  /** Replace the baseline outright — used when a shared code arrives. */
  const seedArr = useCallback((next: Arrangement) => setHist(resetHistory(next)), []);
  const [held, setHeld] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropTier, setDropTier] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [copied, setCopied] = useState(false);
  /* Named after the reader, on the share card only. */
  const [signature, setSignature] = useState("");
  /* Transient line for the readout, so a keyboard move says where it went —
     otherwise a ± cycle (B+ → B → B-) is invisible to anyone not watching
     the chip. */
  const [announce, setAnnounce] = useState<string | null>(null);
  /* Phase 5 — the poll. Everything here is additive: if the endpoint says
     "nothing yet" (which it also says when the table has not been applied),
     the board is exactly what it was before. */
  const [showPoll, setShowPoll] = useState(false);
  const [poll, setPoll] = useState<PollResult | null>(null);
  const [pollState, setPollState] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [pollMine, setPollMine] = useState<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  /* The chip a keyboard action just moved. Read by the effect below, which
     restores focus once React has actually committed the move. */
  const refocusKey = useRef<string | null>(null);

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
      // `/r/<code>~<name>` — the signature is for the card, not the board.
      (pathCode ? decodeURIComponent(pathCode).split("~")[0] : null);
    const decoded = code ? decodeArrangement(code, tiers, items, value.listType ?? "tiers") : null;

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
      seedArr(decoded);
      setOpen(true);
    }
  }, [tiers, items, seedArr]);

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

  /* The board's bucket order. `arr`'s own key insertion order IS that order:
     canonicalArrangement writes the block's tiers in order, decode assigns
     buckets positionally, `move` rebuilds preserving order, and a split
     splices a fresh key into place. Reading it off `arr` means undo/redo carry
     the order for free, with no second piece of state to keep in step.

     Rendering used to map over `value.tiers` instead, which meant a bucket the
     reader created could not be drawn at all: a valid shared code with more
     groups than the block has tiers put an entry in a bucket no row existed
     for, and that entry vanished from the board — not in a row, not in
     Unranked — and re-sharing from that state dropped it from the code. */
  const order = useMemo(() => Object.keys(arr).filter((k) => k !== UNRANKED), [arr]);

  /* A numbered row is a position, so an empty bucket is not somewhere to put
     something — it is a gap that would wear the next row's numeral. Tiers keep
     their empty rows, which say a real "nothing reached this grade". */
  const visibleOrder = useMemo(
    () => (numbered ? order.filter((k) => (arr[k] ?? []).length > 0) : order),
    [numbered, order, arr]
  );

  /* Encode what the board actually shows. A numbered list emits only its
     occupied buckets, because an empty group decodes straight back into a
     phantom row; a tiers list must emit one group per tier, which is the
     decoder's guard. */
  const encodeOrder = useMemo(
    () => (numbered ? visibleOrder : tiers.map((x) => x._key)),
    [numbered, visibleOrder, tiers]
  );

  /** How many entries are placed, i.e. the last rank in use. */
  const rankedCount = useMemo(
    () => visibleOrder.reduce((n, k) => n + (arr[k] ?? []).length, 0),
    [visibleOrder, arr]
  );

  /** Split a tie: give `key` a bucket of its own at `at` in the shown order. */
  const insertBucket = useCallback((key: string, at: number) => {
    setArr((prev) => {
      const keys = Object.keys(prev).filter((k) => k !== UNRANKED);
      const shown = keys.filter((k) => (prev[k] ?? []).length > 0);
      const anchor = shown[at];
      const cut = anchor ? keys.indexOf(anchor) : keys.length;
      let n = 0;
      while (keys.includes(`nb-${n}`)) n += 1;
      const fresh = `nb-${n}`;
      const next: Arrangement = {};
      keys.forEach((k, i) => {
        if (i === cut) next[fresh] = [key];
        next[k] = (prev[k] ?? []).filter((x) => x !== key);
      });
      if (cut >= keys.length) next[fresh] = [key];
      next[UNRANKED] = (prev[UNRANKED] ?? []).filter((x) => x !== key);
      return next;
    });
    setHeld(null);
  }, []);

  /* How far the board has drifted from the author's. A numbered board is
     compared by RANK, not by bucket key: splitting a tie mints a fresh key,
     so a reader who lands back on the author's exact order would otherwise
     be told they had moved something and keep a `?tl=` they no longer need. */
  const moves = useMemo(() => {
    if (numbered) {
      const mine = numberedRanks(arr, visibleOrder);
      const theirs = numberedRanks(
        canonical,
        tiers.map((x) => x._key)
      );
      return items.filter((it) => mine.get(it.entry._key) !== theirs.get(it.entry._key)).length;
    }
    return items.filter((it) => tierOf(it.entry._key) !== it.tier._key).length;
  }, [numbered, arr, visibleOrder, canonical, tiers, items, tierOf]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    // Share the PATH form (/articles/…/r/<tl>), not the ?tl= query form the
    // address bar uses. Metadata for a query param would force every article
    // page out of ISR (generateMetadata would have to read searchParams); a
    // path segment gets its own route with its own OG card — the person's
    // actual arrangement drawn as an image — while article pages stay static.
    // The /r/ page bounces humans straight back to the ?tl= form on load.
    const code = encodeArrangement(arr, tiers, keyToIndex, encodeOrder);
    const base = window.location.pathname.split("/r/")[0].replace(/\/$/, "");
    /* Signed links carry the name in the path segment, after a `~`. A query
       param would have forced /r/ to render dynamically for every link,
       signed or not. */
    const seg = signature ? `${code}~${signature}` : code;
    return `${window.location.origin}${base}/r/${encodeURIComponent(seg)}`;
  }, [arr, tiers, keyToIndex, signature, encodeOrder]);

  const pollTarget = useMemo(() => {
    if (typeof window === "undefined") return null;
    const base = window.location.pathname.split("/r/")[0].replace(/\/$/, "");
    const slug = base.split("/").pop() ?? "";
    const blockKey = value._key ?? "";
    return slug && blockKey ? { slug, blockKey } : null;
  }, [value._key]);

  const pollEnabled = value.poll !== false && !!pollTarget;

  const loadPoll = useCallback(async () => {
    if (!pollTarget) return;
    try {
      const res = await fetch(
        `/api/engagement/tierlist/${encodeURIComponent(pollTarget.slug)}?block=${encodeURIComponent(pollTarget.blockKey)}`
      );
      setPoll(res.ok ? await res.json() : { count: 0, belowThreshold: true });
    } catch {
      setPoll({ count: 0, belowThreshold: true });
    }
  }, [pollTarget]);

  const submitPoll = useCallback(async () => {
    if (!pollTarget) return;
    setPollState("sending");
    try {
      const res = await fetch(`/api/engagement/tierlist/${encodeURIComponent(pollTarget.slug)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockKey: pollTarget.blockKey,
          code: encodeArrangement(arr, tiers, keyToIndex, encodeOrder),
          honeypot: "",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setPollMine(data.count ?? null);
      setPollState("sent");
      void loadPoll();
    } catch {
      setPollState("failed");
    }
  }, [pollTarget, arr, tiers, keyToIndex, encodeOrder, loadPoll]);

  /* The card the reader is about to post, drawn by the same route the
     crawler will hit. Same-origin, so no key and nothing to configure. */
  const previewUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const slug = window.location.pathname.split("/r/")[0].replace(/\/$/, "").split("/").pop() ?? "";
    const params = new URLSearchParams({ slug, tl: encodeArrangement(arr, tiers, keyToIndex, encodeOrder) });
    if (signature) params.set("by", signature);
    return `/api/og/tierlist?${params}`;
  }, [arr, tiers, keyToIndex, signature, encodeOrder]);

  useEffect(() => {
    if (!announce) return;
    const id = window.setTimeout(() => setAnnounce(null), 2000);
    return () => window.clearTimeout(id);
  }, [announce]);

  /* Keep the address bar in step without pushing history entries or scrolling. */
  useEffect(() => {
    if (!open) return;
    const u = new URL(window.location.href);
    if (moves === 0 && (arr[UNRANKED] ?? []).length === 0) u.searchParams.delete("tl");
    else u.searchParams.set("tl", encodeArrangement(arr, tiers, keyToIndex, encodeOrder));
    window.history.replaceState(null, "", u.toString());
  }, [arr, open, moves, tiers, keyToIndex, encodeOrder]);

  /* Keyboard: a tier's first letter assigns, 0 unranks, arrows walk chips.
     A letter maps to EVERY tier that starts with it, not the first one found.
     With B+ and B on the same board the old map made B+ win and left B
     permanently unreachable from the keyboard; now pressing the letter again
     steps to the next tier sharing it and wraps around. */
  const shortcuts = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const tier of tiers) {
      const ch = (tier.label ?? "").trim().charAt(0).toUpperCase();
      if (!ch) continue;
      m.set(ch, [...(m.get(ch) ?? []), tier._key]);
    }
    return m;
  }, [tiers]);

  /* Which tier a letter should send this chip to: the next one sharing that
     letter if it is already in one of them, otherwise the first. */
  const targetForLetter = useCallback(
    (ch: string, entryKey: string): string | null => {
      const group = shortcuts.get(ch);
      if (!group?.length) return null;
      const current = tierOf(entryKey);
      const at = group.indexOf(current);
      return at === -1 ? group[0] : group[(at + 1) % group.length];
    },
    [shortcuts, tierOf]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const el = (e.target as HTMLElement).closest?.("[data-chip]") as HTMLElement | null;
      if (!el) return;
      const key = el.dataset.chip!;
      const ch = e.key.toUpperCase();

      if ((e.metaKey || e.ctrlKey) && ch === "Z") {
        e.preventDefault();
        setHist((h) => (e.shiftKey ? redoHistory(h) : undoHistory(h)));
        return;
      }

      if (!numbered && shortcuts.has(ch)) {
        e.preventDefault();
        const to = targetForLetter(ch, key);
        if (!to) return;
        move(key, to);
        const label = tiers.find((x) => x._key === to)?.label;
        if (label) setAnnounce(t("maker.movedTo", { tier: label }));
      } else if (numbered && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
        /* Move one bucket. Landing on an occupied bucket ties; stepping past
           the ends gives the chip a rank of its own there. */
        e.preventDefault();
        const from = visibleOrder.findIndex((k) => (arr[k] ?? []).includes(key));
        if (from === -1) return;
        const to = from + (e.key === "ArrowUp" ? -1 : 1);
        const alone = (arr[visibleOrder[from]] ?? []).length === 1;
        if (to < 0 || to >= visibleOrder.length) {
          if (alone) return;
          insertBucket(key, e.key === "ArrowUp" ? 0 : visibleOrder.length);
        } else {
          move(key, visibleOrder[to]);
        }
        setAnnounce(t("maker.movedTo", { tier: String(Math.max(1, to + 1)) }));
      } else if (numbered && e.key === "=") {
        /* Tie with the bucket above. */
        e.preventDefault();
        const from = visibleOrder.findIndex((k) => (arr[k] ?? []).includes(key));
        if (from <= 0) return;
        move(key, visibleOrder[from - 1]);
        setAnnounce(t("maker.movedTo", { tier: String(from) }));
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
      /* Keep focus on the chip after it relocates. This records the intent;
         the effect below does the focusing. A requestAnimationFrame here fired
         before React had committed the move, so it focused the outgoing node
         and focus fell to <body>, which stranded keyboard users after every
         single placement. */
      refocusKey.current = key;
    },
    [held, move, insertBucket, shortcuts, targetForLetter, tiers, t, numbered, visibleOrder, arr]
  );

  /* Runs after React commits the new arrangement, so the chip queried here is
     the one actually in the document. Keyed on `arr` because that is what a
     move changes; Clear and Reset also change it, but leave refocusKey null. */
  useEffect(() => {
    const key = refocusKey.current;
    if (!key) return;
    refocusKey.current = null;
    boardRef.current
      ?.querySelector<HTMLElement>(`[data-chip="${CSS.escape(key)}"]`)
      ?.focus();
  }, [arr]);

  if (items.length === 0) return null;

  const heldItem = held ? byKey.get(held) : null;
  const diffRows = items
    .map((it) => ({ it, now: tierOf(it.entry._key) }))
    .filter((r) => r.now !== r.it.tier._key);

  /* Where the crowd put each entry, against where the author did. */
  const crowdRows = useMemo(() => {
    const crowd = poll?.crowd;
    if (!crowd) return [];
    const order = tiers.map((x) => x._key);
    return items
      .map((it) => {
        const to = crowd[it.entry._key];
        if (!to) return null;
        const target = tiers.find((x) => x._key === to);
        if (!target) return null;
        const moved = to !== it.tier._key;
        const dir = order.indexOf(to) - order.indexOf(it.tier._key);
        const votes = poll?.perEntry?.[it.entry._key]?.[to] ?? 0;
        return { it, target, moved, up: dir < 0, votes };
      })
      .filter((r): r is NonNullable<typeof r> => !!r)
      .sort((a, b) => Number(b.moved) - Number(a.moved) || a.it.index - b.it.index);
  }, [poll, tiers, items]);

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
        <output className={cn("ml-auto", READOUT)}>
          {(arr[UNRANKED] ?? []).length > 0
            ? t("maker.unrankedCount", { n: (arr[UNRANKED] ?? []).length })
            : t("maker.allPlaced")}
        </output>
      </div>

      {heldItem && (
        /* A status line, not a notice: the accent rail on the left edge is the
           board telling you it is holding something, and it reads as lit
           rather than as a message that appeared. */
        <div
          role="status"
          className="flex items-center gap-2 border-b border-l-2 border-border border-l-accent bg-accent/15 px-3 py-2 text-[0.78rem]"
        >
          <span>
            {t.rich("maker.holding", {
              title: heldItem.entry.title,
              b: (c) => <b className="text-accent">{c}</b>,
            })}
          </span>
          <button
            type="button"
            onClick={() => setHeld(null)}
            className="ml-auto grid h-11 w-11 flex-none place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-8 sm:w-8"
            aria-label={t("maker.cancelHold")}
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col gap-px bg-border">
        {visibleOrder.map((bucketKey, bucketIndex) => {
          /* A reader-created bucket has no TierRow behind it. That only ever
             happens in numbered mode, where the label is unused anyway — the
             row wears its position instead. */
          const tier: TierRow =
            tiers.find((x) => x._key === bucketKey) ?? { _key: bucketKey, label: "", entries: [] };
          let rank = 0;
          for (const k of visibleOrder) {
            if (k === bucketKey) break;
            rank += (arr[k] ?? []).length;
          }
          return (
            <Fragment key={bucketKey}>
              {/* Splitting a tie: drop into the gap ABOVE this row to take a
                  rank of your own. Without it a merge was one-way — the only
                  way back was the phantom empty bucket the old renderer left
                  behind, which is the bug this replaced. */}
              {numbered && (held || dragKey) && (
                <button
                  type="button"
                  onClick={() => {
                    const k = held ?? dragKey;
                    if (k) insertBucket(k, bucketIndex);
                  }}
                  onDragOver={(e) => {
                    if (!dragKey) return;
                    e.preventDefault();
                    setDropTier(`gap-${bucketIndex}`);
                  }}
                  onDragLeave={() =>
                    setDropTier((d) => (d === `gap-${bucketIndex}` ? null : d))
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragKey) insertBucket(dragKey, bucketIndex);
                    setDragKey(null);
                    setDropTier(null);
                  }}
                  aria-label={
                    bucketIndex === 0
                      ? t("maker.placeAtNewRankTop", { below: rank + 1 })
                      : t("maker.placeAtNewRank", {
                          /* The rank the row ABOVE wears, which is where its
                             own bucket starts — not the count of entries above
                             this one. With a tie at 1 the gap below it sits
                             between 1 and 3, never "between 2 and 3". */
                          above:
                            rank -
                            (arr[visibleOrder[bucketIndex - 1]] ?? []).length +
                            1,
                          below: rank + 1,
                        })
                  }
                  className={cn(
                    "h-4 w-full flex-none bg-card text-[0.6rem] leading-none text-muted-foreground opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                    dropTier === `gap-${bucketIndex}` &&
                      "outline outline-2 -outline-offset-2 outline-dashed outline-accent opacity-100"
                  )}
                >
                  ⌄
                </button>
              )}
            <div
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
                aria-label={
                  numbered
                    ? t("maker.placeAtRank", { rank: rank + 1 })
                    : t("maker.placeIn", { tier: tier.label })
                }
                style={
                  numbered
                    ? { boxShadow: "inset 0 0 0 2px var(--color-accent)" }
                    : { backgroundColor: tierColor(tier), color: "#141414" }
                }
                className={cn(
                  "grid w-12 flex-none place-items-center font-mono text-xl font-black focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white sm:w-16",
                  numbered && "bg-card text-foreground"
                )}
              >
                {numbered ? rank + 1 : tier.label}
              </button>
              <div className="flex flex-1 flex-wrap content-start gap-2 bg-card p-2">
                {/* An empty row otherwise reads as broken rather than as a
                    place to put something. */}
                {(arr[tier._key] ?? []).length === 0 && (
                  <span className="self-center text-[0.72rem] text-muted-foreground">
                    {t("maker.emptyRow")}
                  </span>
                )}
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
            </Fragment>
          );
        })}
        {/* The gap after the last row: its own rank, at the bottom. */}
        {numbered && (held || dragKey) && (
          <button
            type="button"
            onClick={() => {
              const k = held ?? dragKey;
              if (k) insertBucket(k, visibleOrder.length);
            }}
            onDragOver={(e) => {
              if (!dragKey) return;
              e.preventDefault();
              setDropTier("gap-end");
            }}
            onDragLeave={() => setDropTier((d) => (d === "gap-end" ? null : d))}
            onDrop={(e) => {
              e.preventDefault();
              if (dragKey) insertBucket(dragKey, visibleOrder.length);
              setDragKey(null);
              setDropTier(null);
            }}
            aria-label={t("maker.placeAtNewRankEnd", { above: rankedCount })}
            className={cn(
              "h-4 w-full flex-none bg-card text-[0.6rem] leading-none text-muted-foreground opacity-70 hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
              dropTier === "gap-end" &&
                "outline outline-2 -outline-offset-2 outline-dashed outline-accent opacity-100"
            )}
          >
            ⌄
          </button>
        )}
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

      {/* The deck drops to `background`, the same step down the Unranked tray
          takes. That is the only surface move that reads in BOTH modes:
          measured, `muted` sits 4 steps from `card` in dark (26 vs 22) and
          would have been invisible, while `background` is 9 down in dark and
          5 in light. Controls then sit ON the deck in `card`, so they read as
          raised keys on their own panel rather than text lying on the board. */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-background px-2 py-2 sm:px-3">
        {/* Views. A segmented pair, because they are two settings of one
            control — at most one panel is up at a time — and because a
            segment that fills with accent is the one place a reader can see
            WHICH is up. aria-pressed carries the same fact to a screen
            reader, which the old plain buttons never said at all. */}
        {/* The cluster carries a surface, not just a hairline. The border
            token is near-invisible on card by design, which is right for
            dividing content and wrong for drawing a control that has to look
            like one object with two halves. */}
        <div className="flex flex-none overflow-hidden rounded-md border border-border bg-card">
          <button
            type="button"
            aria-pressed={showShare}
            onClick={() => {
              setShowShare((s) => !s);
              setShowDiff(false);
              setShowPoll(false);
            }}
            className={cn(
              CONTROL,
              "font-bold focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
              showShare
                ? "bg-accent text-background"
                : "text-accent hover:bg-card"
            )}
          >
            {t("maker.share")}
          </button>
          <span aria-hidden="true" className="w-px flex-none bg-border" />
          <button
            type="button"
            aria-pressed={showDiff}
            onClick={() => {
              setShowDiff((s) => !s);
              setShowShare(false);
              setShowPoll(false);
            }}
            className={cn(
              CONTROL,
              "font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
              showDiff
                ? "bg-accent text-background"
                : "text-foreground hover:bg-card"
            )}
          >
            {t("maker.compare")}
          </button>
          {pollEnabled && (
            <>
              <span aria-hidden="true" className="w-px flex-none bg-border" />
              <button
                type="button"
                aria-pressed={showPoll}
                onClick={() => {
                  const next = !showPoll;
                  setShowPoll(next);
                  setShowShare(false);
                  setShowDiff(false);
                  if (next && !poll) void loadPoll();
                }}
                className={cn(
                  CONTROL,
                  "font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                  showPoll ? "bg-accent text-background" : "text-foreground hover:bg-card"
                )}
              >
                {t("maker.pollViewReaders")}
              </button>
            </>
          )}
        </div>

        {/* The divider is the whole point of the grouping: everything left of
            it shows you something, everything right of it changes the board. */}
        <span aria-hidden="true" className="hidden h-6 w-px flex-none bg-border sm:block" />

        <div className="flex flex-none items-center gap-1.5">
          {/* Undo/redo sit with the other board-changing actions. Clear and
              Reset are ordinary steps, so both are undoable. */}
          <button
            type="button"
            disabled={!canUndo(hist)}
            aria-label={t("maker.undo")}
            title={`${t("maker.undo")} (⌘Z)`}
            onClick={() => { setHist(undoHistory); setHeld(null); }}
            className={cn(
              CONTROL,
              "rounded-md border border-border bg-card font-semibold text-muted-foreground hover:border-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
          >
            ↺
          </button>
          <button
            type="button"
            disabled={!canRedo(hist)}
            aria-label={t("maker.redo")}
            title={`${t("maker.redo")} (⇧⌘Z)`}
            onClick={() => { setHist(redoHistory); setHeld(null); }}
            className={cn(
              CONTROL,
              "rounded-md border border-border bg-card font-semibold text-muted-foreground hover:border-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
          >
            ↻
          </button>
          <button
            type="button"
            onClick={() => {
              setArr({ ...Object.fromEntries(tiers.map((x) => [x._key, []])), [UNRANKED]: items.map((i) => i.entry._key) });
              setHeld(null);
            }}
            className={cn(
              CONTROL,
              "rounded-md border border-border bg-card font-semibold text-muted-foreground hover:border-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
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
            className={cn(
              CONTROL,
              "rounded-md border border-border bg-card font-semibold text-muted-foreground hover:border-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
          >
            {t("maker.reset")}
          </button>
        </div>

        <output aria-live="polite" className={cn("ml-auto flex-none", READOUT)}>
          {announce ?? (moves === 0 ? t("maker.matches") : t("maker.moveCount", { n: moves }))}
        </output>
      </div>

      {showPoll && (
        <div className="flex flex-col gap-2 border-t border-border bg-background px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 text-[0.76rem] font-semibold text-foreground">{t("maker.pollReadersTitle")}</p>
            {!!poll?.count && <span className={READOUT}>{t("maker.pollCount", { n: poll.count })}</span>}
            <button
              type="button"
              disabled={pollState === "sending"}
              onClick={() => void submitPoll()}
              className={cn(
                CONTROL,
                "ml-auto rounded-md border border-border font-semibold text-accent hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
              )}
            >
              {pollState === "sending"
                ? t("maker.pollSubmitting")
                : pollState === "sent" && pollMine !== null
                  ? t("maker.pollThanks", { n: pollMine })
                  : t("maker.pollSubmit")}
            </button>
          </div>

          {pollState === "failed" && (
            <p className="m-0 text-[0.74rem] text-accent">{t("maker.pollFailed")}</p>
          )}

          {/* Below the threshold there is no aggregate to show — five people is
              where a "consensus" stops being one opinion plus noise. The same
              message covers a poll that simply has not been set up yet. */}
          {(!poll || poll.belowThreshold) && (
            <p className="m-0 text-[0.76rem] text-muted-foreground">{t("maker.pollSoon")}</p>
          )}

          {!!crowdRows.length && (
            <div>
              {crowdRows.map(({ it, target, moved, up, votes }) => (
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
                    {moved ? (up ? "↑" : "↓") : "="}
                  </span>
                  <span
                    className="rounded-sm px-1.5 font-mono text-[0.62rem] font-bold text-black"
                    style={{ backgroundColor: tierColor(target) }}
                  >
                    {target.label}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{it.entry.title}</span>
                  <span className={cn("flex-none", READOUT)}>{votes}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showShare && (
        <div className="flex flex-col gap-2 border-t border-border bg-background px-3 py-2.5">
          <p className="m-0 text-[0.76rem] text-muted-foreground">{t("maker.shareBlurb")}</p>

          {/* Signing is optional and lives only on the share link: the address
              bar's ?tl= form stays clean, and an unsigned link reads exactly as
              it did before. Trimmed and capped here; the OG route clips again
              and never renders it as markup. */}
          <label className="flex items-center gap-2 text-[0.72rem] text-muted-foreground">
            <span className="flex-none">{t("maker.signLabel")}</span>
            <input
              type="text"
              value={signature}
              maxLength={24}
              placeholder={t("maker.signPlaceholder")}
              onChange={(e) => setSignature(e.target.value.replace(/[\u0000-\u001f\u007f]/g, ""))}
              className="min-w-0 flex-1 rounded-md border border-border bg-muted px-2 py-1 text-[0.76rem] text-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </label>

          <p className="select-all break-all rounded-md border border-border bg-muted px-2 py-1.5 font-mono text-[0.66rem] text-foreground">
            {shareUrl}
          </p>

          {/* What the card will actually look like. Drawn by the same route
              the crawler hits, so this is the artefact and not an impression
              of it. */}
          <figure className="m-0 flex flex-col gap-1">
            <figcaption className="text-[0.72rem] text-muted-foreground">{t("maker.previewHeading")}</figcaption>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={t("maker.previewAlt")}
              width={1200}
              height={630}
              loading="lazy"
              className="w-full rounded-md border border-border bg-muted"
            />
          </figure>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(shareUrl);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              }}
              className={cn(
                CONTROL,
                "rounded-md border border-border font-semibold text-muted-foreground hover:border-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              )}
            >
              {copied ? t("maker.copied") : t("maker.copy")}
            </button>
            <button
              type="button"
              onClick={() => setShowShare(false)}
              className={cn(
                CONTROL,
                "rounded-md border border-border font-semibold text-muted-foreground hover:border-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              )}
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
            className={cn(
              CONTROL,
              "self-start rounded-md border border-border font-semibold text-muted-foreground hover:border-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            )}
          >
            {t("close")}
          </button>
        </div>
      )}

      {/* The legend, in the same mono the readouts use, so it reads as the
          instrument's own labelling rather than a footnote about it. */}
      <p className="border-t border-border bg-background px-3 py-2 font-mono text-[0.66rem] leading-relaxed tracking-[0.02em] text-muted-foreground">
        {t(numbered ? "maker.keyboardHintNumbered" : "maker.keyboardHint")}
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
