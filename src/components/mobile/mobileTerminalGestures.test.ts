import {
  cellFromPoint,
  wordRangeAt,
  isBlankCell,
  linesFromPixelDelta,
  extendSelection,
  type CellMetrics,
} from "./mobileTerminalGestures.ts";
import { test } from "vitest";

test("mobileTerminalGestures", async () => {
function assert(cond: boolean, msg: string) { if (!cond) throw new Error(msg); }
function eq<T>(a: T, b: T, msg: string) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${msg}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`); }

const m: CellMetrics = { left: 10, top: 20, cellWidth: 8, cellHeight: 16, cols: 80, rows: 24, viewportTop: 100 };

// cellFromPoint: maps client px to absolute buffer cell.
eq(cellFromPoint(m, 10, 20), { col: 0, line: 100 }, "origin maps to col0/viewportTop");
eq(cellFromPoint(m, 10 + 8 * 3 + 2, 20 + 16 * 2 + 1), { col: 3, line: 102 }, "mid maps via floor");
// Clamped inside the grid.
eq(cellFromPoint(m, -100, -100), { col: 0, line: 100 }, "clamps low");
eq(cellFromPoint(m, 99999, 99999), { col: 79, line: 123 }, "clamps high to cols-1 / last visible line");

// wordRangeAt: maximal run of non-whitespace around col.
eq(wordRangeAt("ls -la /etc", 0), { startCol: 0, len: 2 }, "word at start");
eq(wordRangeAt("ls -la /etc", 4), { startCol: 3, len: 3 }, "word -la");
eq(wordRangeAt("ls -la /etc", 8), { startCol: 7, len: 4 }, "word /etc");
// On whitespace → zero-length at that col.
eq(wordRangeAt("ls -la", 2), { startCol: 2, len: 0 }, "whitespace → empty word");

// isBlankCell.
assert(isBlankCell("ls", 5), "past end is blank");
assert(isBlankCell("a b", 1), "space is blank");
assert(!isBlankCell("a b", 0), "letter is not blank");

// linesFromPixelDelta: accumulates a fractional carry.
eq(linesFromPixelDelta(8, 16, 0), { lines: 0, carry: 0.5 }, "half a cell carries");
eq(linesFromPixelDelta(8, 16, 0.5), { lines: 1, carry: 0 }, "carry completes a line");
eq(linesFromPixelDelta(-24, 16, 0), { lines: -1, carry: -0.5 }, "negative truncates toward zero");

// extendSelection: same line → char-precise; cross-line → whole lines.
eq(
  extendSelection({ col: 3, line: 100 }, { col: 6, line: 100 }, { col: 9, line: 100 }),
  { kind: "line", startCol: 3, line: 100, len: 7 },
  "same line extends to focus",
);
eq(
  extendSelection({ col: 3, line: 100 }, { col: 6, line: 100 }, { col: 1, line: 100 }),
  { kind: "line", startCol: 1, line: 100, len: 6 },
  "same line extends left of anchor",
);
eq(
  extendSelection({ col: 3, line: 100 }, { col: 6, line: 100 }, { col: 2, line: 104 }),
  { kind: "lines", start: 100, end: 104 },
  "cross line → whole lines",
);
eq(
  extendSelection({ col: 3, line: 100 }, { col: 6, line: 100 }, { col: 2, line: 97 }),
  { kind: "lines", start: 97, end: 100 },
  "cross line upward → whole lines",
);
});
