import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Meter } from "@/components/ui/Meter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: LucideIcon;
  color: string;
  label: string;
  value: string;
  unit?: string;
  goalLabel?: string;
  progress?: { value: number; max: number };
  className?: string;
}

export function StatCard({ icon: Icon, color, label, value, unit, goalLabel, progress, className }: StatCardProps) {
  return (
    <Card className={cn("flex flex-col gap-3 p-4", className)}>
      <div className="flex items-center justify-between">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in oklab, ${color} 14%, transparent)` }}
        >
          <Icon size={15} style={{ color }} strokeWidth={2} />
        </span>
        <span className="text-[12px] text-text-muted">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[22px] font-semibold tabular-nums leading-none text-text">{value}</span>
        {unit && <span className="text-[12px] text-text-muted">{unit}</span>}
      </div>
      {progress && (
        <div className="flex flex-col gap-1.5">
          <Meter value={progress.value} max={progress.max} color={color} />
          {goalLabel && <span className="text-[11px] text-text-muted">{goalLabel}</span>}
        </div>
      )}
    </Card>
  );
}
