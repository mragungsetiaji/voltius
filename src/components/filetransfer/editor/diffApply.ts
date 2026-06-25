import type { Chunk } from "@codemirror/merge";
import type { Text } from "@codemirror/state";

export type ApplyDir = "toRight" | "toLeft";
export interface ApplySpec {
  target: "a" | "b";
  change: { from: number; to: number; insert: string };
}

// `dir` "toRight" copies the left (A) chunk onto the right (B); "toLeft" the reverse.
// Mirrors MergeView's own revert: drop the chunk's trailing newline from the slice,
// re-add the source line break only for a non-empty source landing inside the dest.
export function applySpec(c: Chunk, dir: ApplyDir, docA: Text, docB: Text, lineBreak: string): ApplySpec {
  if (dir === "toRight") {
    let insert = docA.sliceString(c.fromA, Math.max(c.fromA, c.toA - 1));
    if (c.fromA !== c.toA && c.toB <= docB.length) insert += lineBreak;
    return { target: "b", change: { from: c.fromB, to: Math.min(docB.length, c.toB), insert } };
  }
  let insert = docB.sliceString(c.fromB, Math.max(c.fromB, c.toB - 1));
  if (c.fromB !== c.toB && c.toA <= docA.length) insert += lineBreak;
  return { target: "a", change: { from: c.fromA, to: Math.min(docA.length, c.toA), insert } };
}
