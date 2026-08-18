/**
 * Custom input for the whole `tierList` object: a compact static preview
 * of the chart above Sanity's default fields.
 *
 * Phase 3 / A4 (docs/TIER_LIST_SPEC.md). Deliberately NOT the production
 * TierListChart — that component brings next/image, next-intl and the site
 * theme into the Studio bundle. This reads the same schema and the same
 * `tierColor()` the site uses, so what it shows for a row's colour, a chip's
 * rank, and an entry's art is what the page will show. Nothing here is
 * interactive; it exists so the author sees the chart change as they edit
 * instead of after they publish.
 *
 * `TierListPreview` takes the CDN config as a prop rather than reading it
 * from a hook, so it can be rendered outside Studio (e.g. to eyeball it).
 */
import { useCallback, useMemo, useState } from "react";
import { set, useClient, useFormValue, type ObjectInputProps } from "sanity";
import { Box, Button, Card, Flex, Inline, Select, Stack, Text } from "@sanity/ui";
import { tierColor } from "@/lib/tierlist/arrangement";
import { MAX_ENTRIES } from "../lib/tierValidation";
import { existingAnchors, parseHeadings } from "../lib/tierHeadings";
import { moveEntry, type BoardTier } from "../lib/tierBoard";

/* ── value shape (loose: Studio hands us partial objects while editing) ── */
type Img = { asset?: { _ref?: string } };
type Entry = { _key?: string; title?: string; year?: string; subtitle?: string; anchor?: string; image?: Img };
type Tier = { _key?: string; label?: string; color?: string; entries?: Entry[] };
export type TierListValue = { title?: string; mode?: string; chipAspect?: string; tiers?: Tier[] };

export interface CdnConfig { projectId: string; dataset: string }

const CHIP: Record<string, { w: number; h: number }> = {
  poster: { w: 30, h: 45 },
  square: { w: 36, h: 36 },
  wide: { w: 56, h: 32 },
};

/** image-<hash>-<w>x<h>-<ext> → cdn url, sized for a thumb. No client needed. */
function thumbUrl(cdn: CdnConfig, img: Img | undefined, w: number, h: number): string | null {
  const ref = img?.asset?._ref;
  const m = ref && /^image-([0-9a-f]+)-(\d+x\d+)-(\w+)$/.exec(ref);
  if (!m) return null;
  return `https://cdn.sanity.io/images/${cdn.projectId}/${cdn.dataset}/${m[1]}-${m[2]}.${m[3]}?w=${w * 2}&h=${h * 2}&fit=crop&auto=format`;
}

