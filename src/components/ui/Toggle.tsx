"use client";

import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  className?: string;
  label?: string;
}

export function Toggle({ checked, onChange, className, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6.5 w-11 shrink-0 items-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        checked ? "accent-gradient" : "bg-border-strong",
        className,
      )}
      style={{ height: 26, width: 44 }}
    >
      <span
        className="inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-300"
        style={{ transform: checked ? "translateX(21px)" : "translateX(3px)" }}
      />
    </button>
  );
}
