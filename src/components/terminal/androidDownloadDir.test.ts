import { needsPicker } from "./androidDownloadDir.ts";
import { test } from "vitest";

test("androidDownloadDir", async () => {
function equal<T>(actual: T, expected: T) {
  if (actual !== expected) throw new Error(`Expected ${String(expected)}, got ${String(actual)}`);
}

function run() {
  equal(needsPicker(null), true);
  equal(needsPicker({ uri: "", displayName: null }), true);
  equal(needsPicker({ uri: "content://tree/x", displayName: "x" }), false);
}

run();
});
