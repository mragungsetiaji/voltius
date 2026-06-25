import type { DiffSide } from "@/stores/editorStore";

export type DropZone = "before" | "diff" | "after";

export function dropIntent(relX: number, width: number, allowDiff: boolean): DropZone {
  if (!allowDiff) return relX < width / 2 ? "before" : "after";
  const edge = width * 0.25;
  if (relX < edge) return "before";
  if (relX > width - edge) return "after";
  return "diff";
}

// `to` is an insertion index into the ORIGINAL array; adjusted for removal.
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (from < 0 || from >= arr.length) return arr.slice();
  const copy = arr.slice();
  const [item] = copy.splice(from, 1);
  const insert = from < to ? to - 1 : to;
  copy.splice(Math.max(0, Math.min(insert, copy.length)), 0, item);
  return copy;
}

function sameSide(a: DiffSide, b: DiffSide): boolean {
  return a.sftpId === b.sftpId && a.path === b.path;
}

export function samePairUnordered(
  left: DiffSide, right: DiffSide, a: DiffSide, b: DiffSide,
): boolean {
  return (sameSide(left, a) && sameSide(right, b)) ||
         (sameSide(left, b) && sameSide(right, a));
}
