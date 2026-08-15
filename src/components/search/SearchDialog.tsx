"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import type Fuse from "fuse.js";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { SearchDoc } from "@/app/api/search-index/route";
import {
  buildIndex,
  runSearch,
  highlight,
  readRecents,
  pushRecent,
  clearRecents,
  matchCategories,
  type Hit,
} from "@/lib/search/client";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Module-scoped so the index survives close/reopen. Fetched once per session,
 * on first open — not on mount, or every page would pay for a dialog most
 * visitors never see.
 */
let cachedDocs: SearchDoc[] | null = null;
let inFlight: Promise<SearchDoc[]> | null = null;

async function loadDocs(): Promise<SearchDoc[]> {
  if (cachedDocs) return cachedDocs;
  if (!inFlight) {
    inFlight = fetch("/api/search-index")
      .then((r) => (r.ok ? r.json() : { docs: [] }))
      .then((j: { docs?: SearchDoc[] }) => {
        cachedDocs = j.docs ?? [];
        return cachedDocs;
      })
      .catch(() => {
        // Offline or a bad deploy. Enter still falls through to /search,
        // which does its own filtering server-side, so search is degraded
        // rather than broken.
        inFlight = null;
        return [];
      });
  }
  return inFlight;
}

/** One row, whether it is an article or a category jump. */
type Row =
  | { kind: "article"; hit: Hit }
  | { kind: "category"; title: string; slug: string; count: number };

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const t = useTranslations("search");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  const [active, setActive] = useState(0);

  /* -------- open / close lifecycle -------- */
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
      setActive(0);
      return;
    }
    setRecents(readRecents());
    void loadDocs().then(setDocs);
    const id = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [open]);

  /* -------- body scroll lock --------
     Without this the page behind scrolls under the dialog on iOS, and the
     backdrop drifts away from the content it is supposed to be covering. */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  /* -------- debounce -------- */
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(query), 150);
    return () => window.clearTimeout(id);
  }, [query]);

  const fuse: Fuse<SearchDoc> | null = useMemo(
    () => (docs && docs.length ? buildIndex(docs) : null),
    [docs]
  );

  const rows: Row[] = useMemo(() => {
    if (!fuse || !docs) return [];
    const cats = matchCategories(docs, debounced).map(
      (c): Row => ({ kind: "category", ...c })
    );
    const arts = runSearch(fuse, debounced).map((hit): Row => ({ kind: "article", hit }));
    return [...cats, ...arts];
  }, [fuse, docs, debounced]);

  /**
   * Empty-state suggestions. An empty palette is a dead end; showing a few
   * real articles tells people what is in here and gives the dialog a use
   * before they have typed anything.
   */
  const suggestions = useMemo(() => (docs ?? []).slice(0, 4), [docs]);

  const showingResults = debounced.trim().length >= 2;
  const activeCount = showingResults ? rows.length : 0;

  useEffect(() => setActive(0), [debounced]);

  const goToSearchPage = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      setRecents(pushRecent(trimmed));
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      onClose();
    },
    [router, onClose]
  );

  const openRow = useCallback(
    (row: Row) => {
      if (debounced.trim()) setRecents(pushRecent(debounced));
      if (row.kind === "article") router.push(`/articles/${row.hit.doc.slug}`);
      else router.push(`/search?category=${encodeURIComponent(row.slug)}`);
      onClose();
    },
    [router, onClose, debounced]
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (activeCount > 0 && rows[active]) openRow(rows[active]);
      else goToSearchPage(query);
    },
    [activeCount, rows, active, openRow, goToSearchPage, query]
  );

  /* -------- keyboard: escape, arrows, focus trap -------- */
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowDown" && activeCount) {
        e.preventDefault();
        setActive((i) => (i + 1) % activeCount);
        return;
      }
      if (e.key === "ArrowUp" && activeCount) {
        e.preventDefault();
        setActive((i) => (i - 1 + activeCount) % activeCount);
        return;
      }
      // Focus trap. Without it Tab walks out of the dialog into the page
      // behind, which is still there and still focusable.
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, activeCount]);

  /* keep the highlighted row in view when arrowing past the fold */
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100]"
      role="dialog"
      aria-modal="true"
      aria-label={t("dialogLabel")}
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative mx-auto mt-[10vh] max-w-xl px-4">
        <div
          ref={panelRef}
          className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        >
          <form onSubmit={handleSubmit}>
            <div className="flex items-center gap-3 border-b border-border px-4">
              <svg
                className="h-5 w-5 shrink-0 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("placeholder")}
                className="min-h-[44px] flex-1 bg-transparent py-3 text-foreground placeholder:text-muted-foreground focus:outline-none"
                autoComplete="off"
                aria-label={t("dialogLabel")}
                aria-autocomplete="list"
                aria-controls="search-results"
                aria-activedescendant={
                  activeCount ? `search-row-${active}` : undefined
                }
              />
              <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-xs text-muted-foreground sm:inline-flex">
                {t("escKey")}
              </kbd>
            </div>
          </form>

          {/* Fixed min-height so the panel does not jump as results arrive. */}
          <div
            id="search-results"
            ref={listRef}
            role="listbox"
            aria-label={t("resultsLabel")}
            className="max-h-[min(60vh,26rem)] min-h-[8rem] overflow-y-auto overscroll-contain p-2"
          >
            {showingResults ? (
              rows.length ? (
                <>
                  {rows.map((row, i) =>
                    row.kind === "category" ? (
                      <button
                        key={`cat-${row.slug}`}
                        type="button"
                        id={`search-row-${i}`}
                        data-idx={i}
                        role="option"
                        aria-selected={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => openRow(row)}
                        className={cn(
                          "flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left",
                          i === active ? "bg-muted" : "hover:bg-muted/60"
                        )}
                      >
                        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent">
                          {t("jumpToCategory")}
                        </span>
                        <span className="truncate text-sm font-medium text-foreground">
                          {row.title}
                        </span>
                        <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                          {row.count}
                        </span>
                      </button>
                    ) : (
                      <ResultRow
                        key={row.hit.doc.id}
                        idx={i}
                        hit={row.hit}
                        active={i === active}
                        onHover={() => setActive(i)}
                        onPick={() => openRow(row)}
                      />
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => goToSearchPage(query)}
                    className="mt-1 flex min-h-[44px] w-full items-center justify-center rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  >
                    {t("viewAll", { query: query.trim() })}
                  </button>
                </>
              ) : (
                <div className="px-3 py-8 text-center">
                  <p className="text-sm text-foreground">
                    {t("noResultsFor", { query: query.trim() })}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("noResultsHint")}
                  </p>
                </div>
              )
            ) : (
              <>
                {recents.length > 0 && (
                  <section className="mb-2">
                    <header className="flex items-center justify-between px-3 py-1">
                      <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {t("recent")}
                      </h2>
                      <button
                        type="button"
                        onClick={() => setRecents(clearRecents())}
                        className="rounded px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground"
                      >
                        {t("clearRecents")}
                      </button>
                    </header>
                    {recents.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setQuery(r);
                          setDebounced(r);
                        }}
                        className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-muted/60"
                      >
                        <svg
                          className="h-4 w-4 shrink-0 text-muted-foreground"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="truncate">{r}</span>
                      </button>
                    ))}
                  </section>
                )}

                <section>
                  <h2 className="px-3 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {t("popular")}
                  </h2>
                  {docs === null ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                      {t("searching")}
                    </p>
                  ) : (
                    suggestions.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          router.push(`/articles/${d.slug}`);
                          onClose();
                        }}
                        className="flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-muted/60"
                      >
                        <Thumb src={d.image} alt="" />
                        <span className="truncate text-sm text-foreground">{d.title}</span>
                      </button>
                    ))
                  )}
                </section>
              </>
            )}
          </div>

          <div className="hidden items-center gap-3 border-t border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:flex">
            {t("navHint")}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Hero thumbnail. Reserves its box even with no image, so rows never jump. */
