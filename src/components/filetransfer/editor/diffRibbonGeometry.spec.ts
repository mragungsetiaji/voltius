import { describe, it, expect } from "vitest";
import { Chunk } from "@codemirror/merge";
import { ribbonGeometry, type BandAt } from "./diffRibbonGeometry";

const dims = { channelLeft: 100, channelRight: 144 };
const mk = (fromA: number, toA: number, fromB: number, toB: number) =>
  new Chunk([], fromA, toA, fromB, toB);

describe("ribbonGeometry", () => {
  it("mod chunk → trapezoid linking both bands, button at band centroid", () => {
    const bandAt: BandAt = (side) =>
      side === "a" ? { top: 10, bottom: 30 } : { top: 10, bottom: 50 };
    const [s] = ribbonGeometry([mk(0, 4, 0, 6)], bandAt, dims);
    expect(s.kind).toBe("mod");
    expect(s.path).toBe("M 100 10 L 144 10 L 144 50 L 100 30 Z");
    expect(s.buttonY).toBe(25); // (10+30+10+50)/4
  });

  it("ins chunk → A band is flat (top===bottom)", () => {
    const bandAt: BandAt = (side) =>
      side === "a" ? { top: 20, bottom: 20 } : { top: 20, bottom: 60 };
    const [s] = ribbonGeometry([mk(4, 4, 4, 10)], bandAt, dims);
    expect(s.kind).toBe("ins");
    expect(s.path).toBe("M 100 20 L 144 20 L 144 60 L 100 20 Z");
    expect(s.buttonY).toBe(30); // (20+20+20+60)/4
  });

  it("maps every chunk", () => {
    const bandAt: BandAt = () => ({ top: 0, bottom: 0 });
    expect(ribbonGeometry([mk(0, 1, 0, 1), mk(2, 3, 2, 3)], bandAt, dims)).toHaveLength(2);
  });
});
