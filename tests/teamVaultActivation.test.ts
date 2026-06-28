import { test, expect } from "vitest";
import { markTeamVaultLoadedAfterLocalActivation } from "../src/services/teamVaultActivation.ts";

test("local team vault activation marks the vault loaded", () => {
  const calls: Array<[string, string]> = [];

  markTeamVaultLoadedAfterLocalActivation("team-a", {
    setStatus: (teamId, status) => { calls.push([teamId, status]); },
  });

  expect(calls).toEqual([["team-a", "loaded"]]);
});
