"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Pause, Play, X, Check, Minus, Plus } from "lucide-react";
import type { Habit } from "@/lib/momentum/types";
import { useHabits } from "@/lib/momentum/store";
import { todayISO } from "@/lib/momentum/date";
import { DIFFICULTY_XP } from "@/lib/momentum/stats";
import { HabitIcon, colorValue } from "@/lib/icons";
import { useConfetti } from "@/components/Confetti";
import { useCelebration } from "@/components/Celebration";

interface FocusCtx {
  /** Open the focus timer for a habit. Optional starting length in minutes (default 25). */
  start: (habit: Habit, minutes?: number) => void;
}
const Ctx = createContext<FocusCtx>({ start: () => {} });
export const useFocus = () => useContext(Ctx);

const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

export function FocusProvider({ children }: { children: ReactNode }) {
  const { incrementCompletion } = useHabits();
  const { fire } = useConfetti();
  const { celebrateXP } = useCelebration();

  const [habit, setHabit] = useState<Habit | null>(null);
  const [total, setTotal] = useState(25 * 60);
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const doneRef = useRef(false);

  const start = useCallback((h: Habit, minutes = 25) => {
    doneRef.current = false;
    setHabit(h);
    setTotal(minutes * 60);
    setLeft(minutes * 60);
    setRunning(true);
  }, []);

  const close = useCallback(() => {
    setRunning(false);
    setHabit(null);
  }, []);

  const finish = useCallback((markDone: boolean) => {
    if (habit && markDone) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.42;
      const didComplete = incrementCompletion(habit.id, todayISO(), 1);
      celebrateXP(DIFFICULTY_XP[habit.difficulty], cx, cy);
      if (didComplete) fire(cx, cy);
    }
    close();
  }, [habit, incrementCompletion, celebrateXP, fire, close]);

  // Countdown.
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  // Auto-complete on reaching zero.
  useEffect(() => {
    if (habit && left === 0 && !doneRef.current) {
      doneRef.current = true;
      setRunning(false);
      finish(true);
    }
  }, [left, habit, finish]);

  // Esc closes.
  useEffect(() => {
    if (!habit) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [habit, close]);

  const adjust = (deltaMin: number) => {
    setTotal((t) => Math.max(60, t + deltaMin * 60));
    setLeft((l) => Math.max(1, l + deltaMin * 60));
  };

  const color = habit ? colorValue(habit.color) : "var(--accent)";
  const pct = total > 0 ? (total - left) / total : 0;
  const R = 130;
  const C = 2 * Math.PI * R;

  return (
    <Ctx.Provider value={{ start }}>
      {children}
      <AnimatePresence>
        {habit && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex flex-col items-center justify-center px-6"
            style={{ background: "color-mix(in oklab, var(--bg) 88%, transparent)" }}
          >
            <div className="liquid absolute inset-0 -z-10" />
            <button onClick={close} aria-label="Close"
              className="absolute right-5 top-[calc(env(safe-area-inset-top)+18px)] flex h-11 w-11 items-center justify-center rounded-full liquid-pill text-text-secondary hover:text-text">
              <X size={20} />
            </button>

            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${color} 18%, transparent)`, color }}>
                <HabitIcon name={habit.icon} size={18} />
              </span>
              <div>
                <p className="text-[15px] font-semibold text-text">{habit.name}</p>
                <p className="text-[12px] text-text-muted">Focus session</p>
              </div>
            </div>

            <div className="relative my-9 flex items-center justify-center">
              <svg width={300} height={300} viewBox="0 0 300 300">
                <circle cx="150" cy="150" r={R} fill="none" stroke="var(--border)" strokeWidth="14" />
                <motion.circle
                  cx="150" cy="150" r={R} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
                  strokeDasharray={C}
                  animate={{ strokeDashoffset: C * (1 - pct) }}
                  transition={{ ease: "linear", duration: 0.5 }}
                  transform="rotate(-90 150 150)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-[56px] font-semibold tabular-nums leading-none text-text">{fmt(left)}</span>
                <span className="mt-2 text-[12px] uppercase tracking-[0.18em] text-text-muted">{Math.round(pct * 100)}% done</span>
              </div>
            </div>

            {/* time adjust */}
            <div className="flex items-center gap-3">
              <button onClick={() => adjust(-5)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary hover:text-text" aria-label="-5 min"><Minus size={16} /></button>
              <span className="w-20 text-center text-[13px] text-text-muted">{Math.round(total / 60)} min</span>
              <button onClick={() => adjust(5)} className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text-secondary hover:text-text" aria-label="+5 min"><Plus size={16} /></button>
            </div>

            {/* controls */}
            <div className="mt-8 flex items-center gap-4">
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => setRunning((r) => !r)}
                className="flex h-16 w-16 items-center justify-center rounded-full text-accent-ink shadow-[var(--shadow-md)]"
                style={{ background: color }} aria-label={running ? "Pause" : "Resume"}>
                {running ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
              </motion.button>
              <motion.button whileTap={{ scale: 0.92 }} onClick={() => finish(true)}
                className="flex h-14 items-center gap-2 rounded-full border border-border bg-surface px-5 text-[14px] font-semibold text-text hover:bg-surface-2"
                aria-label="Complete now">
                <Check size={18} /> Complete
              </motion.button>
            </div>
            <p className="mt-6 max-w-xs text-center text-[12.5px] leading-relaxed text-text-muted">
              Press play and let Fenom count the session for you. It marks the habit done when the timer ends.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
