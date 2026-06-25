import { describe, it, expect } from "vitest";
import { Chunk } from "@codemirror/merge";
import { Text } from "@codemirror/state";
import { applySpec } from "./diffApply";

const docA = Text.of(["a", "B", "c"]); // offsets: line starts 0,2,4 ; length 5
const docB = Text.of(["a", "b", "c"]);
const mk = (fromA: number, toA: number, fromB: number, toB: number) =>
  new Chunk([], fromA, toA, fromB, toB);

describe("applySpec — mod", () => {
  const c = mk(2, 4, 2, 4); // line "B" vs "b"
  it("toRight copies A→B", () => {
    expect(applySpec(c, "toRight", docA, docB, "\n")).toEqual({
      target: "b",
      change: { from: 2, to: 4, insert: "B\n" },
    });
  });
  it("toLeft copies B→A", () => {
    expect(applySpec(c, "toLeft", docA, docB, "\n")).toEqual({
      target: "a",
      change: { from: 2, to: 4, insert: "b\n" },
    });
  });
});

describe("applySpec — ins (empty in A)", () => {
  const insA = Text.of(["a", "c"]);      // length 3, line starts 0,2
  const insB = Text.of(["a", "b", "c"]); // length 5, line starts 0,2,4
  const c = mk(2, 2, 2, 4);              // empty in A at 2; B covers "b" at 2..4
  it("toRight removes the B-only insertion", () => {
    expect(applySpec(c, "toRight", insA, insB, "\n")).toEqual({
      target: "b",
      change: { from: 2, to: 4, insert: "" },
    });
  });
  it("toLeft copies the inserted line into A", () => {
    expect(applySpec(c, "toLeft", insA, insB, "\n")).toEqual({
      target: "a",
      change: { from: 2, to: 2, insert: "b\n" },
    });
  });
});
