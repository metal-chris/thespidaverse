/**
 * Show a field's EFFECTIVE value when nothing is stored yet.
 *
 * Phase 3 (docs/TIER_LIST_SPEC.md). `initialValue` only runs when a block is
 * created, so every `tierList` written before a field existed stores it as
 * `undefined` — and Sanity's stock controls draw `undefined` as "nothing
 * chosen": a radio with no dot, a boolean switched off. The reading code does
 * not agree. `poll` is `value.poll !== false`, so undefined COLLECTS; and
 * `listType` falls back to `"tiers"`, so undefined IS a tier list.
 *
 * That gap is the B+ lesson again, one level up. `tierColor()` silently
 * resolved an unknown label to grey; here the control silently reports the
 * opposite of what the site does. On the four live lists the poll switch reads
 * "off" while readers can and do submit to it — verified against the published
 * Ghibli list, whose stored `poll` is null and which accepted every response.
 *
 * The fix is display-only on purpose. Coercing the stored value instead would
 * mean writing to documents just because somebody opened them, which would
 * dirty a published article on page load and make every list carry a redundant
 * field. So this hands the default down to `renderDefault` and stores nothing
 * until the author actually chooses — at which point their choice is written
 * as an ordinary edit.
 */
import { useMemo } from "react";
import type { InputProps } from "sanity";

/**
 * Wrap a field's input so an unset value renders as `fallback`.
 *
 * Typed loosely because it serves a boolean and a string field from one
 * definition; `renderDefault` re-applies the field's real props either way.
 */
export function unsetDefaultInput<T>(fallback: T) {
  return function UnsetDefaultInput(props: InputProps) {
    const shown = useMemo(
      () => (props.value === undefined || props.value === null ? fallback : props.value),
      [props.value]
    );
    return props.renderDefault({ ...props, value: shown } as InputProps);
  };
}
