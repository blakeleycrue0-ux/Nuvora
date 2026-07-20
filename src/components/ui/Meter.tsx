import { cn } from "@/lib/utils";

interface MeterProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
  trackClassName?: string;
}

export function Meter({ value, max, color = "var(--color-primary)", className, trackClassName }: MeterProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]", trackClassName, className)}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}
