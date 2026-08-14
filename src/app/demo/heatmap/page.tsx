"use client";

// /demo/heatmap — a recordable "3 years of consistency" heatmap for marketing.
// It fills Year 1 → 2 → 3 (sparse → dense), Sundays always empty. Screen-record
// it and drop it into a gym montage. Self-contained, no data, safe to delete.

import { useEffect, useState } from "react";
import { motion } from "motion/react";

const WEEKS = 52;
const ROWS = 7; // Mon..Sun ; Sunday (index 6) stays empty
const DENSITY = [0, 0.18, 0.46, 0.82]; // index by year 1..3

// Deterministic pseudo-random so the pattern is stable and organic.
function hash(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export default function HeatmapDemo() {
  const [year, setYear] = useState(1);

  useEffect(() => {
    if (year >= 3) return;
    const t = setTimeout(() => setYear((y) => y + 1), 2200);
    return () => clearTimeout(t);
  }, [year]);

  const density = DENSITY[year];
  const daysTrained = { 1: 96, 2: 214, 3: 288 }[year] ?? 0;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-text-muted">Mi constancia</p>
      <motion.h1 key={year} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-[44px] font-bold leading-none tracking-tight text-text">
        Año {year}
      </motion.h1>
      <motion.p key={`d${year}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-[15px] font-medium text-accent">
        {daysTrained} días entrenados
      </motion.p>

      <div className="mt-8 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
        <div className="flex gap-[3px]">
          {Array.from({ length: WEEKS }).map((_, w) => (
            <div key={w} className="flex flex-1 flex-col gap-[3px]">
              {Array.from({ length: ROWS }).map((__, r) => {
                const sunday = r === 6;
                const h = hash(w * 7 + r + year * 1000);
                const filled = !sunday && h < density;
                const intensity = filled ? 0.35 + hash(w * 13 + r) * 0.65 : 0;
                return (
                  <motion.div
                    key={r}
                    initial={false}
                    animate={{ backgroundColor: filled ? `color-mix(in oklab, var(--accent) ${Math.round(intensity * 100)}%, var(--surface-2))` : "var(--surface-2)" }}
                    transition={{ duration: 0.35 }}
                    className="aspect-square w-full rounded-[2px]"
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-text-muted">
          <span>Lun</span><span>Dom (descanso)</span>
        </div>
      </div>

      <p className="mt-6 max-w-xs text-[13px] leading-relaxed text-text-muted">
        Cada cuadrado, un día. Los domingos, descanso. Tres años de constancia.
      </p>
    </div>
  );
}
