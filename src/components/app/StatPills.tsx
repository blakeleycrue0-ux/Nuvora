"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Zap, Flame } from "lucide-react";
import { useProgress } from "@/components/progress/ProgressProvider";
import { useHabits } from "@/lib/momentum/store";
import { overallStats } from "@/lib/momentum/stats";
import { CoinBalance } from "@/components/progress/CoinBalance";

// The top-bar status cluster: PRO, level, streak, coins — as liquid-glass pills.
export function StatPills() {
  const { level, ready } = useProgress();
  const { habits, completions } = useHabits();
  const streak = useMemo(() => overallStats(habits, completions).bestCurrentStreak, [habits, completions]);
  if (!ready) return null;

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/settings"
        className="liquid-pill hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold sm:inline-flex"
        style={{ background: "var(--warning-soft)", color: "var(--warning)" }}
      >
        Get
        <span className="rounded-full border px-1.5 py-px text-[10px] font-bold tracking-wide" style={{ borderColor: "currentColor" }}>PRO</span>
      </Link>

      <span
        className="liquid-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-semibold tabular-nums"
        style={{ background: "var(--accent-soft)", color: "var(--accent)" }}
        title={`Level ${level.level}`}
      >
        {level.level} <Zap size={16} strokeWidth={2.4} />
      </span>

      <span
        className="liquid-pill inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[14px] font-semibold tabular-nums"
        style={{ background: "var(--danger-soft)", color: "var(--danger)" }}
        title="Best current streak"
      >
        {streak} <Flame size={16} strokeWidth={2.4} />
      </span>

      <CoinBalance className="liquid-pill" />
    </div>
  );
}
