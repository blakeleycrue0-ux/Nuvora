"use client";

import { useMemo, useState } from "react";
import { useHabits } from "@/lib/momentum/store";
import { heatmapData } from "@/lib/momentum/stats";
import { parseISO } from "@/lib/momentum/date";

// GitHub-style contribution heatmap of total completions per day.
export function Heatmap({ weeks = 19 }: { weeks?: number }) {
  const { habits, completions } = useHabits();
  const days = weeks * 7;
  const data = useMemo(() => heatmapData(habits, completions, days), [habits, completions, days]);
  const [hover, setHover] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const max = Math.max(1, ...data.map((d) => d.count));

  // Group into weeks (columns). Pad the start so the first column aligns to Sunday.
  const firstDow = parseISO(data[0].date).getDay();
  const padded = [...Array(firstDow).fill(null), ...data];
  const columns: (typeof data[number] | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) columns.push(padded.slice(i, i + 7));

  const level = (c: number) => {
    if (c === 0) return 0;
    const r = c / max;
    if (r > 0.75) return 4;
    if (r > 0.5) return 3;
    if (r > 0.25) return 2;
    return 1;
  };
  const bg = ["var(--bg-subtle)", "color-mix(in oklab, var(--accent) 28%, var(--surface))", "color-mix(in oklab, var(--accent) 48%, var(--surface))", "color-mix(in oklab, var(--accent) 70%, var(--surface))", "var(--accent)"];

  return (
    <div className="relative">
      <div className="no-scrollbar flex gap-1 overflow-x-auto pb-1">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, ri) => {
              const cell = col[ri];
              if (!cell) return <span key={ri} className="h-3 w-3 rounded-[3px]" style={{ background: "transparent" }} />;
              return (
                <span
                  key={ri}
                  onMouseEnter={(e) => {
                    const r = (e.target as HTMLElement).getBoundingClientRect();
                    setHover({ date: cell.date, count: cell.count, x: r.left + r.width / 2, y: r.top });
                  }}
                  onMouseLeave={() => setHover(null)}
                  className="h-3 w-3 rounded-[3px] transition-transform hover:scale-125"
                  style={{ background: bg[level(cell.count)] }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-end gap-1.5 text-[10.5px] text-text-muted">
        <span>Less</span>
        {bg.map((b, i) => (
          <span key={i} className="h-3 w-3 rounded-[3px]" style={{ background: b }} />
        ))}
        <span>More</span>
      </div>
      {hover && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-elevated px-2.5 py-1.5 text-[11px] shadow-[var(--shadow-md)]"
          style={{ left: hover.x, top: hover.y - 6 }}
        >
          <span className="font-semibold text-text">{hover.count}</span>{" "}
          <span className="text-text-muted">on {parseISO(hover.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
        </div>
      )}
    </div>
  );
}
