import type { Chunk } from "@codemirror/merge";
import { chunkKind, type ChunkKind } from "./diffChunks";

export interface Band { top: number; bottom: number; }
export type BandAt = (side: "a" | "b", from: number, to: number) => Band;
export interface RibbonDims { channelLeft: number; channelRight: number; }
export interface RibbonShape { kind: ChunkKind; path: string; buttonY: number; }

// One trapezoid per chunk: A's band on the channel's left edge, B's band on the
// right edge. For ins/del one band is flat (top===bottom) so it points at the line.
export function ribbonGeometry(
  chunks: readonly Chunk[],
  bandAt: BandAt,
  dims: RibbonDims,
): RibbonShape[] {
  const { channelLeft: L, channelRight: R } = dims;
  return chunks.map((c) => {
    const a = bandAt("a", c.fromA, c.endA);
    const b = bandAt("b", c.fromB, c.endB);
    const path = `M ${L} ${a.top} L ${R} ${b.top} L ${R} ${b.bottom} L ${L} ${a.bottom} Z`;
    const buttonY = (a.top + a.bottom + b.top + b.bottom) / 4;
    return { kind: chunkKind(c), path, buttonY };
  });
}
