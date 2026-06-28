import { test, expect } from "vitest";
import { classifyTeamObjectListError } from "../src/services/teamVaultLoadErrors.ts";

test("team object list 500 falls back to legacy blob loading", () => {
  expect(classifyTeamObjectListError(new Error("Failed to list team objects: 500"))).toBe("fallback");
});

test("team object list authorization errors map to user-facing states", () => {
  expect(classifyTeamObjectListError(new Error("permission denied 403"))).toBe("forbidden");
  expect(classifyTeamObjectListError(new Error("requires active subscription 402"))).toBe("payment_required");
});
