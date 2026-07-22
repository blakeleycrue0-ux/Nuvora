"use client";

import { motion } from "motion/react";
import { Check, Flame } from "lucide-react";
import type { Habit } from "@/lib/momentum/types";
import { useHabits } from "@/lib/momentum/store";
import { currentStreak, getCount } from "@/lib/momentum/stats";
import { todayISO } from "@/lib/momentum/date";
import { HabitIcon, colorValue } from "@/lib/icons";
import { useConfetti } from "@/components/Confetti";
import { cn } from "@/lib/utils";

export function HabitRow({ habit, date = todayISO() }: { habit: Habit; date?: string }) {
  const { completions, incrementCompletion } = useHabits();
  const { fire } = useConfetti();
  const count = getCount(completions, habit.id, date);
  const done = count >= habit.targetPerDay;
  const streak = currentStreak(habit, completions);
  const color = colorValue(habit.color);

  const onTap = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const didComplete = incrementCompletion(habit.id, date, 1);
    if (didComplete) fire(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  return (
    <motion.div
      layout
      className={cn(
        "flex items-center gap-3.5 rounded-2xl border p-3.5 transition-colors",
        done ? "border-transparent" : "border-border bg-surface hover:bg-surface-2",
      )}
      style={done ? { background: `color-mix(in oklab, ${color} 10%, var(--surface))`, borderColor: `color-mix(in oklab, ${color} 25%, transparent)` } : undefined}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}
      >
        <HabitIcon name={habit.icon} size={19} />
      </span>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-[14px] font-semibold text-text", done && "opacity-70")}>{habit.name}</p>
        <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-text-muted">
          <span>{habit.category}</span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 font-medium" style={{ color }}>
              <Flame size={12} /> {streak}
            </span>
          )}
          {habit.targetPerDay > 1 && (
            <span className="tabular-nums">
              {count}/{habit.targetPerDay}
            </span>
          )}
        </div>
      </div>

      {habit.targetPerDay > 1 && !done && (
        <div className="hidden items-center gap-1 sm:flex">
          {Array.from({ length: habit.targetPerDay }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 w-4 rounded-full"
              style={{ background: i < count ? color : "var(--border-strong)" }}
            />
          ))}
        </div>
      )}

      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={onTap}
        aria-label={done ? "Mark incomplete" : "Complete"}
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
          done ? "border-transparent text-accent-ink" : "border-border-strong text-transparent hover:border-[color:var(--accent)]",
        )}
        style={done ? { background: color, borderColor: color } : undefined}
      >
        <Check size={17} strokeWidth={3} />
      </motion.button>
    </motion.div>
  );
}
