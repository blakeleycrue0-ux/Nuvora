"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import { cn } from "@/lib/utils";

// The Fenom Progress Bubble — a code-generated energy orb. The liquid fill
// height maps to XP progress toward the next level; a circular ring traces the
// same percentage. No images, no character. Restrained and premium.
export interface ProgressBubbleProps {
  pct: number;       // 0–100 progress to next level
  level: number;
  xp: number;
  size?: number;
  className?: string;
}

const WAVELENGTH = 30;
const AMP = 2.6;

function wavePath(phase: number): string {
  const pts: string[] = [];
  for (let x = -WAVELENGTH; x <= 150; x += 3) {
    const y = (AMP * Math.sin((x / WAVELENGTH) * Math.PI * 2 + phase)).toFixed(2);
    pts.push(`${x} ${y}`);
  }
  return `M ${pts.map((p, i) => (i ? "L " : "") + p).join(" ")} L 150 220 L ${-WAVELENGTH} 220 Z`;
}

export function ProgressBubble({ pct, level, xp, size = 240, className }: ProgressBubbleProps) {
  const clamped = Math.max(0, Math.min(100, pct));
  // Orb geometry (viewBox 120): centre 60,60, orb r=44 → y ∈ [16,104].
  const surfaceY = 104 - (clamped / 100) * 88;

  const ringR = 54;
  const ringC = 2 * Math.PI * ringR;
  const ringOffset = ringC * (1 - clamped / 100);

  const front = useMemo(() => wavePath(0), []);
  const back = useMemo(() => wavePath(Math.PI), []);

  // Brief expand pulse when the level increases.
  const controls = useAnimationControls();
  const prevLevel = useRef<number | null>(null);
  useEffect(() => {
    if (prevLevel.current !== null && level > prevLevel.current) {
      void controls.start({ scale: [1, 1.06, 1], transition: { duration: 0.7, ease: "easeInOut" } });
    }
    prevLevel.current = level;
  }, [level, controls]);

  const [id] = useState(() => Math.random().toString(36).slice(2, 8));

  return (
    <motion.div animate={controls} className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size}>
        <defs>
          <clipPath id={`orb-${id}`}><circle cx="60" cy="60" r="44" /></clipPath>
          <linearGradient id={`liquid-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.55" />
          </linearGradient>
        </defs>

        {/* Ring: track + progress */}
        <circle cx="60" cy="60" r={ringR} fill="none" stroke="var(--border)" strokeWidth="5" />
        <motion.circle
          cx="60" cy="60" r={ringR} fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={ringC}
          initial={{ strokeDashoffset: ringC }}
          animate={{ strokeDashoffset: ringOffset }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          transform="rotate(-90 60 60)"
        />

        {/* Orb */}
        <g clipPath={`url(#orb-${id})`}>
          <circle cx="60" cy="60" r="44" fill="var(--surface-2)" />
          {/* Liquid: rises to the XP percentage, gentle horizontal flow */}
          <motion.g initial={{ y: 104 }} animate={{ y: surfaceY }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
            <motion.path d={back} fill={`url(#liquid-${id})`} opacity={0.4}
              animate={{ x: [0, -WAVELENGTH] }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }} />
            <motion.path d={front} fill={`url(#liquid-${id})`}
              animate={{ x: [0, -WAVELENGTH] }} transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }} />
          </motion.g>
          {/* Soft highlight */}
          <circle cx="46" cy="42" r="9" fill="#fff" opacity="0.12" />
        </g>
      </svg>

      {/* Centre readout */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">Nivel</span>
        <span className="text-[40px] font-bold leading-none tracking-tight text-text">{level}</span>
        <span className="mt-1 text-[13px] font-semibold text-text-secondary">{xp.toLocaleString()} XP</span>
      </div>
    </motion.div>
  );
}
