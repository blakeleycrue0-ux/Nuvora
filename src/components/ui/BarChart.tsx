"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Bar {
  label: string;
  value: number;
  highlight?: boolean;
}

interface BarChartProps {
  data: Bar[];
  height?: number;
  color?: string;
  highlightColor?: string;
  className?: string;
  formatValue?: (value: number) => string;
}

export function BarChart({
  data,
  height = 140,
  color = "var(--color-primary)",
  highlightColor = "var(--color-primary)",
  className,
  formatValue,
}: BarChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className={cn("w-full", className)}>
      <div className="flex gap-2.5" style={{ height: `${height}px` }}>
        {data.map((d, i) => {
          const pct = Math.max((d.value / max) * 100, 3);
          const isActive = hoverIndex === i;
          return (
            <div
              key={d.label}
              className="group relative flex flex-1 flex-col items-center justify-end gap-2"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {isActive && (
                <div className="pointer-events-none absolute -top-9 z-10 whitespace-nowrap rounded-lg border border-border bg-bg-elevated px-2 py-1 text-xs font-medium text-text shadow-lift tabular-nums">
                  {formatValue ? formatValue(d.value) : d.value}
                </div>
              )}
              <div
                className="w-full rounded-t-md transition-all duration-300 ease-out"
                style={{
                  height: `${pct}%`,
                  background: d.highlight ? highlightColor : color,
                  opacity: isActive || d.highlight ? 1 : 0.45,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2.5 flex gap-2.5">
        {data.map((d) => (
          <span
            key={d.label}
            className="flex-1 text-center text-[11px] text-text-muted"
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
