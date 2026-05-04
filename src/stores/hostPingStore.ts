import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PingStatus = "up" | "down" | "unknown";

interface HostPingStore {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
  pollIntervalMs: number;
  setPollIntervalMs: (v: number) => void;
  activePollIntervalMs: number;
  setActivePollIntervalMs: (v: number) => void;
  statuses: Record<string, PingStatus>;
  latencies: Record<string, number>;
  setStatus: (id: string, status: PingStatus, latencyMs?: number) => void;
  clearStatuses: () => void;
}

export const useHostPingStore = create<HostPingStore>()(
  persist(
    (set) => ({
      enabled: true,
      pollIntervalMs: 10_000,
      activePollIntervalMs: 2_000,
      statuses: {},
      latencies: {},
      setEnabled: (v) => set({ enabled: v }),
      setPollIntervalMs: (v) => set({ pollIntervalMs: v }),
      setActivePollIntervalMs: (v) => set({ activePollIntervalMs: v }),
      setStatus: (id, status, latencyMs) =>
        set((s) => ({
          statuses: { ...s.statuses, [id]: status },
          latencies: latencyMs !== undefined
            ? { ...s.latencies, [id]: latencyMs }
            : s.latencies,
        })),
      clearStatuses: () => set({ statuses: {}, latencies: {} }),
    }),
    {
      name: "voltius-host-ping",
      partialize: (s) => ({ enabled: s.enabled, pollIntervalMs: s.pollIntervalMs, activePollIntervalMs: s.activePollIntervalMs }),
    },
  ),
);
