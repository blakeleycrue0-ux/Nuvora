"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface Point {
  label: string;
  value: number;
}

interface LineChartProps {
  data: Point[];
  color?: string;
  height?: number;
  className?: string;
  valueSuffix?: string;
  formatValue?: (value: number) => string;
}

export function LineChart({
  data,
  color = "var(--color-primary)",
  height = 160,
  className,
  formatValue,
}: LineChartProps) {
  const gradientId = useId();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = 560;
  const padX = 12;
  const padY = 16;

  const { linePath, areaPath, points, min, max } = useMemo(() => {
    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    const pts = data.map((d, i) => {
      const x = padX + (i / Math.max(data.length - 1, 1)) * innerW;
      const y = padY + innerH - ((d.value - min) / range) * innerH;
      return { x, y, ...d };
    });

    const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    const area = `${line} L ${pts[pts.length - 1].x} ${height - padY} L ${pts[0].x} ${height - padY} Z`;

    return { linePath: line, areaPath: area, points: pts, min, max };
  }, [data, height]);

  const active = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className={cn("relative w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full overflow-visible"
        preserveAspectRatio="none"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* recessive gridlines */}
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={padX}
            x2={width - padX}
            y1={padY + t * (height - padY * 2)}
            y2={padY + t * (height - padY * 2)}
            stroke="var(--color-border)"
            strokeWidth={1}
            strokeDasharray="3 4"
          />
        ))}

        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {active && (
          <line
            x1={active.x}
            x2={active.x}
            y1={padY}
            y2={height - padY}
            stroke="var(--color-border)"
            strokeWidth={1}
          />
        )}

        {points.map((p, i) => (
          <g key={p.label}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIndex === i ? 4.5 : 0}
              fill={color}
              stroke="var(--color-bg)"
              strokeWidth={2}
              className="transition-all duration-150"
            />
            <rect
              x={p.x - (width / data.length) / 2}
              y={0}
              width={width / data.length}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
            />
          </g>
        ))}
      </svg>

      {active && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-border bg-bg-elevated px-2.5 py-1.5 text-xs shadow-lift"
          style={{
            left: `${(active.x / width) * 100}%`,
            top: `${(active.y / height) * 100 - 6}%`,
          }}
        >
          <div className="font-medium text-text tabular-nums">
            {formatValue ? formatValue(active.value) : active.value}
          </div>
          <div className="text-text-muted">{active.label}</div>
        </div>
      )}

      <div className="mt-2 flex justify-between text-[11px] text-text-muted">
        {data.map((d, i) => (
          <span
            key={d.label}
            className={cn(
              (data.length > 6 && i % Math.ceil(data.length / 6) !== 0) && "opacity-0",
            )}
          >
            {d.label}
          </span>
        ))}
      </div>

      <span className="sr-only">
        Range from {formatValue ? formatValue(min) : min} to {formatValue ? formatValue(max) : max}
      </span>
    </div>
  );
}
