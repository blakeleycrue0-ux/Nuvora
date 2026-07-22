import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "accent" | "success" | "warning" | "danger";

const tones: Record<Tone, string> = {
  default: "bg-surface-2 text-text-secondary border-border",
  accent: "text-accent border-transparent",
  success: "bg-success-soft text-success border-transparent",
  warning: "bg-warning-soft text-warning border-transparent",
  danger: "bg-danger-soft text-danger border-transparent",
};

interface Props extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ className, tone = "default", style, ...props }: Props) {
  const accentStyle = tone === "accent" ? { background: "var(--accent-soft)", ...style } : style;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide",
        tones[tone],
        className,
      )}
      style={accentStyle}
      {...props}
    />
  );
}
