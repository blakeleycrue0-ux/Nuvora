"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Check, Flame, Camera, Play, Minus, Plus } from "lucide-react";
import type { Habit, HabitKind } from "@/lib/momentum/types";
import { useHabits } from "@/lib/momentum/store";
import { currentStreak, getCount, DIFFICULTY_XP } from "@/lib/momentum/stats";
import { todayISO } from "@/lib/momentum/date";
import { getSessions } from "@/lib/focus/log";
import { HabitIcon, colorValue } from "@/lib/icons";
import { useConfetti } from "@/components/Confetti";
import { useCelebration } from "@/components/Celebration";
import { useFocus } from "@/components/focus/FocusProvider";
import { VerifyModal } from "@/components/verify/VerifyModal";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);

export function HabitRow({ habit, date = todayISO() }: { habit: Habit; date?: string }) {
  const { completions, incrementCompletion, setCompletion, addAmount } = useHabits();
  const { fire } = useConfetti();
  const { celebrateXP } = useCelebration();
  const { start: startFocus } = useFocus();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const kind: HabitKind = habit.kind ?? (habit.targetPerDay > 1 ? "counter" : "check");
  const count = getCount(completions, habit.id, date);
  const color = colorValue(habit.color);
  const streak = currentStreak(habit, completions);
  const needsPhoto = !!habit.verify;

  // Quantity total across all days.
  const total = useMemo(
    () => Object.entries(completions).reduce((a, [k, v]) => (k.startsWith(habit.id + "|") ? a + v : a), 0),
    [completions, habit.id],
  );
  // Timer minutes logged today (from the focus log).
  const loggedToday = useMemo(
    () => getSessions().filter((s) => s.habitId === habit.id && s.date === date).reduce((a, s) => a + s.minutes, 0),
    // completions changes when a focus session completes → recompute
    [habit.id, date, completions],
  );

  const targetMin = habit.targetMinutes ?? 25;
  const goal = habit.goalTarget ?? 0;

  const done =
    kind === "counter" ? count >= habit.targetPerDay
    : kind === "timer" ? count >= 1 || loggedToday >= targetMin
    : kind === "quantity" ? false
    : count >= 1;

  const pct =
    kind === "counter" ? (habit.targetPerDay ? count / habit.targetPerDay : 0)
    : kind === "timer" ? (targetMin ? loggedToday / targetMin : 0)
    : kind === "quantity" ? (goal ? total / goal : 0)
    : count >= 1 ? 1 : 0;

  const completeCheck = (cx: number, cy: number) => {
    const willAdd = count < habit.targetPerDay;
    const didComplete = incrementCompletion(habit.id, date, 1);
    if (willAdd) celebrateXP(DIFFICULTY_XP[habit.difficulty], cx, cy);
    if (didComplete) fire(cx, cy);
  };

  const onCheckTap = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (needsPhoto && !done) { setVerifyOpen(true); return; }
    completeCheck(rect.left + rect.width / 2, rect.top + rect.height / 2);
  };

  const subtitle =
    kind === "counter" ? `${count}/${habit.targetPerDay} · tap +`
    : kind === "timer" ? `${fmtMin(loggedToday)} / ${targetMin}m focused`
    : kind === "quantity" ? `${total.toLocaleString()} / ${goal.toLocaleString()} ${habit.goalUnit ?? ""} · tap +`
    : done ? "Completed" : "Tap play to focus";

  const showBar = (kind === "counter" || kind === "timer" || kind === "quantity") && (kind === "quantity" || !done);

  return (
    <motion.div
      layout
      className={cn(
        "flex items-center gap-3.5 rounded-[20px] border p-4 transition-colors",
        done ? "border-transparent" : "border-border bg-surface hover:bg-surface-2",
      )}
      style={done ? { background: `color-mix(in oklab, ${color} 10%, var(--surface))`, borderColor: `color-mix(in oklab, ${color} 25%, transparent)` } : undefined}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}>
        <HabitIcon name={habit.icon} size={19} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("truncate text-[14px] font-semibold text-text", done && "line-through opacity-55")}>{habit.name}</p>
          <span className="shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color }}>
            {habit.category}
          </span>
        </div>

        {showBar && (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <motion.div className="h-full rounded-full" initial={false} animate={{ width: `${Math.min(100, pct * 100)}%` }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} style={{ background: color }} />
          </div>
        )}

        <div className="mt-1 flex items-center gap-2 text-[11.5px] text-text-muted">
          <span className="tabular-nums">{subtitle}</span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 font-medium" style={{ color }}>
              <Flame size={12} /> {streak}
            </span>
          )}
        </div>
      </div>

      {/* Right-side controls by kind */}
      {kind === "counter" ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <button onClick={() => setCompletion(habit.id, date, Math.max(0, count - 1))} aria-label="Decrease" className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-text-secondary hover:text-text disabled:opacity-40" disabled={count <= 0}>
            <Minus size={16} />
          </button>
          <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); const willComplete = count + 1 >= habit.targetPerDay && count < habit.targetPerDay; setCompletion(habit.id, date, count + 1); if (willComplete) { celebrateXP(DIFFICULTY_XP[habit.difficulty], r.left, r.top); fire(r.left, r.top); } }} aria-label="Increase" className="flex h-9 w-9 items-center justify-center rounded-full text-accent-ink" style={{ background: color }}>
            <Plus size={16} />
          </motion.button>
        </div>
      ) : kind === "quantity" ? (
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setAddOpen(true)} aria-label="Add amount" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent-ink" style={{ background: color }}>
          <Plus size={17} />
        </motion.button>
      ) : (
        <>
          {!done && (
            <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); startFocus(habit, kind === "timer" ? targetMin : 25); }} aria-label="Start focus session" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent-ink" style={{ background: color }}>
              <Play size={14} className="ml-0.5" fill="currentColor" />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onCheckTap}
            aria-label={done ? "Mark incomplete" : needsPhoto ? "Verify with photo" : "Complete"}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
              done ? "border-transparent text-accent-ink" : needsPhoto ? "border-[color:var(--accent)] text-accent" : "border-border-strong text-transparent hover:border-[color:var(--accent)]",
            )}
            style={done ? { background: color, borderColor: color } : undefined}
          >
            {needsPhoto && !done ? <Camera size={16} strokeWidth={2.4} /> : <Check size={17} strokeWidth={3} />}
          </motion.button>
        </>
      )}

      {needsPhoto && (
        <VerifyModal open={verifyOpen} habit={habit} date={date} onClose={() => setVerifyOpen(false)} onApproved={() => completeCheck(window.innerWidth / 2, window.innerHeight * 0.5)} />
      )}

      {kind === "quantity" && (
        <AddAmountModal open={addOpen} onClose={() => setAddOpen(false)} habit={habit} total={total} color={color} onAdd={(amt) => addAmount(habit.id, amt, date)} />
      )}
    </motion.div>
  );
}

