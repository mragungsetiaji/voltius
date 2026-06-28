import { test, expect } from "vitest";
import { selectVaultScopedItems } from "../src/utils/vaultScopedItems.ts";

type Item = { id: string; vault_id?: string };

const localItems: Item[] = [
  { id: "personal-missing" },
  { id: "personal-explicit", vault_id: "personal" },
  { id: "local-1", vault_id: "local-vault-1" },
  { id: "local-2", vault_id: "local-vault-2" },
];

const teamItems: Record<string, Item[]> = {
  "team-1": [{ id: "team-1-item", vault_id: "team-1" }],
};

test("selects local vault items from the local store instead of team maps", () => {
  expect(selectVaultScopedItems({
      vaultId: "local-vault-1",
      localItems,
      teamItems,
      teamVaultIds: new Set(["team-1"]),
    }).map((item) => item.id)).toEqual(["local-1"]);
});

test("selects team vault items from the team map", () => {
  expect(selectVaultScopedItems({
      vaultId: "team-1",
      localItems,
      teamItems,
      teamVaultIds: new Set(["team-1"]),
    }).map((item) => item.id)).toEqual(["team-1-item"]);
});

test("selects only personal items for the personal vault", () => {
  expect(selectVaultScopedItems({
      vaultId: "personal",
      localItems,
      teamItems,
      teamVaultIds: new Set(["team-1"]),
    }).map((item) => item.id)).toEqual(["personal-missing", "personal-explicit"]);
});
