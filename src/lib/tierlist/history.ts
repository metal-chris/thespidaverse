/**
 * Undo/redo for the Maker, as a pure past/present/future stack.
 *
 * Phase 4 (docs/TIER_LIST_SPEC.md). Kept out of TierMaker.tsx so the rules —
 * what counts as a step, what a no-op does, where the cap bites — can be
 * tested without mounting a board.
 *
 * Deliberately NOT in arrangement.ts: that module is the wire format, shared
 * by the Maker, /r/, the OG route and /embed, and it must stay edge-safe and
 * free of anything the format does not need. History never leaves the tab.
 */
import type { Arrangement } from "./arrangement";

/** Deep enough for a long session, short enough to stay cheap to hold. */
export const HISTORY_LIMIT = 50;

export interface History<T> {
  past: T[];
  present: T;
  future: T[];
}

export function initHistory<T>(present: T): History<T> {
  return { past: [], present, future: [] };
}

/**
 * Two arrangements are the same when every tier holds the same entries in the
 * same order. Used so a move that changes nothing (dropping a chip back where
 * it was) does not cost an undo step the reader has to press through.
 */
export function sameArrangement(a: Arrangement, b: Arrangement): boolean {
  if (a === b) return true;
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const k of keys) {
    const x = a[k] ?? [];
    const y = b[k] ?? [];
    if (x.length !== y.length) return false;
    for (let i = 0; i < x.length; i++) if (x[i] !== y[i]) return false;
  }
  return true;
}

/**
 * Record a new present. Redo is dropped, because branching history is a
 * feature nobody asked for and a confusing one to explain in a tier list.
 */
export function push<T>(state: History<T>, next: T, equal?: (a: T, b: T) => boolean): History<T> {
  if (equal ? equal(state.present, next) : state.present === next) return state;
  const past = [...state.past, state.present];
  return {
    past: past.length > HISTORY_LIMIT ? past.slice(past.length - HISTORY_LIMIT) : past,
    present: next,
    future: [],
  };
}

export function undo<T>(state: History<T>): History<T> {
  if (!state.past.length) return state;
  const present = state.past[state.past.length - 1];
  return {
    past: state.past.slice(0, -1),
    present,
    future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
  };
}

export function redo<T>(state: History<T>): History<T> {
  if (!state.future.length) return state;
  const [present, ...future] = state.future;
  return { past: [...state.past, state.present].slice(-HISTORY_LIMIT), present, future };
}

/** Start again from a new baseline, dropping everything behind it. */
export function reset<T>(present: T): History<T> {
  return initHistory(present);
}

export const canUndo = (s: History<unknown>) => s.past.length > 0;
export const canRedo = (s: History<unknown>) => s.future.length > 0;
