"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface RingProps {
  value: number;
  max?: number;
  size?: number;
  stroke?: number;
  gradient?: [string, string];
  trackClassName?: string;
  className?: string;
  children?: React.ReactNode;
  rounded?: boolean;
}

export function Ring({
  value,
  max = 100,
  size = 120,
  stroke = 12,
  gradient = ["var(--accent)", "var(--accent-3)"],
  trackClassName,
  className,
  children,
  rounded = true,
}: RingProps) {
  const gid = useId();
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const offset = circ * (1 - pct);
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradient[0]} />
            <stop offset="100%" stopColor={gradient[1]} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className={cn("stroke-border", trackClassName)}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth={stroke}
          strokeLinecap={rounded ? "round" : "butt"}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
