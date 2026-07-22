"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Habit, Completions, MomentumData } from "./types";
import { getCount, isComplete, key, xpForCompletion } from "./stats";
import { todayISO } from "./date";

const STORAGE_KEY = "momentum-data-v1";
const EMPTY_DATA: MomentumData = { habits: [], completions: {}, xp: 0, version: 1 };

interface StoreValue {
  ready: boolean;
  habits: Habit[];
  completions: Completions;
  xp: number;
  addHabit: (h: Omit<Habit, "id" | "createdAt" | "order" | "archived">) => Habit;
  updateHabit: (id: string, patch: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  archiveHabit: (id: string, archived: boolean) => void;
  duplicateHabit: (id: string) => void;
  /** Increment/toggle a completion. Returns true if this action *completed* the habit for that date. */
  incrementCompletion: (habitId: string, date?: string, delta?: number) => boolean;
  setCompletion: (habitId: string, date: string, count: number) => void;
  resetAll: () => void;
  importData: (data: MomentumData) => void;
  exportData: () => MomentumData;
}

const StoreContext = createContext<StoreValue | null>(null);

function uid(prefix = "h"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;
}

export function HabitStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MomentumData>({ habits: [], completions: {}, xp: 0, version: 1 });
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    // Hydrate persisted data from localStorage after mount — SSR can't read it.
    // Brand-new users start completely empty (no demo data).
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setData(JSON.parse(raw));
    } catch {
      setData(EMPTY_DATA);
    }
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Persist on every change (after initial load).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage full / disabled */
    }
  }, [data, ready]);

  const addHabit = useCallback<StoreValue["addHabit"]>((h) => {
    const habit: Habit = {
      ...h,
      id: uid(),
      createdAt: todayISO(),
      archived: false,
      order: 0,
    };
    setData((d) => ({
      ...d,
      habits: [{ ...habit, order: 0 }, ...d.habits.map((x) => ({ ...x, order: x.order + 1 }))],
    }));
    return habit;
  }, []);

  const updateHabit = useCallback<StoreValue["updateHabit"]>((id, patch) => {
    setData((d) => ({ ...d, habits: d.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)) }));
  }, []);

  const deleteHabit = useCallback<StoreValue["deleteHabit"]>((id) => {
    setData((d) => {
      const completions = { ...d.completions };
      for (const k of Object.keys(completions)) if (k.startsWith(id + "|")) delete completions[k];
      return { ...d, habits: d.habits.filter((h) => h.id !== id), completions };
    });
  }, []);

  const archiveHabit = useCallback<StoreValue["archiveHabit"]>((id, archived) => {
    setData((d) => ({ ...d, habits: d.habits.map((h) => (h.id === id ? { ...h, archived } : h)) }));
  }, []);

  const duplicateHabit = useCallback<StoreValue["duplicateHabit"]>((id) => {
    setData((d) => {
      const src = d.habits.find((h) => h.id === id);
      if (!src) return d;
      const copy: Habit = { ...src, id: uid(), name: `${src.name} copy`, createdAt: todayISO(), order: 0 };
      return { ...d, habits: [copy, ...d.habits.map((x) => ({ ...x, order: x.order + 1 }))] };
    });
  }, []);

  const incrementCompletion = useCallback<StoreValue["incrementCompletion"]>((habitId, date = todayISO(), delta = 1) => {
    let didComplete = false;
    setData((d) => {
      const habit = d.habits.find((h) => h.id === habitId);
      if (!habit) return d;
      const k = key(habitId, date);
      const prev = d.completions[k] ?? 0;
      let next = prev + delta;
      // Tapping a fully-complete single-target habit toggles it back off.
      if (delta > 0 && habit.targetPerDay === 1 && prev >= 1) next = 0;
      if (next < 0) next = 0;
      if (next > habit.targetPerDay) next = 0; // wrap for multi-target

      const completions = { ...d.completions };
      if (next === 0) delete completions[k];
      else completions[k] = next;

      const wasComplete = prev >= habit.targetPerDay;
      const nowComplete = next >= habit.targetPerDay;
      didComplete = !wasComplete && nowComplete;

      const diff = next - prev;
      const xp = Math.max(0, d.xp + diff * xpForCompletion(habit.difficulty));

      return { ...d, completions, xp };
    });
    return didComplete;
  }, []);

  const setCompletion = useCallback<StoreValue["setCompletion"]>((habitId, date, count) => {
    setData((d) => {
      const habit = d.habits.find((h) => h.id === habitId);
      if (!habit) return d;
      const k = key(habitId, date);
      const prev = d.completions[k] ?? 0;
      const next = Math.max(0, Math.min(count, habit.targetPerDay));
      const completions = { ...d.completions };
      if (next === 0) delete completions[k];
      else completions[k] = next;
      const xp = Math.max(0, d.xp + (next - prev) * xpForCompletion(habit.difficulty));
      return { ...d, completions, xp };
    });
  }, []);

  const resetAll = useCallback(() => {
    setData(EMPTY_DATA);
  }, []);

  const importData = useCallback<StoreValue["importData"]>((incoming) => {
    setData({
      habits: incoming.habits ?? [],
      completions: incoming.completions ?? {},
      xp: incoming.xp ?? 0,
      version: 1,
    });
  }, []);

  const exportData = useCallback<StoreValue["exportData"]>(() => data, [data]);

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      habits: data.habits,
      completions: data.completions,
      xp: data.xp,
      addHabit,
      updateHabit,
      deleteHabit,
      archiveHabit,
      duplicateHabit,
      incrementCompletion,
      setCompletion,
      resetAll,
      importData,
      exportData,
    }),
    [ready, data, addHabit, updateHabit, deleteHabit, archiveHabit, duplicateHabit, incrementCompletion, setCompletion, resetAll, importData, exportData],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useHabits(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useHabits must be used within HabitStoreProvider");
  return ctx;
}

// small re-exports for convenience in components
export { getCount, isComplete };
