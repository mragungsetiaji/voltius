import { test, expect } from "vitest";
import { SseDataLineParser } from "../src/services/realtimeSseEvents.ts";

test("SSE data parser preserves data lines split across chunks", () => {
  const parser = new SseDataLineParser();

  expect(parser.push("data: tea")).toEqual([]);
  expect(parser.push("m:team-a\n")).toEqual(["team:team-a"]);
});

test("SSE data parser flushes final unterminated data line", () => {
  const parser = new SseDataLineParser();

  expect(parser.push("data: presence:user-a:online")).toEqual([]);
  expect(parser.flush()).toEqual(["presence:user-a:online"]);
});
