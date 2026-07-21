export function MiniProgressPreview() {
  const points = [58, 52, 60, 48, 44, 40, 36, 30];
  const w = 100;
  const h = 40;
  const path = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - (p / Math.max(...points)) * h;
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <div className="flex h-full flex-col gap-3 p-3.5 pt-9">
      <p className="px-1 text-[13px] font-semibold text-text">Progress</p>

      <div className="rounded-2xl border border-border bg-card p-3">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[9px] text-text-muted">Current weight</p>
            <p className="text-[16px] font-semibold tabular-nums text-text">176.2 lb</p>
          </div>
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-[9px] font-medium text-success">
            -8.4 lb
          </span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-14 w-full overflow-visible" preserveAspectRatio="none">
          <path d={path} fill="none" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {["Chest", "Waist", "Hips"].map((label, i) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-2.5 text-center">
            <p className="text-[12px] font-semibold tabular-nums text-text">{[41.2, 33.5, 39.8][i]}&Prime;</p>
            <p className="text-[8.5px] text-text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex-1 rounded-2xl border border-border bg-card p-3">
        <p className="text-[9px] text-text-muted">Latest achievement</p>
        <p className="mt-1.5 text-[11px] font-medium text-text">🔥 14-day logging streak</p>
      </div>
    </div>
  );
}
