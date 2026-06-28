import { test, expect } from "vitest";
import { parseQuickConnect, buildQuickConnectConnection } from "../src/services/quickConnect.ts";

test("ssh: bare host defaults user=root port=22", () => {
  expect(parseQuickConnect("root@host")).toEqual({ kind: "ssh", user: "root", host: "host", port: 22 });
  expect(parseQuickConnect("host:2222")).toEqual({ kind: "ssh", user: "root", host: "host", port: 2222 });
});

test("ssh: user@host:port", () => {
  expect(parseQuickConnect("alice@example.com:2200")).toEqual({ kind: "ssh", user: "alice", host: "example.com", port: 2200 });
});

test("ssh: ssh prefix is stripped", () => {
  expect(parseQuickConnect("ssh bob@10.0.0.5")).toEqual({ kind: "ssh", user: "bob", host: "10.0.0.5", port: 22 });
});

test("ssh: -p flag wins over :port", () => {
  expect(parseQuickConnect("-p 2222 bob@host:9999")).toEqual({ kind: "ssh", user: "bob", host: "host", port: 2222 });
});

test("ssh: unrelated flags dropped", () => {
  expect(parseQuickConnect("ssh -v -i key bob@host")).toEqual({ kind: "ssh", user: "bob", host: "host", port: 22 });
});

test("serial: keyword, port, and device paths", () => {
  expect(parseQuickConnect("serial")).toEqual({ kind: "serial" });
  expect(parseQuickConnect("serial /dev/ttyUSB0")).toEqual({ kind: "serial", port: "/dev/ttyUSB0" });
  expect(parseQuickConnect("/dev/ttyACM0")).toEqual({ kind: "serial", port: "/dev/ttyACM0" });
  expect(parseQuickConnect("/dev/cu.usbserial-1410")).toEqual({ kind: "serial", port: "/dev/cu.usbserial-1410" });
  expect(parseQuickConnect("COM3")).toEqual({ kind: "serial", port: "COM3" });
  expect(parseQuickConnect("com3")).toEqual({ kind: "serial", port: "com3" });
});

test("local: keyword and optional shell", () => {
  expect(parseQuickConnect("local")).toEqual({ kind: "local" });
  expect(parseQuickConnect("local bash")).toEqual({ kind: "local", shell: "bash" });
  expect(parseQuickConnect("local zsh")).toEqual({ kind: "local", shell: "zsh" });
});

test("ssh: bare hostname via ssh prefix and trimming", () => {
  expect(parseQuickConnect("ssh myserver")).toEqual({ kind: "ssh", user: "root", host: "myserver", port: 22 });
  expect(parseQuickConnect("  root@host  ")).toEqual({ kind: "ssh", user: "root", host: "host", port: 22 });
});

test("negatives return null", () => {
  for (const s of ["", "   ", "prod", "my-server", "> snippet", "@ settings", "m> mp", "join abc"]) {
    expect(parseQuickConnect(s), `expected null for ${JSON.stringify(s)}`).toBe(null);
  }
});

test("buildQuickConnectConnection: maps ssh intent to an ephemeral personal connection", () => {
  const c = buildQuickConnectConnection({ kind: "ssh", user: "alice", host: "10.0.0.5", port: 2222 });
  expect(c.name).toBe("alice@10.0.0.5");
  expect(c.host).toBe("10.0.0.5");
  expect(c.port).toBe(2222);
  expect(c.username).toBe("alice");
  expect(c.auth_type).toBe("password");
  expect(c.vault_id).toBe("personal");
  expect(c.tags).toEqual([]);
  expect(c.last_used_at).toBe(null);
  expect(typeof c.id).toBe("string");
  expect(c.id.length > 0).toBeTruthy();
});
