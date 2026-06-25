import { describe, it, expect, vi, beforeEach } from "vitest";

const invoke = vi.fn();
vi.mock("@tauri-apps/api/core", () => ({ invoke: (...a: unknown[]) => invoke(...a) }));

const sftpOpen = vi.fn();
const sftpConnect = vi.fn();
const sftpCanonicalize = vi.fn();
const sftpClose = vi.fn();
const fsHomeDir = vi.fn();
vi.mock("@/services/sftp", () => ({
  sftpOpen: (...a: unknown[]) => sftpOpen(...a),
  sftpConnect: (...a: unknown[]) => sftpConnect(...a),
  sftpCanonicalize: (...a: unknown[]) => sftpCanonicalize(...a),
  sftpClose: (...a: unknown[]) => sftpClose(...a),
  fsHomeDir: (...a: unknown[]) => fsHomeDir(...a),
}));

const getConnState = vi.fn<() => { connections: unknown[]; teamConnections: Record<string, unknown[]> }>(
  () => ({ connections: [], teamConnections: {} }),
);
vi.mock("./connectionStore", () => ({ useConnectionStore: { getState: () => getConnState() } }));
vi.mock("./connectivitySettingsStore", () => ({ getGlobalKeepalivePreset: () => "default" }));
vi.mock("@/services/credentials", () => ({ resolveConnectionCredentials: vi.fn(), resolveJumpHosts: vi.fn() }));
vi.mock("@/utils/keepalive", () => ({ resolveKeepalive: () => ({ intervalSecs: 30, max: 3 }) }));
vi.mock("@/components/filetransfer/SFTPTypes", () => ({ genId: () => "id" }));

import { usePanelSftpStore } from "./panelSftpStore";
import type { TerminalSession } from "@/types";

const sshSession = (over: Partial<TerminalSession> = {}): TerminalSession => ({
  id: "sess1", connectionId: "missing", connectionName: "x", status: "connected", type: "ssh", ...over,
});

describe("panelSftpStore.ensureConnected", () => {
  beforeEach(() => {
    usePanelSftpStore.setState({ sessions: {} });
    invoke.mockReset(); sftpOpen.mockReset(); sftpConnect.mockReset();
    sftpCanonicalize.mockReset(); fsHomeDir.mockReset();
    getConnState.mockReturnValue({ connections: [], teamConnections: {} });
  });

  it("falls back to sftp_open when no saved connection exists", async () => {
    sftpOpen.mockResolvedValue("sftp-1");
    sftpCanonicalize.mockResolvedValue("/home/u");
    await usePanelSftpStore.getState().ensureConnected(sshSession());
    expect(sftpOpen).toHaveBeenCalledWith("sess1");
    expect(sftpConnect).not.toHaveBeenCalled();
    const st = usePanelSftpStore.getState().sessions["sess1"];
    expect(st.tag === "connected" && st.sftpId).toBe("sftp-1");
    expect(st.tag === "connected" && st.isLocal).toBe(false);
  });

  it("uses sftpConnect when a saved connection exists", async () => {
    getConnState.mockReturnValue({ connections: [{ id: "c1", host: "h", port: 22, username: "u" }], teamConnections: {} });
    sftpConnect.mockResolvedValue("sftp-2");
    sftpCanonicalize.mockResolvedValue("/home/u");
    const { resolveConnectionCredentials, resolveJumpHosts } = await import("@/services/credentials");
    (resolveConnectionCredentials as ReturnType<typeof vi.fn>).mockResolvedValue({ username: "u" });
    (resolveJumpHosts as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    await usePanelSftpStore.getState().ensureConnected(sshSession({ connectionId: "c1" }));
    expect(sftpConnect).toHaveBeenCalled();
    expect(sftpOpen).not.toHaveBeenCalled();
    const st = usePanelSftpStore.getState().sessions["sess1"];
    expect(st.tag === "connected" && st.sftpId).toBe("sftp-2");
  });
});
