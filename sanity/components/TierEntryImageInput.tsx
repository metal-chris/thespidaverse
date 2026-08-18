/**
 * Custom input for a tier entry's `image`: a "Find poster" panel above
 * Sanity's default image input.
 *
 * Phase 3 / A7 (docs/TIER_LIST_SPEC.md). Replaces the search-download-upload
 * script loop with a picker: search TMDB by the sibling title and year, look
 * at the candidates, click one, and it uploads to this dataset and sets the
 * field. The default image input stays underneath, so uploading by hand,
 * cropping, and the hotspot all work exactly as before.
 *
 * The key lives in /api/studio/tmdb. Poster bytes are fetched straight from
 * image.tmdb.org (it sends `access-control-allow-origin: *`) and uploaded
 * with Studio's own client, so no server route ever handles a caller-supplied
 * URL.
 *
 * Looking before choosing is the point: the candidate list shows the poster,
 * the exact TMDB title and the year, because "Monster" and "Nausicaä" both
 * matched the wrong record when this was done by script.
 */
import { useCallback, useMemo, useState } from "react";
import { set, useClient, useFormValue, type ObjectInputProps } from "sanity";
import { Box, Button, Card, Flex, Grid, Inline, Spinner, Stack, Text, TextInput } from "@sanity/ui";

interface Candidate {
  id: number;
  title: string;
  year: string | null;
  posterUrl: string | null;
}

type Kind = "movie" | "tv";

/** The article's mediaType is usually the right default; anime is on TMDB as tv. */
function defaultKind(mediaType: unknown): Kind {
  return mediaType === "tv" || mediaType === "anime" ? "tv" : "movie";
}

export function TierEntryImageInput(props: ObjectInputProps) {
  const { onChange, path, value } = props;
  const client = useClient({ apiVersion: "2024-01-01" });

  const entryPath = useMemo(() => path.slice(0, -1), [path]);
  const title = useFormValue([...entryPath, "title"]) as string | undefined;
  const year = useFormValue([...entryPath, "year"]) as string | undefined;
  const subtitle = useFormValue([...entryPath, "subtitle"]) as string | undefined;
  const mediaType = useFormValue(["mediaType"]);

  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<Kind>(() => defaultKind(mediaType));
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Candidate[] | null>(null);
  const [busy, setBusy] = useState<false | "search" | number>(false);
  const [error, setError] = useState<string | null>(null);

  // Year first, then a 4-digit year hiding in a subtitle like "2008-2009".
  const yearHint = useMemo(() => {
    const m = /\b(\d{4})\b/.exec(year ?? subtitle ?? "");
    return m?.[1] ?? "";
  }, [year, subtitle]);

  const search = useCallback(async (term: string) => {
    const q = term.trim();
    if (!q) return;
    setBusy("search"); setError(null); setResults(null);
    try {
      const params = new URLSearchParams({ q, type: kind });
      if (yearHint) params.set("year", yearHint);
      const res = await fetch(`/api/studio/tmdb?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? `Search failed (${res.status}).`);
      setResults(data.results as Candidate[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Search failed.");
    } finally {
      setBusy(false);
    }
  }, [kind, yearHint]);

  const choose = useCallback(async (c: Candidate) => {
    if (!c.posterUrl) return;
    setBusy(c.id); setError(null);
    try {
      const blob = await fetch(c.posterUrl).then((r) => {
        if (!r.ok) throw new Error(`Could not download the poster (${r.status}).`);
        return r.blob();
      });
      const slug = `${c.title}-${c.year ?? ""}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const asset = await client.assets.upload("image", blob, { filename: `${slug}.jpg` });
      onChange(set({ _type: "image", asset: { _type: "reference", _ref: asset._id } }));
      setOpen(false); setResults(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }, [client, onChange]);

  const start = useCallback(() => {
    const seed = (title ?? "").trim();
    setQuery(seed);
    setOpen(true);
    if (seed) void search(seed);
  }, [title, search]);

  return (
    <Stack space={3}>
      <Card padding={2} radius={2} tone="transparent" border>
        <Stack space={3}>
          <Flex align="center" gap={2} wrap="wrap">
            <Button
              text={value ? "Replace from TMDB" : "Find poster on TMDB"}
              mode="ghost" fontSize={1} padding={2}
              disabled={!title?.trim()}
              onClick={open ? () => setOpen(false) : start}
            />
            {!title?.trim() && <Text size={1} muted>Give the entry a title first.</Text>}
            {open && (
              <Inline space={1}>
                {(["movie", "tv"] as Kind[]).map((k) => (
                  <Button
                    key={k} text={k === "movie" ? "Movie" : "TV"}
                    mode={kind === k ? "default" : "ghost"} tone={kind === k ? "primary" : "default"}
                    fontSize={1} padding={2}
                    onClick={() => { setKind(k); setResults(null); }}
                  />
                ))}
              </Inline>
            )}
          </Flex>

          {open && (
            <Stack space={3}>
              <Flex gap={2}>
                <Box flex={1}>
                  <TextInput
                    value={query} fontSize={1}
                    placeholder="Search TMDB…"
                    onChange={(e) => setQuery(e.currentTarget.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void search(query); } }}
                  />
                </Box>
                <Button text="Search" mode="ghost" fontSize={1} padding={2} disabled={busy === "search"} onClick={() => void search(query)} />
              </Flex>
              {yearHint && <Text size={1} muted>Filtering to {yearHint} (from this entry). Clear the year on the entry to widen the search.</Text>}

              {busy === "search" && <Flex align="center" gap={2}><Spinner muted /><Text size={1} muted>Searching…</Text></Flex>}
              {error && <Card padding={2} radius={2} tone="critical"><Text size={1}>{error}</Text></Card>}
              {results?.length === 0 && <Text size={1} muted>Nothing matched. Try the other type, or drop the year.</Text>}

              {!!results?.length && (
                <Grid columns={4} gap={2}>
                  {results.map((c) => (
                    <Card key={c.id} padding={1} radius={2} tone="transparent" border>
                      <Stack space={2}>
                        <Box
                          style={{
                            position: "relative", aspectRatio: "2 / 3", borderRadius: 3, overflow: "hidden",
                            background: c.posterUrl ? `center/cover url(${c.posterUrl})` : "rgba(127,127,127,.2)",
                          }}
                        >
                          {!c.posterUrl && (
                            <Flex align="center" justify="center" style={{ position: "absolute", inset: 0 }}>
                              <Text size={0} muted>no poster</Text>
                            </Flex>
                          )}
                        </Box>
                        <Text size={0} weight="semibold" textOverflow="ellipsis">{c.title}</Text>
                        <Text size={0} muted>{c.year ?? "—"}</Text>
                        <Button
                          text={busy === c.id ? "Uploading…" : "Use this"}
                          mode="ghost" fontSize={0} padding={2}
                          disabled={!c.posterUrl || busy !== false}
                          onClick={() => void choose(c)}
                        />
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              )}
            </Stack>
          )}
        </Stack>
      </Card>

      {props.renderDefault(props)}
    </Stack>
  );
}
