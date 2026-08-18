/**
 * Custom input for the `tiers` array: Sanity's array input with a "Start
 * from" preset row above it.
 *
 * Sanity 5.13's insertMenu has groups/filter/views but no per-type template
 * menu, so the block-level initialValue can scaffold exactly one shape (S–F).
 * The other shapes live here. Applying a preset onto a non-empty array
 * replaces the rows — and their entries — so it asks first.
 */
import { useCallback, useState } from "react";
import { set, type ArrayOfObjectsInputProps } from "sanity";
import { Button, Card, Flex, Inline, Stack, Text } from "@sanity/ui";
import { TIER_PRESETS, presetRows, type TierPreset } from "../lib/tierPresets";

export function TierRowsInput(props: ArrayOfObjectsInputProps) {
  const { value, onChange } = props;
  const [pending, setPending] = useState<TierPreset | null>(null);
  const has = (value?.length ?? 0) > 0;
  const entryCount = (value ?? []).reduce((n, t) => n + (((t as { entries?: unknown[] }).entries?.length) ?? 0), 0);

  const apply = useCallback((p: TierPreset) => {
    onChange(set(presetRows(p)));
    setPending(null);
  }, [onChange]);

  const request = useCallback((p: TierPreset) => (has ? setPending(p) : apply(p)), [has, apply]);

  return (
    <Stack space={3}>
      <Card padding={2} radius={2} tone="transparent" border>
        <Stack space={2}>
          <Text size={1} muted>{has ? "Replace rows with a preset" : "Start from a preset"}</Text>
          <Inline space={2}>
            {TIER_PRESETS.map((p) => (
              <Button
                key={p.id}
                text={p.title}
                title={p.hint}
                mode={pending?.id === p.id ? "default" : "ghost"}
                tone={pending?.id === p.id ? "caution" : "default"}
                fontSize={1}
                padding={2}
                onClick={() => request(p)}
              />
            ))}
          </Inline>
          {pending && (
            <Card padding={2} radius={2} tone="caution">
              <Flex align="center" gap={3} wrap="wrap">
                <Text size={1}>
                  Replace {value?.length} row{value?.length === 1 ? "" : "s"}
                  {entryCount ? ` and ${entryCount} entr${entryCount === 1 ? "y" : "ies"}` : ""} with {pending.title}?
                </Text>
                <Inline space={2}>
                  <Button text="Replace" tone="caution" fontSize={1} padding={2} onClick={() => apply(pending)} />
                  <Button text="Cancel" mode="ghost" fontSize={1} padding={2} onClick={() => setPending(null)} />
                </Inline>
              </Flex>
            </Card>
          )}
        </Stack>
      </Card>
      {props.renderDefault(props)}
    </Stack>
  );
}
