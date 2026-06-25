import { describe, it, expect } from "vitest";
import { dropIntent, moveItem, samePairUnordered } from "./tabDragCore";

describe("dropIntent", () => {
  it("splits in half when diff is not allowed", () => {
    expect(dropIntent(10, 100, false)).toBe("before");
    expect(dropIntent(60, 100, false)).toBe("after");
  });
  it("uses 25% edges with a center diff zone when allowed", () => {
    expect(dropIntent(10, 100, true)).toBe("before");
    expect(dropIntent(50, 100, true)).toBe("diff");
    expect(dropIntent(90, 100, true)).toBe("after");
  });
});

describe("moveItem", () => {
  it("moves using an original-array insertion index", () => {
    expect(moveItem(["A","B","C"], 0, 2)).toEqual(["B","A","C"]);
    expect(moveItem(["A","B","C"], 0, 3)).toEqual(["B","C","A"]);
    expect(moveItem(["A","B","C"], 2, 0)).toEqual(["C","A","B"]);
  });
  it("no-ops when dropping in place", () => {
    expect(moveItem(["A","B","C"], 0, 1)).toEqual(["A","B","C"]);
    expect(moveItem(["A","B","C"], 1, 1)).toEqual(["A","B","C"]);
  });
});

describe("samePairUnordered", () => {
  const s = (sftpId: string | null, path: string) => ({ sftpId, path, hostLabel: "h" });
  it("matches regardless of side order", () => {
    expect(samePairUnordered(s(null,"/a"), s("x","/b"), s("x","/b"), s(null,"/a"))).toBe(true);
    expect(samePairUnordered(s(null,"/a"), s("x","/b"), s(null,"/a"), s("x","/b"))).toBe(true);
  });
  it("rejects different pairs", () => {
    expect(samePairUnordered(s(null,"/a"), s("x","/b"), s(null,"/a"), s("x","/c"))).toBe(false);
  });
});
