"use client";

import { useEffect, useMemo, useState } from "react";
import { getSessions, FOCUS_EVENT } from "@/lib/focus/log";

// Polar "activity clock": 7 weekday rings × 24 hour sectors, intensity = focus
// minutes. Wraps every hour of the week around the clock.
const emptyGrid = () => Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}
function seg(cx: number, cy: number, ri: number, ro: number, a0: number, a1: number) {
  const [x0o, y0o] = polar(cx, cy, ro, a0);
  const [x1o, y1o] = polar(cx, cy, ro, a1);
  const [x1i, y1i] = polar(cx, cy, ri, a1);
  const [x0i, y0i] = polar(cx, cy, ri, a0);
  return `M${x0o},${y0o} A${ro},${ro} 0 0 1 ${x1o},${y1o} L${x1i},${y1i} A${ri},${ri} 0 0 0 ${x0i},${y0i} Z`;
}

export function ActivityClock({ size = 236 }: { size?: number }) {
  const [grid, setGrid] = useState<number[][]>(emptyGrid);

  useEffect(() => {
    const compute = () => {
      const g = emptyGrid();
      for (const s of getSessions()) {
        const d = new Date(s.ts);
        g[d.getDay()][d.getHours()] += s.minutes;
      }
      setGrid(g);
    };
    compute();
    window.addEventListener(FOCUS_EVENT, compute);
    return () => window.removeEventListener(FOCUS_EVENT, compute);
  }, []);

  const { max, total } = useMemo(() => {
    const flat = grid.flat();
    return { max: Math.max(1, ...flat), total: flat.reduce((a, b) => a + b, 0) };
  }, [grid]);

  const cx = size / 2;
  const cy = size / 2;
  const rInner = size * 0.14;
  const rOuter = size * 0.47;
  const ringStep = (rOuter - rInner) / 7;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {grid.map((hours, day) =>
          hours.map((v, h) => {
            const ri = rInner + day * ringStep + 0.6;
            const ro = rInner + (day + 1) * ringStep - 0.6;
            const a0 = (h / 24) * 360 + 0.8;
            const a1 = ((h + 1) / 24) * 360 - 0.8;
            const t = v / max;
            return (
              <path
                key={`${day}-${h}`}
                d={seg(cx, cy, ri, ro, a0, a1)}
                fill={v > 0 ? "var(--accent)" : "var(--border)"}
                fillOpacity={v > 0 ? 0.28 + 0.72 * t : 0.35}
              />
            );
          }),
        )}
        {/* hour ticks */}
        {["12a", "6a", "12p", "6p"].map((lbl, i) => {
          const [x, y] = polar(cx, cy, rOuter + 9, i * 90);
          return <text key={lbl} x={x} y={y} fill="var(--text-muted)" fontSize="9" textAnchor="middle" dominantBaseline="middle">{lbl}</text>;
        })}
      </svg>
      <p className="mt-2 text-[12px] text-text-muted">
        {total === 0 ? "Start a focus session to fill your clock." : `${(total / 60).toFixed(1)}h focused, by hour of week`}
      </p>
    </div>
  );
}
