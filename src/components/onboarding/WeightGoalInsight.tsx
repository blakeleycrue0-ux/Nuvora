"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { TrendingDown, TrendingUp, Target, CalendarDays } from "lucide-react";

interface WeightGoalInsightProps {
  currentKg: number;
  targetKg: number;
}

type Difficulty = {
  label: string;
  color: string;
  soft: string;
  blurb: string;
};

function classify(pct: number): Difficulty {
  if (pct < 4) {
    return {
      label: "Easy",
      color: "var(--color-success)",
      soft: "var(--color-success-soft)",
      blurb: "A gentle change — you'll get there comfortably.",
    };
  }
  if (pct < 9) {
    return {
      label: "Realistic",
      color: "var(--color-success)",
      soft: "var(--color-success-soft)",
      blurb: "A healthy, very achievable target. Nice pick.",
    };
  }
  if (pct < 16) {
    return {
      label: "Challenging",
      color: "var(--color-warning)",
      soft: "var(--color-warning-soft)",
      blurb: "Ambitious but doable with consistency — we'll pace it right.",
    };
  }
  return {
    label: "Ambitious",
    color: "var(--chart-6)",
    soft: "color-mix(in oklab, var(--chart-6) 14%, transparent)",
    blurb: "A big transformation. We'll break it into steady, safe milestones.",
  };
}

export function WeightGoalInsight({ currentKg, targetKg }: WeightGoalInsightProps) {
  const data = useMemo(() => {
    const delta = currentKg - targetKg;
    const absDelta = Math.abs(delta);
    const losing = delta > 0;
    const maintaining = absDelta < 0.5;

    const pct = (absDelta / currentKg) * 100;
    // Healthy pace: ~0.7%/week losing, ~0.35%/week gaining.
    const weeklyRate = currentKg * (losing ? 0.007 : 0.0035);
    const weeks = Math.max(1, Math.round(absDelta / weeklyRate));
    const nuvoraWeeks = weeks;
    // "Typical app" framing — same physiology, slower adherence.
    const typicalWeeks = Math.round(weeks * 1.45);

    // Projection points for the mini curve (current -> target).
    const points = Array.from({ length: 7 }, (_, i) => {
      const t = i / 6;
      // ease-out curve so it flattens as it approaches goal
      const eased = 1 - Math.pow(1 - t, 1.7);
      return currentKg - delta * eased;
    });

    return { absDelta, losing, maintaining, pct, weeks: nuvoraWeeks, typicalWeeks, points };
  }, [currentKg, targetKg]);

  if (data.maintaining) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
          <Target size={16} className="text-primary" />
        </span>
        <p className="text-[13px] text-text-secondary">
          Maintaining your current weight — we&apos;ll dial in your calories to hold steady.
        </p>
      </motion.div>
    );
  }

  const diff = classify(data.pct);
  const months = Math.round((data.weeks / 4.33) * 10) / 10;

  // Mini curve geometry
  const w = 300;
  const h = 60;
  const min = Math.min(...data.points);
  const max = Math.max(...data.points);
  const range = max - min || 1;
  const path = data.points
    .map((p, i) => {
      const x = (i / (data.points.length - 1)) * w;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const maxBar = Math.max(data.weeks, data.typicalWeeks);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mt-5 flex flex-col gap-4 rounded-2xl border border-border bg-card p-5"
    >
      {/* Headline: amount + difficulty */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: diff.soft }}
          >
            {data.losing ? (
              <TrendingDown size={16} style={{ color: diff.color }} />
            ) : (
              <TrendingUp size={16} style={{ color: diff.color }} />
            )}
          </span>
          <div>
            <p className="text-[15px] font-semibold text-text">
              {data.losing ? "Lose" : "Gain"}{" "}
              <span className="tabular-nums">{data.absDelta.toFixed(1)} kg</span>
            </p>
            <p className="text-[11.5px] text-text-muted">
              {data.pct.toFixed(0)}% of your body weight
            </p>
          </div>
        </div>
        <motion.span
          key={diff.label}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="rounded-full border px-3 py-1 text-[12px] font-semibold"
          style={{ color: diff.color, background: diff.soft, borderColor: `color-mix(in oklab, ${diff.color} 30%, transparent)` }}
        >
          {diff.label}
        </motion.span>
      </div>

      <p className="text-[12.5px] leading-relaxed text-text-secondary">{diff.blurb}</p>

      {/* Projected curve */}
      <div>
        <div className="mb-1.5 flex items-center justify-between text-[11px] text-text-muted">
          <span>Projected path</span>
          <span className="tabular-nums">
            {currentKg} → {targetKg} kg
          </span>
        </div>
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wgi-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={diff.color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={diff.color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            d={`${path} L ${w} ${h} L 0 ${h} Z`}
            fill="url(#wgi-grad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke={diff.color}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
      </div>

      {/* Timeline estimate */}
      <div className="flex items-center gap-2 rounded-xl bg-bg-elevated px-3.5 py-2.5">
        <CalendarDays size={15} className="text-text-muted" />
        <p className="text-[12.5px] text-text-secondary">
          At a healthy pace, about{" "}
          <span className="font-semibold text-text tabular-nums">
            {data.weeks} weeks
          </span>{" "}
          <span className="text-text-muted">(~{months} months)</span>
        </p>
      </div>

      {/* Comparison bars — Nuvora vs typical app */}
      <div className="flex flex-col gap-2.5 border-t border-border pt-4">
        <p className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
          Estimated time to goal
        </p>
        <CompareBar label="With Nuvora" weeks={data.weeks} maxWeeks={maxBar} color="var(--color-primary)" highlight />
        <CompareBar label="Typical tracking app" weeks={data.typicalWeeks} maxWeeks={maxBar} color="var(--color-text-muted)" />
      </div>
    </motion.div>
  );
}

function CompareBar({
  label,
  weeks,
  maxWeeks,
  color,
  highlight,
}: {
  label: string;
  weeks: number;
  maxWeeks: number;
  color: string;
  highlight?: boolean;
}) {
  const pct = Math.max((weeks / maxWeeks) * 100, 8);
  return (
    <div className="flex items-center gap-3">
      <span className="w-32 shrink-0 text-[12px] text-text-secondary">{label}</span>
      <div className="relative h-6 flex-1 overflow-hidden rounded-lg bg-white/[0.04]">
        <motion.div
          className="flex h-full items-center justify-end rounded-lg px-2"
          style={{ background: highlight ? color : "color-mix(in oklab, var(--color-text-muted) 30%, transparent)" }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <span className={`text-[11px] font-semibold tabular-nums ${highlight ? "text-white" : "text-text-secondary"}`}>
            {weeks}w
          </span>
        </motion.div>
      </div>
    </div>
  );
}
