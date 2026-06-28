import { test, expect } from "vitest";
import {
  getTeamMembershipDelta,
  handleMembershipChangedEvent,
} from "../src/services/teamMembershipEvents.ts";

test("membership event detects added and removed teams", () => {
  expect(getTeamMembershipDelta(["team-a", "team-b"], ["team-b", "team-c"])).toEqual({
    added: ["team-c"],
    removed: ["team-a"],
  });
});

test("membership event runs setup for newly added teams after reloading teams", async () => {
  let teamIds = ["team-a"];
  const added: string[] = [];

  await handleMembershipChangedEvent({
    getTeamIds: () => teamIds,
    loadTeams: async () => { teamIds = ["team-a", "team-b"]; },
    onTeamAdded: async (teamId) => { added.push(teamId); },
  });

  expect(added).toEqual(["team-b"]);
});
