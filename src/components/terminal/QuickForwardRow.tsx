import { useState, type RefObject } from "react";
import { Icon } from "@iconify/react";
import { parseQuickForward } from "@/utils/parseQuickForward";

export function QuickForwardRow({
  inputRef,
  onSubmit,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (remotePort: number, localPort?: number) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    const parsed = parseQuickForward(value);
    if (!parsed.ok) { setError(parsed.error); return; }
    setBusy(true);
    setError(null);
    try {
      await onSubmit(parsed.remotePort, parsed.localPort);
      setValue("");
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="border-t border-(--t-border) px-2 py-1.5 shrink-0">
      <div className="flex items-center gap-1.5">
        <Icon icon="lucide:plus" width={13} className="text-(--t-text-muted) shrink-0" />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); if (error) setError(null); }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); void submit(); }
            else if (e.key === "Escape") { setValue(""); setError(null); }
          }}
          disabled={busy}
          placeholder="Forward a Port (e.g. 3000 or 3000:8080)"
          spellCheck={false}
          className="flex-1 min-w-0 bg-transparent outline-none text-xs text-(--t-text-primary)
            placeholder:text-(--t-text-dim)"
        />
        {busy && <Icon icon="lucide:loader-circle" width={12} className="animate-spin text-(--t-text-muted) shrink-0" />}
      </div>
      {error && (
        <p className="text-[10px] text-red-400 mt-0.5 pl-[18px] leading-tight">{error}</p>
      )}
    </div>
  );
}
