import { useEffect, useRef, useState } from "react";
import { useEditorStore } from "@/stores/editorStore";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

export function EditorTabStrip() {
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const setActiveTab = useEditorStore((s) => s.setActiveTab);
  const closeTab = useEditorStore((s) => s.closeTab);
  const [pendingClose, setPendingClose] = useState<string | null>(null);

  // Keep the active tab visible when it changes and the strip has scrolled.
  const activeRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [activeTabId]);

  // Close immediately unless the tab has unsaved edits, in which case confirm.
  const requestClose = (id: string) => {
    const tab = tabs.find((t) => t.id === id);
    if (tab && tab.dirty) setPendingClose(id);
    else closeTab(id);
  };
  const pendingTab = pendingClose ? tabs.find((t) => t.id === pendingClose) : null;
  const pendingName = !pendingTab
    ? "this file"
    : pendingTab.kind === "file"
      ? (pendingTab.path.split("/").pop() ?? pendingTab.path)
      : "this diff";

  if (tabs.length === 0) return null;

  return (
    <div
      className="flex items-center pl-2 text-xs shrink-0"
      style={{
        borderBottom: "1px solid var(--t-border)",
        background: "var(--t-bg-elevated)",
        minHeight: "32px",
      }}
    >
      {/* "Files" stays pinned; only the tab list scrolls when it overflows. */}
      <button
        ref={activeTabId === null ? activeRef : undefined}
        className="shrink-0 px-2 py-1 rounded transition-colors"
        style={{
          fontWeight: activeTabId === null ? 600 : undefined,
          color: activeTabId === null ? "var(--t-text)" : "var(--t-text-dim)",
          background: activeTabId === null ? "var(--t-bg-card-hover)" : "transparent",
        }}
        onClick={() => setActiveTab(null)}
      >
        Files
      </button>
      <div className="flex items-center gap-1 px-2 min-w-0 overflow-x-auto">
      {tabs.map((t) => {
        const label =
          t.kind === "file"
            ? (t.path.split("/").pop() ?? t.path) + (t.dirty ? " ●" : "")
            : `diff: ${t.left.path.split("/").pop() ?? t.left.path} ↔ ${t.right.path.split("/").pop() ?? t.right.path}` + (t.dirty ? " ●" : "");
        const active = activeTabId === t.id;
        return (
          <span key={t.id} className="flex items-center gap-0.5 shrink-0">
            <button
              ref={active ? activeRef : undefined}
              className="px-2 py-1 rounded transition-colors"
              style={{
                fontWeight: active ? 600 : undefined,
                color: active ? "var(--t-text)" : "var(--t-text-dim)",
                background: active ? "var(--t-bg-card-hover)" : "transparent",
                maxWidth: "180px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={label}
              onClick={() => setActiveTab(t.id)}
            >
              {label}
            </button>
            <button
              className="px-1 py-1 rounded transition-colors"
              style={{ color: "var(--t-text-dim)" }}
              title="Close"
              onClick={() => requestClose(t.id)}
            >
              ×
            </button>
          </span>
        );
      })}
      </div>
      {pendingClose && (
        <ConfirmModal
          title="Discard unsaved changes?"
          message={`"${pendingName}" has unsaved changes. Closing this tab will discard them.`}
          confirmLabel="Discard"
          onConfirm={() => { closeTab(pendingClose); setPendingClose(null); }}
          onCancel={() => setPendingClose(null)}
        />
      )}
    </div>
  );
}
