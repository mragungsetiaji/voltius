import { describe, it, expect, vi, beforeEach } from "vitest";

const invoke = vi.fn();
vi.mock("@tauri-apps/api/core", () => ({ invoke: (...a: unknown[]) => invoke(...a) }));

import { readEditorFile, writeEditorFile, fsReadFile, fsWriteFile } from "./sftp";

describe("editor file dispatchers", () => {
  beforeEach(() => invoke.mockReset());

  it("reads local via fs_read_file when sftpId is null", async () => {
    invoke.mockResolvedValue({ content: "hi", size: 2 });
    const f = await readEditorFile(null, "/a.txt", 100);
    expect(f.content).toBe("hi");
    expect(invoke).toHaveBeenCalledWith("fs_read_file", { path: "/a.txt", maxBytes: 100 });
  });

  it("reads remote via sftp_read_file when sftpId is set", async () => {
    invoke.mockResolvedValue({ content: "hi", size: 2 });
    await readEditorFile("s1", "/a.txt", 100);
    expect(invoke).toHaveBeenCalledWith("sftp_read_file", { sftpId: "s1", path: "/a.txt", maxBytes: 100 });
  });

  it("writes local via fs_write_file when sftpId is null", async () => {
    invoke.mockResolvedValue(undefined);
    await writeEditorFile(null, "/a.txt", "data");
    expect(invoke).toHaveBeenCalledWith("fs_write_file", { path: "/a.txt", content: "data" });
  });

  it("writes remote via sftp_write_file when sftpId is set", async () => {
    invoke.mockResolvedValue(undefined);
    await writeEditorFile("s1", "/a.txt", "data");
    expect(invoke).toHaveBeenCalledWith("sftp_write_file", { sftpId: "s1", path: "/a.txt", content: "data" });
  });

  it("fsReadFile/fsWriteFile call the fs_* commands directly", async () => {
    invoke.mockResolvedValue({ content: "x", size: 1 });
    await fsReadFile("/a", 5);
    expect(invoke).toHaveBeenCalledWith("fs_read_file", { path: "/a", maxBytes: 5 });
    invoke.mockResolvedValue(undefined);
    await fsWriteFile("/a", "y");
    expect(invoke).toHaveBeenCalledWith("fs_write_file", { path: "/a", content: "y" });
  });
});