function Thumb({ src, alt }: { src?: string; alt: string }) {
  return (
    <span className="relative block h-10 w-14 shrink-0 overflow-hidden rounded bg-muted">
      {src ? (
        <Image src={src} alt={alt} fill sizes="56px" className="object-cover" />
      ) : null}
    </span>
  );
}

function ResultRow({
  idx,
  hit,
  active,
  onHover,
  onPick,
}: {
  idx: number;
  hit: Hit;
  active: boolean;
  onHover: () => void;
  onPick: () => void;
}) {
  const { doc, matches } = hit;
  const title = highlight(doc.title, matches, "title");
  const excerpt = doc.excerpt ? highlight(doc.excerpt, matches, "excerpt") : null;

  return (
    <button
      type="button"
      id={`search-row-${idx}`}
      data-idx={idx}
      role="option"
      aria-selected={active}
      onMouseEnter={onHover}
      onClick={onPick}
      className={cn(
        "flex min-h-[44px] w-full items-start gap-3 rounded-lg px-3 py-2 text-left",
        active ? "bg-muted" : "hover:bg-muted/60"
      )}
    >
      <Thumb src={doc.image} alt="" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-foreground">
          {title.map((p, i) =>
            p.hit ? (
              <mark key={i} className="bg-transparent font-bold text-accent">
                {p.text}
              </mark>
            ) : (
              <span key={i}>{p.text}</span>
            )
          )}
        </span>
        {excerpt && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {excerpt.map((p, i) =>
              p.hit ? (
                <mark key={i} className="bg-transparent font-semibold text-foreground">
                  {p.text}
                </mark>
              ) : (
                <span key={i}>{p.text}</span>
              )
            )}
          </span>
        )}
        {doc.category && (
          <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
            {doc.category}
          </span>
        )}
      </span>
    </button>
  );
}

/** Hook for Cmd/Ctrl+K keyboard shortcut */
export function useSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpen();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onOpen]);
}
