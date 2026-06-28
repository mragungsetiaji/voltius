import { test, expect } from "vitest";
import {
  localSecretKeyFromTeamSecret,
  teamSecretFromLocalKey,
} from "../src/services/teamVaultSecretKeys.ts";

test("maps connection password and key secrets to team secret records", () => {
  expect(teamSecretFromLocalKey("password:conn-1")).toEqual({
    secretId: "password:conn-1",
    objectId: "conn-1",
    secretType: "connection_password",
  });
  expect(teamSecretFromLocalKey("key:conn-1")).toEqual({
    secretId: "key:conn-1",
    objectId: "conn-1",
    secretType: "connection_key",
  });
});

test("maps identity and ssh key secrets to team secret records", () => {
  expect(teamSecretFromLocalKey("identity:identity-1:password")).toEqual({
    secretId: "identity:identity-1:password",
    objectId: "identity-1",
    secretType: "identity_password",
  });
  expect(teamSecretFromLocalKey("key:key-1:private")).toEqual({
    secretId: "key:key-1:private",
    objectId: "key-1",
    secretType: "key_private",
  });
});

test("maps server team secrets back to local keychain keys", () => {
  expect(localSecretKeyFromTeamSecret("conn-1", "connection_password")).toBe("password:conn-1");
  expect(localSecretKeyFromTeamSecret("conn-1", "connection_key")).toBe("key:conn-1");
  expect(localSecretKeyFromTeamSecret("identity-1", "identity_password")).toBe("identity:identity-1:password");
  expect(localSecretKeyFromTeamSecret("key-1", "key_private")).toBe("key:key-1:private");
});