export function TierListPreview({
  value,
  cdn,
  onMove,
}: {
  value: TierListValue | undefined;
  cdn: CdnConfig;
  /** Supply to make the board interactive (A8); omit for a read-only preview. */
  onMove?: (entryKey: string, toTierKey: string, beforeKey?: string) => void;
}) {
  const tiers = value?.tiers ?? [];
  // Selection is the keyboard/click path, mirroring the reader Maker's
  // tap-to-hold: pick a chip, then pick a row. Drag is the mouse path.
  const [held, setHeld] = useState<string | null>(null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [overTier, setOverTier] = useState<string | null>(null);
  const live = !!onMove;

  const commit = (entryKey: string, toTierKey: string, beforeKey?: string) => {
    onMove?.(entryKey, toTierKey, beforeKey);
    setHeld(null); setDragKey(null); setOverTier(null);
  };
  const aspect = CHIP[value?.chipAspect ?? "poster"] ?? CHIP.poster;
  const total = tiers.reduce((n, t) => n + (t.entries?.length ?? 0), 0);

  // Flat rank across tiers in display order — the same index space the
  // share code and the chart's rank badge use.
  const ranks = useMemo(() => {
    const m = new Map<Entry, number>();
    let i = 0;
    for (const t of tiers) for (const e of t.entries ?? []) m.set(e, ++i);
    return m;
  }, [tiers]);

  if (!tiers.length) {
    return (
      <Card padding={3} radius={2} tone="transparent" border>
        <Text size={1} muted>No tiers yet — pick a preset below or add rows.</Text>
      </Card>
    );
  }

  return (
    <Card padding={2} radius={2} tone="transparent" border>
      <Stack space={2}>
        <Flex align="center" gap={2}>
          <Text size={1} weight="semibold">{value?.title || "Tier List"}</Text>
          <Text size={1} muted>
            · {tiers.length} tier{tiers.length === 1 ? "" : "s"} · {total} entr{total === 1 ? "y" : "ies"} · {value?.mode ?? "capsule"} · {value?.chipAspect ?? "poster"}
          </Text>
          {total > MAX_ENTRIES && (
            <Text size={1} style={{ color: "#c94f4f" }} weight="semibold">· over the {MAX_ENTRIES}-entry share cap</Text>
          )}
        </Flex>

        <Stack space={1}>
          {tiers.map((t, ti) => {
            const bg = tierColor({ _key: t._key ?? String(ti), _type: "tier", label: t.label ?? "", color: t.color } as never);
            const entries = t.entries ?? [];
            return (
              <Flex
                key={t._key ?? ti}
                align="stretch"
                gap={1}
                onDragOver={live ? (e) => { if (dragKey) { e.preventDefault(); setOverTier(t._key ?? null); } } : undefined}
                onDragLeave={live ? () => setOverTier((k) => (k === (t._key ?? null) ? null : k)) : undefined}
                onDrop={live ? (e) => { e.preventDefault(); if (dragKey && t._key) commit(dragKey, t._key); } : undefined}
              >
                {/* Rail: exactly the colour tierColor() gives the site. */}
                {/* Rail grows to fit free-form labels (the grey-warning case)
                    instead of clipping them; caps at ~7rem with an ellipsis. */}
                <Flex
                  align="center" justify="center"
                  style={{
                    minWidth: 40, maxWidth: 112, padding: "0 6px", minHeight: aspect.h + 8, background: bg, borderRadius: 3,
                    color: "#141414", fontWeight: 800, fontSize: (t.label ?? "").length > 3 ? 10 : 12, flex: "none",
                    lineHeight: 1.1, textAlign: "center",
                  }}
                  title={live && held ? `Move here` : `${t.label ?? ""} · ${bg}`}
                  onClick={live && held && t._key ? () => commit(held, t._key!) : undefined}
                  role={live && held ? "button" : undefined}
                  tabIndex={live && held ? 0 : undefined}
                  onKeyDown={live && held && t._key ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); commit(held, t._key!); } } : undefined}
                >
                  {/* text-overflow only applies to a block box, not the flex container */}
                  <span style={{ display: "block", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.label || "?"}
                  </span>
                </Flex>
                <Flex
                  wrap="wrap" gap={1}
                  style={{
                    flex: 1, minHeight: aspect.h + 8, padding: 4, borderRadius: 3,
                    background: overTier === t._key ? "rgba(43,127,255,.18)" : "rgba(127,127,127,.08)",
                    outline: live && held ? "1px dashed rgba(127,127,127,.4)" : "none",
                    cursor: live && held ? "pointer" : undefined,
                  }}
                  onClick={live && held && t._key ? () => commit(held, t._key!) : undefined}
                >
                  {entries.length === 0 && (
                    <Text size={0} muted style={{ alignSelf: "center" }}>{live && held ? "move here" : "empty"}</Text>
                  )}
                  {entries.map((e, ei) => {
                    const src = thumbUrl(cdn, e.image, aspect.w, aspect.h);
                    const label = e.subtitle ?? e.year;
                    const full = label ? `${e.title ?? ""} (${label})` : e.title ?? "";
                    return (
                      <Box
                        key={e._key ?? ei}
                        title={live ? `${full} — drag to a row, or click to pick up` : full}
                        draggable={live}
                        onDragStart={live && e._key ? () => setDragKey(e._key!) : undefined}
                        onDragEnd={live ? () => { setDragKey(null); setOverTier(null); } : undefined}
                        onDragOver={live ? (ev) => { if (dragKey && dragKey !== e._key) { ev.preventDefault(); ev.stopPropagation(); } } : undefined}
                        onDrop={live && e._key ? (ev) => { ev.preventDefault(); ev.stopPropagation(); if (dragKey && t._key) commit(dragKey, t._key, e._key); } : undefined}
                        onClick={live && e._key ? (ev) => {
                          ev.stopPropagation();
                          if (held && held !== e._key && t._key) commit(held, t._key, e._key);
                          else setHeld((h) => (h === e._key ? null : e._key!));
                        } : undefined}
                        style={{
                          position: "relative", width: aspect.w, height: aspect.h, borderRadius: 3, overflow: "hidden",
                          background: src ? `center/cover url(${src})` : "rgba(127,127,127,.25)",
                          boxShadow: held === e._key
                            ? "inset 0 0 0 2px #2b7fff, 0 0 0 2px rgba(43,127,255,.35)"
                            : "inset 0 0 0 1px rgba(0,0,0,.25)",
                          opacity: dragKey === e._key ? .4 : 1,
                          flex: "none", cursor: live ? "grab" : undefined,
                        }}
                      >
                        {!src && (
                          <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", padding: 2, fontSize: 7, lineHeight: 1.1, textAlign: "center", overflow: "hidden", color: "inherit", opacity: .85 }}>
                            {e.title ?? "—"}
                          </span>
                        )}
                        <span style={{ position: "absolute", left: 1, top: 1, background: "rgba(0,0,0,.75)", color: "#fff", fontSize: 8, fontWeight: 700, lineHeight: 1, padding: "1px 3px", borderRadius: 2, fontVariantNumeric: "tabular-nums" }}>
                          {ranks.get(e)}
                        </span>
                      </Box>
                    );
                  })}
                </Flex>
              </Flex>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
}

/**
 * A6 — build entries from the body's numbered headings.
 *
 * New entries land in one tier of the author's choosing, in rank order,
 * because the headings carry an ordering but not tier cut lines; deciding
 * those is the author's judgement, not something to infer. Entries whose
 * anchor already exists are skipped, so the button is safe to press twice.
 */
function PopulateFromHeadings({ value, onChange }: { value: TierListValue | undefined; onChange: ObjectInputProps["onChange"] }) {
  const body = useFormValue(["body"]);
  const tiers = useMemo(() => value?.tiers ?? [], [value?.tiers]);
  const [target, setTarget] = useState<string>("");
  const [done, setDone] = useState<string | null>(null);

  const parsed = useMemo(() => parseHeadings(body), [body]);
  const fresh = useMemo(() => {
    const seen = existingAnchors(tiers);
    return parsed.filter((h) => !seen.has(h.anchor));
  }, [parsed, tiers]);

  const targetKey = target || tiers[0]?._key || "";

  const run = useCallback(() => {
    if (!fresh.length || !targetKey) return;
    const stamp = Date.now().toString(36);
    const next = tiers.map((t) =>
      t._key !== targetKey
        ? t
        : {
            ...t,
            entries: [
              ...(t.entries ?? []),
              ...fresh.map((h, i) => ({
                _key: `tl-e-${stamp}-${i.toString(36)}`,
                _type: "tierEntry",
                title: h.title,
                ...(h.year ? { year: h.year } : {}),
                ...(h.subtitle ? { subtitle: h.subtitle } : {}),
                anchor: h.anchor,
              })),
            ],
          }
    );
    onChange(set(next, ["tiers"]));
    setDone(`Added ${fresh.length} entr${fresh.length === 1 ? "y" : "ies"} to ${tiers.find((t) => t._key === targetKey)?.label ?? "the tier"}.`);
  }, [fresh, targetKey, tiers, onChange]);

  if (!parsed.length) return null;

  return (
    <Card padding={2} radius={2} tone="transparent" border>
      <Stack space={2}>
        <Text size={1} muted>
          {parsed.length} numbered heading{parsed.length === 1 ? "" : "s"} in the body
          {fresh.length !== parsed.length && ` · ${parsed.length - fresh.length} already added`}
        </Text>
        {fresh.length === 0 ? (
          <Text size={1} muted>{done ?? "Every heading already has an entry."}</Text>
        ) : (
          <Flex align="center" gap={2} wrap="wrap">
            <Button text={`Add ${fresh.length} entr${fresh.length === 1 ? "y" : "ies"}`} mode="ghost" fontSize={1} padding={2} disabled={!targetKey} onClick={run} />
            <Inline space={2}>
              <Text size={1} muted>to</Text>
              <Select fontSize={1} padding={2} value={targetKey} onChange={(e) => setTarget(e.currentTarget.value)}>
                {tiers.map((t, i) => (
                  <option key={t._key ?? i} value={t._key ?? ""}>{t.label || "(unlabelled)"}</option>
                ))}
              </Select>
            </Inline>
            <Text size={1} muted>in rank order — move them from there.</Text>
          </Flex>
        )}
        {done && fresh.length > 0 && <Text size={1} muted>{done}</Text>}
      </Stack>
    </Card>
  );
}

export function TierListInput(props: ObjectInputProps) {
  const client = useClient({ apiVersion: "2024-01-01" });
  const { projectId = "", dataset = "production" } = client.config();
  const value = props.value as TierListValue | undefined;
  const { onChange } = props;

  /* A8 — the board writes the move straight to the document. The whole
     entry object moves, so its _key, anchor, capsule content and image
     travel with it; the array field below stays the place to add, delete
     or edit an entry. */
  const handleMove = useCallback(
    (entryKey: string, toTierKey: string, beforeKey?: string) => {
      const tiers = (value?.tiers ?? []) as BoardTier[];
      const next = moveEntry(tiers, entryKey, toTierKey, beforeKey);
      if (next !== tiers) onChange(set(next, ["tiers"]));
    },
    [value?.tiers, onChange]
  );

  const hasEntries = (value?.tiers ?? []).some((t) => (t.entries?.length ?? 0) > 0);

  return (
    <Stack space={4}>
      <Stack space={2}>
        <TierListPreview value={value} cdn={{ projectId, dataset }} onMove={handleMove} />
        {hasEntries && (
          <Text size={1} muted>
            Drag a chip to another row to re-tier it, or drop it on a chip to place it before that one.
            Click a chip to pick it up, then click a row.
          </Text>
        )}
      </Stack>
      <PopulateFromHeadings value={value} onChange={onChange} />
      {props.renderDefault(props)}
    </Stack>
  );
}
