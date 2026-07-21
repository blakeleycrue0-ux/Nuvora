import { Flame, Footprints, Droplets } from "lucide-react";
import { ProgressRing } from "@/components/ui/ProgressRing";

export function MiniDashboardPreview() {
  return (
    <div className="flex h-full flex-col gap-3 p-3.5 pt-9">
      <div className="flex items-center justify-between px-1">
        <div>
          <p className="text-[9px] text-text-muted">Tuesday, July 20</p>
          <p className="text-[13px] font-semibold text-text">Good morning</p>
        </div>
        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-[#5B9DFF] to-primary" />
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-3">
        <div>
          <p className="text-[9px] text-text-muted">Calories left</p>
          <p className="mt-0.5 text-[18px] font-semibold tabular-nums text-text">1,240</p>
          <p className="text-[9px] text-text-secondary">of 2,400 kcal</p>
        </div>
        <ProgressRing value={64} max={100} size={54} strokeWidth={6}>
          <Flame size={16} className="text-primary" />
        </ProgressRing>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-border bg-card p-2.5">
          <Footprints size={13} className="text-[#199e70]" />
          <p className="mt-1.5 text-[13px] font-semibold tabular-nums text-text">8,412</p>
          <p className="text-[8.5px] text-text-muted">steps</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-2.5">
          <Droplets size={13} className="text-primary" />
          <p className="mt-1.5 text-[13px] font-semibold tabular-nums text-text">1.8L</p>
          <p className="text-[8.5px] text-text-muted">water</p>
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-border bg-card p-3">
        <p className="text-[9px] text-text-muted">This week</p>
        <div className="mt-2.5 flex h-16 items-end gap-1.5">
          {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-primary"
              style={{ height: `${h}%`, opacity: i === 5 ? 1 : 0.35 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