function AddAmountModal({ open, onClose, habit, total, color, onAdd }: {
  open: boolean; onClose: () => void; habit: Habit; total: number; color: string; onAdd: (amount: number) => void;
}) {
  const [val, setVal] = useState("");
  const goal = habit.goalTarget ?? 0;
  const unit = habit.goalUnit ?? "";
  const submit = () => {
    const amt = parseFloat(val);
    if (!isFinite(amt) || amt === 0) return;
    onAdd(amt);
    setVal("");
    onClose();
  };
  return (
    <Modal open={open} onClose={onClose} title={`Add to ${habit.name}`} subtitle={`Current progress: ${total.toLocaleString()} / ${goal.toLocaleString()} ${unit}`}>
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Input type="number" inputMode="decimal" placeholder="50" value={val} onChange={(e) => setVal(e.target.value)} autoFocus onKeyDown={(e) => e.key === "Enter" && submit()} />
          {unit && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[13px] font-medium text-text-muted">{unit}</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 5, 10, 25, 50].map((q) => (
            <button key={q} onClick={() => setVal(String((parseFloat(val) || 0) + q))} className="rounded-full border border-border px-3 py-1.5 text-[12.5px] font-medium text-text-secondary hover:text-text">
              +{q}
            </button>
          ))}
        </div>
        <div className="flex gap-3 pt-1">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <button onClick={submit} disabled={!val} className="flex-1 rounded-xl px-5 text-[14px] font-semibold text-accent-ink disabled:opacity-50" style={{ background: color, height: 44 }}>
            Add
          </button>
        </div>
      </div>
    </Modal>
  );
}
