import { test, expect } from "vitest";
import { getHostDeleteTargetIds } from "../src/components/hosts/hostSelection.ts";

test("deletes all selected hosts when deleting a selected host in a multi-selection", () => {
  expect(getHostDeleteTargetIds("host-2", new Set(["host-1", "host-2", "folder-1"]), ["host-1", "host-2"])).toEqual(["host-1", "host-2"]);
});

test("deletes only the clicked host when it is not part of the multi-selection", () => {
  expect(getHostDeleteTargetIds("host-3", new Set(["host-1", "host-2"]), ["host-1", "host-2"])).toEqual(["host-3"]);
});

test("deletes only the clicked host when fewer than two hosts are selected", () => {
  expect(getHostDeleteTargetIds("host-1", new Set(["host-1", "folder-1"]), ["host-1"])).toEqual(["host-1"]);
});
