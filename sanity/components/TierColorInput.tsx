/**
 * Custom input for `tier.color`.
 *
 * The field stays a plain hex string — nothing about the stored shape
 * changes — but the author no longer needs to know a hex to use it. The
 * ramp's 21 grade colours are swatches; a row shows what the tier badge
 * will actually resolve to right now (override → ramp for the sibling
 * `label` → grey), which is the thing that used to be invisible until the
 * page rendered. The default text input stays underneath for any custom
 * value, and "Use ramp" clears the override.
 *
 * Reads the sibling label through useFormValue so the resolved swatch
 * tracks label edits live.
 */
import { useCallback, useMemo } from "react";
import { set, unset, useFormValue, type StringInputProps } from "sanity";
import { Box, Button, Card, Flex, Grid, Stack, Text, Tooltip } from "@sanity/ui";
import { TIER_COLORS, TIER_FALLBACK_COLOR, rampColor } from "@/lib/tierlist/arrangement";

const RAMP = Object.entries(TIER_COLORS);

export function TierColorInput(props: StringInputProps) {
  const { value, onChange, path } = props;
  const label = useFormValue([...path.slice(0, -1), "label"]) as string | undefined;

  const ramp = rampColor(label);
  const resolved = value || ramp || TIER_FALLBACK_COLOR;
  const source = value ? "Override" : ramp ? `Ramp · ${label?.trim().toUpperCase()}` : "No ramp match → grey";

  const pick = useCallback((hex: string) => onChange(set(hex)), [onChange]);
  const clear = useCallback(() => onChange(unset()), [onChange]);

  const selected = useMemo(() => (value || "").trim().toUpperCase(), [value]);

  return (
    <Stack space={3}>
      {/* What the badge will be, right now. */}
      <Card padding={2} radius={2} tone="transparent" border>
        <Flex align="center" gap={3}>
          <Box
            style={{
              width: 40, height: 28, borderRadius: 4, background: resolved,
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,.25)", flex: "none",
            }}
            aria-hidden
          />
          <Stack space={1}>
            <Text size={1} weight="semibold">{resolved.toUpperCase()}</Text>
            <Text size={1} muted>{source}</Text>
          </Stack>
          {value && (
            <Box style={{ marginLeft: "auto" }}>
              <Button text="Use ramp" mode="ghost" tone="default" fontSize={1} padding={2} onClick={clear} />
            </Box>
          )}
        </Flex>
      </Card>

      {/* The ramp, S+ … F-. Click to override with that exact colour. */}
      <Grid columns={7} gap={1}>
        {RAMP.map(([grade, hex]) => {
          const isSel = selected === hex.toUpperCase();
          return (
            <Tooltip key={grade} content={<Text size={1}>{grade} · {hex}</Text>} placement="top" portal>
              <button
                type="button"
                onClick={() => pick(hex)}
                aria-label={`${grade} ${hex}`}
                aria-pressed={isSel}
                style={{
                  height: 26, borderRadius: 4, border: 0, cursor: "pointer", background: hex,
                  outline: isSel ? "2px solid var(--card-focus-ring-color, #2276fc)" : "none",
                  outlineOffset: 1, font: "inherit", fontSize: 10, fontWeight: 700,
                  color: "rgba(0,0,0,.7)",
                }}
              >
                {grade}
              </button>
            </Tooltip>
          );
        })}
      </Grid>

      {/* Any custom value. Sanity's own string input, so undo/paste/etc all work. */}
      {props.renderDefault(props)}
    </Stack>
  );
}
