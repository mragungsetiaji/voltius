import { useEffect } from "react";
import type React from "react";
import { useTerminal } from "@/hooks/useTerminal";
import "@xterm/xterm/css/xterm.css";

interface Props {
  sessionId: string;
  sessionType: "ssh" | "local" | "serial";
  onClosed?: () => void;
  active?: boolean;
  inputGate?: React.RefObject<() => boolean>;
  encoding?: string;
  onResize?: (cols: number, rows: number) => void;
}

export default function TerminalView({ sessionId, sessionType, onClosed, active, inputGate, encoding, onResize }: Props) {
  const { attach, focus, fit } = useTerminal({ sessionId, sessionType, onClosed, inputGate, encoding, onResize });

  useEffect(() => {
    if (active) {
      focus();
      fit();
    }
  }, [active, focus, fit]);

  return (
    <div className="h-full w-full pl-3.5 pr-2.5">
      <div ref={attach} className="h-full w-full" />
    </div>
  );
}
