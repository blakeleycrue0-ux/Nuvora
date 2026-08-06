"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useHabits } from "@/lib/momentum/store";
import { fenomBus } from "@/lib/fenom/bus";
import { COIN_SOURCES } from "@/lib/fenom/config";
import { levelFromXP, balanceOf } from "@/lib/fenom/economy";
import { currentStreak, DIFFICULTY_XP, type LevelInfo } from "@/lib/momentum/stats";
import { reachedMilestone } from "@/lib/fenom/economy";
import {
  ensureMascot, getTransactions,
  awardHabitCompletion, awardDayCompleted, awardLevelUp, awardStreakMilestone,
} from "@/lib/fenom/mascot";
import type { CoinTransaction } from "@/lib/fenom/types";

// A transient "you earned this" pulse for the XP/coin fly-in animation.
export interface EarnFx { id: number; xp: number; coins: number }

interface ProgressValue {
  ready: boolean;
  xp: number;
  level: LevelInfo;      // level, into, need, pct, title
  coins: number;         // spendable Fenom Coins balance (ledger sum)
  transactions: CoinTransaction[];
  fx: EarnFx | null;     // latest earn event (for the +XP / +coins animation)
}

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const { xp, ready: storeReady, habits, completions } = useHabits();

  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [ready, setReady] = useState(false);
  const [fx, setFx] = useState<EarnFx | null>(null);

  const level = useMemo(() => levelFromXP(xp), [xp]);
  const coins = useMemo(() => balanceOf(transactions), [transactions]);

  const refresh = useCallback(async () => { setTransactions(await getTransactions()); }, []);

  // Per-user setup: grant the one-time welcome bonus and load the coin ledger.
  useEffect(() => {
    if (!authReady) return;
    if (!user) { setReady(false); setTransactions([]); return; } // eslint-disable-line react-hooks/set-state-in-effect
    let active = true;
    (async () => {
      await ensureMascot();          // idempotent: seeds the welcome coin bonus
      const txns = await getTransactions();
      if (!active) return;
      setTransactions(txns); setReady(true);
    })();
    return () => { active = false; };
  }, [user, authReady]);

  // Debounced ledger refresh after earning.
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void refresh(); }, 900);
  }, [refresh]);

  const habitsRef = useRef(habits);
  useEffect(() => { habitsRef.current = habits; }, [habits]);

  // Habit completions → XP (already in the store) + coins + the earn pulse.
  useEffect(() => {
    if (!user) return;
    return fenomBus.subscribe((e) => {
      if (e.type === "HABIT_COMPLETED" && e.habitId && e.date) {
        const h = habitsRef.current.find((x) => x.id === e.habitId);
        const gainedXp = h ? DIFFICULTY_XP[h.difficulty] : 0;
        awardHabitCompletion(e.habitId, e.date);
        setFx({ id: Date.now(), xp: gainedXp, coins: COIN_SOURCES.habit_completed });
        scheduleRefresh();
      }
      if (e.type === "DAY_COMPLETED" && e.date) {
        awardDayCompleted(e.date);
        setFx({ id: Date.now(), xp: 0, coins: COIN_SOURCES.day_completed });
        scheduleRefresh();
      }
    });
  }, [user, scheduleRefresh]);

  // Perfect-day detection (all scheduled habits done today), once per day.
  const lastDayRef = useRef<string>("");
  useEffect(() => {
    if (!ready || !storeReady) return;
    const active = habits.filter((h) => !h.archived);
    if (active.length === 0) return;
    const today = new Date().toISOString().slice(0, 10);
    const done = active.filter((h) => (completions[`${h.id}|${today}`] ?? 0) >= h.targetPerDay).length;
    if (done === active.length && lastDayRef.current !== today) {
      lastDayRef.current = today;
      fenomBus.emit({ type: "DAY_COMPLETED", date: today });
    }
  }, [ready, storeReady, habits, completions]);

  // Streak milestones → coins (idempotent via DB ref key). Seed silently first.
  const streakSeeded = useRef(false);
  const milestoneRef = useRef<Map<string, number>>(new Map());
  useEffect(() => {
    if (!ready || !storeReady) return;
    for (const h of habits) {
      if (h.archived) continue;
      const m = reachedMilestone(currentStreak(h, completions));
      if (m === null) continue;
      const prev = milestoneRef.current.get(h.id) ?? 0;
      if (m > prev) {
        milestoneRef.current.set(h.id, m);
        if (streakSeeded.current) {
          awardStreakMilestone(m, h.id);
          setFx({ id: Date.now(), xp: 0, coins: COIN_SOURCES.streak_milestone });
          scheduleRefresh();
        }
      }
    }
    streakSeeded.current = true;
  }, [ready, storeReady, habits, completions, scheduleRefresh]);

  // Level-up → coins (the full-screen Level-Up celebration is fired separately
  // by LevelWatcher). Seeds the current level so it doesn't fire on load.
  const lastLevelRef = useRef<number | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (lastLevelRef.current !== null && level.level > lastLevelRef.current) {
      awardLevelUp(level.level);
      setFx({ id: Date.now(), xp: 0, coins: COIN_SOURCES.level_up });
      scheduleRefresh();
    }
    lastLevelRef.current = level.level;
  }, [ready, level.level, scheduleRefresh]);

  const value = useMemo<ProgressValue>(() => ({ ready, xp, level, coins, transactions, fx }),
    [ready, xp, level, coins, transactions, fx]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
