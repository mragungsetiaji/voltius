import { test, expect } from "vitest";
import { buildTeamVaultTransferPlan } from "../src/services/teamVaultPermissions.ts";

const canAll = () => true;

test("host transfer includes primary and jump-host identities and keys once", () => {
  const plan = buildTeamVaultTransferPlan({
    operation: "copy",
    targetVaultId: "team-b",
    selected: { connectionIds: ["host-1"] },
    can: canAll,
    connections: [{
      id: "host-1",
      name: "Prod",
      host: "prod.example.com",
      port: 22,
      username: "deploy",
      auth_type: "key",
      tags: [],
      created_at: "now",
      updated_at: "now",
      last_used_at: null,
      clocks: {},
      vault_id: "team-a",
      identity_id: "identity-1",
      jump_hosts: [{ id: "jump-1", connection_id: "host-1", host: "bastion", port: 22, username: "jump", identity_id: "identity-2" }],
    }],
    identities: [
      { id: "identity-1", username: "deploy", tags: [], created_at: "now", updated_at: "now", clocks: {}, vault_id: "team-a", key_id: "key-1" },
      { id: "identity-2", username: "jump", tags: [], created_at: "now", updated_at: "now", clocks: {}, vault_id: "team-a", key_id: "key-1" },
    ],
    keys: [{ id: "key-1", name: "Shared", tags: [], created_at: "now", updated_at: "now", clocks: {}, vault_id: "team-a" }],
    folders: [],
    snippets: [],
    snippetFolders: [],
  });

  expect([...plan.connections.keys()]).toEqual(["host-1"]);
  expect([...plan.identities.keys()].sort()).toEqual(["identity-1", "identity-2"]);
  expect([...plan.keys.keys()]).toEqual(["key-1"]);
  expect(plan.allowed).toBe(true);
  expect(plan.destinationPermissions.sort()).toEqual(["EDIT_CONNECTIONS", "EDIT_IDENTITIES", "EDIT_KEYS"]);
  expect(plan.sourcePermissions.sort()).toEqual(["COPY_SECRETS", "VIEW_SECRETS"]);
});

test("folder transfer includes nested folders and descendant objects", () => {
  const plan = buildTeamVaultTransferPlan({
    operation: "move",
    targetVaultId: "team-b",
    selected: { folderIds: ["folder-root"] },
    can: canAll,
    connections: [{
      id: "host-1",
      host: "prod.example.com",
      port: 22,
      username: "deploy",
      auth_type: "password",
      tags: [],
      created_at: "now",
      updated_at: "now",
      last_used_at: null,
      clocks: {},
      vault_id: "team-a",
      folder_id: "folder-child",
    }],
    identities: [],
    keys: [],
    folders: [
      { id: "folder-root", name: "Root", object_type: "connection", created_at: "now", updated_at: "now", clocks: {}, vault_id: "team-a" },
      { id: "folder-child", name: "Child", object_type: "connection", created_at: "now", updated_at: "now", clocks: {}, vault_id: "team-a", parent_folder_id: "folder-root" },
    ],
    snippets: [],
    snippetFolders: [],
  });

  expect([...plan.folders.keys()].sort()).toEqual(["folder-child", "folder-root"]);
  expect([...plan.connections.keys()]).toEqual(["host-1"]);
  expect(plan.allowed).toBe(true);
  expect(plan.destinationPermissions.sort()).toEqual(["EDIT_CONNECTIONS", "EDIT_FOLDERS"]);
  expect(plan.sourcePermissions.sort()).toEqual(["EDIT_CONNECTIONS", "EDIT_FOLDERS"]);
});

test("target is denied when destination lacks required dependency permission", () => {
  const plan = buildTeamVaultTransferPlan({
    operation: "copy",
    targetVaultId: "team-b",
    selected: { identityIds: ["identity-1"] },
    can: (permission) => permission !== "EDIT_KEYS",
    connections: [],
    identities: [{ id: "identity-1", username: "deploy", tags: [], created_at: "now", updated_at: "now", clocks: {}, vault_id: "team-a", key_id: "key-1" }],
    keys: [{ id: "key-1", name: "Shared", tags: [], created_at: "now", updated_at: "now", clocks: {}, vault_id: "team-a" }],
    folders: [],
    snippets: [],
    snippetFolders: [],
  });

  expect(plan.allowed).toBe(false);
  expect(plan.deniedReasons).toEqual(["Missing EDIT_KEYS on team-b"]);
});
