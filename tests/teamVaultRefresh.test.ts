import { test, expect } from "vitest";
import {
  shouldShowBlockingTeamVaultLoad,
  TeamVaultRefreshQueue,
} from "../src/services/teamVaultRefresh.ts";

test("background team vault refresh does not show blocking loading state", () => {
  expect(shouldShowBlockingTeamVaultLoad({ background: true })).toBe(false);
  expect(shouldShowBlockingTeamVaultLoad({ background: false })).toBe(true);
});

test("team vault refresh queue coalesces overlapping refreshes per team", async () => {
  const queue = new TeamVaultRefreshQueue();
  let runs = 0;
  let release: (() => void) | null = null;

  const first = queue.run("team-a", async () => {
    runs += 1;
    await new Promise<void>((resolve) => { release = resolve; });
  });
  const second = queue.run("team-a", async () => {
    runs += 1;
  });

  expect(first).toBe(second);
  expect(runs).toBe(1);
  release?.();
  await Promise.all([first, second]);

  await queue.run("team-a", async () => {
    runs += 1;
  });
  expect(runs).toBe(2);
});
