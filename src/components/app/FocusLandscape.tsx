"use client";

import { useEffect, useMemo, useState } from "react";
import { getSessions, FOCUS_EVENT } from "@/lib/focus/log";

// Pseudo-3D ridgeline: one ridge per weekday, 24 hourly focus values each,
// stacked back-to-front for depth. A rolling landscape of focus by hour.
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function FocusLandscape() {
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: 7 }, () => Array(24).fill(0)));

  useEffect(() => {
    const compute = () => {
      const g = Array.from({ length: 7 }, () => Array(24).fill(0));
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

  const max = useMemo(() => Math.max(1, ...grid.flat()), [grid]);
  const total = useMemo(() => grid.flat().reduce((a, b) => a + b, 0), [grid]);

  const W = 560, H = 300, rows = 7;
  const dx = 24, dy = 22, amp = 74, leftPad = 60;
  const plotW = W - leftPad - 36 - dx * (rows - 1);
  const bottomY = H - 44;

  const ticks: [string, number][] = [["12a", 0], ["6a", 6], ["12p", 12], ["6p", 18]];

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="min-w-[420px]">
        <defs>
          <linearGradient id="fl-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* draw back (6) to front (0) so nearer ridges overlap farther ones */}
        {[6, 5, 4, 3, 2, 1, 0].map((i) => {
          const rowY = bottomY - i * dy;
          const xo = leftPad + i * dx;
          const pts = grid[i].map((v, h) => [xo + (h / 23) * plotW, rowY - (v / max) * amp] as const);
          const line = pts.map((p, k) => `${k ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
          const area = `${line} L ${(xo + plotW).toFixed(1)} ${rowY} L ${xo.toFixed(1)} ${rowY} Z`;
          return (
            <g key={i}>
              <path d={area} fill="url(#fl-fill)" />
              <path d={line} fill="none" stroke="var(--accent)" strokeWidth={1.6} strokeLinejoin="round" />
              <text x={xo - 8} y={rowY} textAnchor="end" dominantBaseline="middle" fill="var(--text-muted)" fontSize="9">{DAYS[i]}</text>
            </g>
          );
        })}

        {ticks.map(([lbl, h]) => (
          <text key={lbl} x={leftPad + (h / 23) * plotW} y={H - 16} textAnchor="middle" fill="var(--text-muted)" fontSize="9">{lbl}</text>
        ))}
      </svg>
      <p className="mt-1 text-center text-[12px] text-text-muted">
        {total === 0 ? "Focus sessions will build your landscape." : `${(total / 60).toFixed(1)}h focused across the week`}
      </p>
    </div>
  );
}
