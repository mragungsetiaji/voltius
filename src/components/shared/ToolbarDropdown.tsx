import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import { DropdownMenuItem } from "@/components/shared/DropdownMenuItem";

export interface DropdownOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

export interface ActionItem {
  label: string;
  icon?: string;
  onClick: () => void;
}

interface Props<T extends string> {
  icon: string;
  value?: T;
  options?: DropdownOption<T>[];
  /** Action-mode items — renders without checkmarks, no value/onChange needed */
  items?: ActionItem[];
  menuWidth?: number;
  className?: string;
  onChange?: (value: T) => void;
  /** Text label shown beside the icon (e.g. "TERMINAL") */
  label?: string;
  /** If set, the trigger becomes a split button: clicking the label/icon runs this action, clicking the chevron opens the menu */
  onAction?: () => void;
  /** Which side the menu opens from (default: "right") */
  align?: "left" | "right";
  disabled?: boolean;
  /** "accent" styles the split button as a primary CTA */
  variant?: "default" | "accent";
}

export function ToolbarDropdown<T extends string>({
  icon, value, options, items, menuWidth = 160, className = "", onChange,
  label, onAction, align = "right", disabled, variant = "default",
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const menuItems = items ?? [];
  const selectOptions = options ?? [];
  const hasContent = items ? menuItems.length > 0 : selectOptions.length > 0;

  const menuEl = open && hasContent && (
    <div
      className={`absolute top-full ${align === "left" ? "left-0" : "right-0"} p-1.5 mt-1 rounded-xl z-50 flex flex-col bg-[var(--t-bg-card)] border border-[var(--t-bg-card-hover)]`}
      style={{ minWidth: `${(menuWidth / 15).toFixed(3)}rem`, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
    >
      {items
        ? menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              iconSize={15}
              onClick={() => { item.onClick(); setOpen(false); }}
            />
          ))
        : selectOptions.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              icon={opt.icon}
              label={opt.label}
              iconSize={20}
              checked={value === opt.value}
              onClick={() => { onChange!(opt.value); setOpen(false); }}
            />
          ))
      }
    </div>
  );

  if (onAction) {
    const isAccent = variant === "accent";
    const actionBg = isAccent ? "var(--t-accent)" : "var(--t-bg-input)";
    const actionBgHover = isAccent ? "var(--t-accent-hover)" : "var(--t-bg-input-hover)";
    const actionText = isAccent ? "var(--t-bg-terminal)" : "var(--t-text-primary)";
    const actionBorder = isAccent ? "var(--t-accent-hover)" : "var(--t-border-hover)";
    const chevronBg = isAccent ? "var(--t-accent)" : "var(--t-bg-input)";
    const chevronBgHover = isAccent ? "var(--t-accent-hover)" : "var(--t-bg-input-hover)";

    return (
      <div className={`relative flex items-center gap-px ${className}`} ref={ref}>
        <button
          type="button"
          onClick={onAction}
          disabled={disabled}
          className={`flex items-center gap-2 px-3 h-8 text-sm font-bold tracking-wider transition-colors shrink-0 whitespace-nowrap relative overflow-hidden border ${hasContent ? "border-r-0 rounded-tl-[0.533rem] rounded-bl-[0.533rem]" : "rounded-[0.533rem]"}`}
          style={{
            background: actionBg, color: actionText, borderColor: actionBorder,
            opacity: disabled ? 0.4 : 1, cursor: disabled ? "not-allowed" : "pointer",
          }}
          onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.background = actionBgHover; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = actionBg; }}
        >
          <Icon icon={icon} width={20} />
          {label}
        </button>
        {hasContent && <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center justify-center w-8 h-8 transition-colors relative overflow-hidden border rounded-tr-[0.533rem] rounded-br-[0.533rem]"
          style={{ background: chevronBg, color: actionText, borderColor: actionBorder }}
          onMouseEnter={(e) => (e.currentTarget.style.background = chevronBgHover)}
          onMouseLeave={(e) => (e.currentTarget.style.background = chevronBg)}
          title="More options"
        >
          <span className="[&_path]:[stroke-width:3]">
            <Icon icon="lucide:chevron-down" width={20} style={{ transition: "transform 150ms", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
          </span>
        </button>}
        {menuEl}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center px-2 h-8 rounded-lg transition-colors text-[var(--t-text-primary)] hover:text-[var(--t-tab-active-text)]"
      >
        <Icon icon={icon} width={24} />
        <span className="[&_path]:[stroke-width:3]">
          <Icon
            icon="lucide:chevron-down"
            width={20}
            style={{ transition: "transform 150ms", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </span>
      </button>

      {menuEl}
    </div>
  );
}
