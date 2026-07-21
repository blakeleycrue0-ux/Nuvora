import { ProgressRing } from "@/components/ui/ProgressRing";
import { Meter } from "@/components/ui/Meter";

const macros = [
  { label: "Protein", value: 142, max: 180, color: "#3B82F6" },
  { label: "Carbs", value: 210, max: 260, color: "#c98500" },
  { label: "Fat", value: 58, max: 80, color: "#9085e9" },
];

export function MiniNutritionPreview() {
  return (
    <div className="flex h-full flex-col gap-3 p-3.5 pt-9">
      <p className="px-1 text-[13px] font-semibold text-text">Nutrition</p>

      <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
        <ProgressRing value={72} max={100} size={50} strokeWidth={6} color="#22C55E">
          <span className="text-[10px] font-semibold text-text">72%</span>
        </ProgressRing>
        <div>
          <p className="text-[9px] text-text-muted">Daily goal</p>
          <p className="text-[13px] font-semibold text-text">1,730 kcal</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 rounded-2xl border border-border bg-card p-3">
        {macros.map((m) => (
          <div key={m.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-text-secondary">{m.label}</span>
              <span className="tabular-nums text-text-muted">
                {m.value}/{m.max}g
              </span>
            </div>
            <Meter value={m.value} max={m.max} color={m.color} />
          </div>
        ))}
      </div>

      <div className="flex-1 rounded-2xl border border-border bg-card p-3">
        <p className="text-[9px] text-text-muted">AI suggestion</p>
        <p className="mt-1.5 text-[10.5px] leading-relaxed text-text-secondary">
          Add a protein source to dinner to hit your target — grilled chicken or Greek yogurt work well.
        </p>
      </div>
    </div>
  );
}
