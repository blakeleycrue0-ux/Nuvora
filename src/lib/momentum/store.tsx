"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Habit, Completions, MomentumData } from "./types";
import { getCount, isComplete, key, DIFFICULTY_XP } from "./stats";
import { todayISO } from "./date";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

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
  incrementCompletion: (habitId: string, date?: string, delta?: number) => boolean;
  setCompletion: (habitId: string, date: string, count: number) => void;
  resetAll: () => void;
  importData: (data: MomentumData) => void;
  exportData: () => MomentumData;
}

const StoreContext = createContext<StoreValue | null>(null);

// DB row <-> Habit mapping (snake_case columns).
interface HabitRow {
  id: string;
  name: string;
  icon: string;
  color: Habit["color"];
  category: string;
  notes: string | null;
  frequency: Habit["frequency"];
  target_per_day: number;
  difficulty: Habit["difficulty"];
  reminder: string | null;
  tags: string[] | null;
  archived: boolean;
  order: number;
  created_at: string;
}

function rowToHabit(r: HabitRow): Habit {
  return {
    id: r.id,
    name: r.name,
    icon: r.icon,
    color: r.color,
    category: r.category,
    notes: r.notes ?? undefined,
    frequency: r.frequency,
    targetPerDay: r.target_per_day,
    difficulty: r.difficulty,
    reminder: r.reminder ?? undefined,
    tags: r.tags ?? [],
    archived: r.archived,
    order: r.order,
    createdAt: r.created_at,
  };
}

function habitToRow(h: Habit, userId: string) {
  return {
    id: h.id,
    user_id: userId,
    name: h.name,
    icon: h.icon,
    color: h.color,
    category: h.category,
    notes: h.notes ?? null,
    frequency: h.frequency,
    target_per_day: h.targetPerDay,
    difficulty: h.difficulty,
    reminder: h.reminder ?? null,
    tags: h.tags,
    archived: h.archived,
    order: h.order,
    created_at: h.createdAt,
  };
}

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "h_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function HabitStoreProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completions>({});
  const [ready, setReady] = useState(false);

  // Refs so mutation callbacks stay stable and always see the latest data.
  const habitsRef = useRef<Habit[]>(habits);
  const completionsRef = useRef<Completions>(completions);
  const userIdRef = useRef<string | null>(user?.id ?? null);
  useEffect(() => { habitsRef.current = habits; }, [habits]);
  useEffect(() => { completionsRef.current = completions; }, [completions]);
  useEffect(() => { userIdRef.current = user?.id ?? null; }, [user?.id]);

  // Load the signed-in user's data from Supabase (or clear it on sign-out).
  useEffect(() => {
    if (!authReady) return;
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!user) {
      setHabits([]);
      setCompletions({});
      setReady(true);
      return;
    }
    let active = true;
    setReady(false);
    /* eslint-enable react-hooks/set-state-in-effect */
    (async () => {
      const [{ data: hRows }, { data: cRows }] = await Promise.all([
        supabase.from("habits").select("*").order("order", { ascending: true }),
        supabase.from("completions").select("habit_id,date,count"),
      ]);
      if (!active) return;
      setHabits((hRows as HabitRow[] | null)?.map(rowToHabit) ?? []);
      const map: Completions = {};
      for (const c of (cRows as { habit_id: string; date: string; count: number }[] | null) ?? []) {
        map[key(c.habit_id, c.date)] = c.count;
      }
      setCompletions(map);
      setReady(true);
    })();
    return () => { active = false; };
  }, [authReady, user]);

  const xp = useMemo(() => {
    const diffById = new Map(habits.map((h) => [h.id, h.difficulty]));
    let total = 0;
    for (const [k, count] of Object.entries(completions)) {
      const habitId = k.split("|")[0];
      const d = diffById.get(habitId);
      if (d) total += count * DIFFICULTY_XP[d];
    }
    return total;
  }, [habits, completions]);

  const addHabit = useCallback<StoreValue["addHabit"]>((h) => {
    const uid = userIdRef.current;
    const minOrder = habitsRef.current.reduce((m, x) => Math.min(m, x.order), 0);
    const habit: Habit = { ...h, id: newId(), createdAt: todayISO(), archived: false, order: minOrder - 1 };
    setHabits((prev) => [habit, ...prev]);
    if (uid) void supabase.from("habits").insert(habitToRow(habit, uid));
    return habit;
  }, []);

  const updateHabit = useCallback<StoreValue["updateHabit"]>((id, patch) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.icon !== undefined) row.icon = patch.icon;
    if (patch.color !== undefined) row.color = patch.color;
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.notes !== undefined) row.notes = patch.notes ?? null;
    if (patch.frequency !== undefined) row.frequency = patch.frequency;
    if (patch.targetPerDay !== undefined) row.target_per_day = patch.targetPerDay;
    if (patch.difficulty !== undefined) row.difficulty = patch.difficulty;
    if (patch.reminder !== undefined) row.reminder = patch.reminder ?? null;
    if (patch.tags !== undefined) row.tags = patch.tags;
    if (patch.archived !== undefined) row.archived = patch.archived;
    if (patch.order !== undefined) row.order = patch.order;
    if (Object.keys(row).length) void supabase.from("habits").update(row).eq("id", id);
  }, []);

  const deleteHabit = useCallback<StoreValue["deleteHabit"]>((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCompletions((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) if (k.startsWith(id + "|")) delete next[k];
      return next;
    });
    void supabase.from("habits").delete().eq("id", id); // completions cascade
  }, []);

  const archiveHabit = useCallback<StoreValue["archiveHabit"]>((id, archived) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, archived } : h)));
    void supabase.from("habits").update({ archived }).eq("id", id);
  }, []);

  const duplicateHabit = useCallback<StoreValue["duplicateHabit"]>((id) => {
    const src = habitsRef.current.find((h) => h.id === id);
    if (!src) return;
    const uid = userIdRef.current;
    const minOrder = habitsRef.current.reduce((m, x) => Math.min(m, x.order), 0);
    const copy: Habit = { ...src, id: newId(), name: `${src.name} copy`, createdAt: todayISO(), order: minOrder - 1 };
    setHabits((prev) => [copy, ...prev]);
    if (uid) void supabase.from("habits").insert(habitToRow(copy, uid));
  }, []);

  const persistCompletion = useCallback((habitId: string, date: string, count: number) => {
    const uid = userIdRef.current;
    if (!uid) return;
    if (count <= 0) {
      void supabase.from("completions").delete().eq("habit_id", habitId).eq("date", date);
    } else {
      void supabase
        .from("completions")
        .upsert({ user_id: uid, habit_id: habitId, date, count }, { onConflict: "habit_id,date" });
    }
  }, []);

  const incrementCompletion = useCallback<StoreValue["incrementCompletion"]>((habitId, date = todayISO(), delta = 1) => {
    const habit = habitsRef.current.find((h) => h.id === habitId);
    if (!habit) return false;
    const k = key(habitId, date);
    const prev = completionsRef.current[k] ?? 0;
    let next = prev + delta;
    if (delta > 0 && habit.targetPerDay === 1 && prev >= 1) next = 0; // toggle off
    if (next < 0) next = 0;
    if (next > habit.targetPerDay) next = 0; // wrap for multi-target
    setCompletions((c) => {
      const nc = { ...c };
      if (next === 0) delete nc[k];
      else nc[k] = next;
      return nc;
    });
    persistCompletion(habitId, date, next);
    const wasComplete = prev >= habit.targetPerDay;
    const nowComplete = next >= habit.targetPerDay;
    return !wasComplete && nowComplete;
  }, [persistCompletion]);

  const setCompletion = useCallback<StoreValue["setCompletion"]>((habitId, date, count) => {
    const habit = habitsRef.current.find((h) => h.id === habitId);
    if (!habit) return;
    const next = Math.max(0, Math.min(count, habit.targetPerDay));
    const k = key(habitId, date);
    setCompletions((c) => {
      const nc = { ...c };
      if (next === 0) delete nc[k];
      else nc[k] = next;
      return nc;
    });
    persistCompletion(habitId, date, next);
  }, [persistCompletion]);

  const resetAll = useCallback(() => {
    const uid = userIdRef.current;
    setHabits([]);
    setCompletions({});
    if (uid) void supabase.from("habits").delete().eq("user_id", uid); // completions cascade
  }, []);

  const importData = useCallback<StoreValue["importData"]>((incoming) => {
    const uid = userIdRef.current;
    if (!uid) return;
    // Regenerate ids so imported data belongs to this user; remap completions.
    const idMap = new Map<string, string>();
    const newHabits: Habit[] = (incoming.habits ?? []).map((h, i) => {
      const nid = newId();
      idMap.set(h.id, nid);
      return { ...h, id: nid, order: i };
    });
    const newCompletions: Completions = {};
    for (const [k, count] of Object.entries(incoming.completions ?? {})) {
      const [oldId, date] = k.split("|");
      const nid = idMap.get(oldId);
      if (nid) newCompletions[key(nid, date)] = count;
    }
    setHabits(newHabits);
    setCompletions(newCompletions);
    // Replace remote data.
    void (async () => {
      await supabase.from("habits").delete().eq("user_id", uid);
      if (newHabits.length) await supabase.from("habits").insert(newHabits.map((h) => habitToRow(h, uid)));
      const rows = Object.entries(newCompletions).map(([k, count]) => {
        const [habit_id, date] = k.split("|");
        return { user_id: uid, habit_id, date, count };
      });
      if (rows.length) await supabase.from("completions").insert(rows);
    })();
  }, []);

  const exportData = useCallback<StoreValue["exportData"]>(
    () => ({ habits: habitsRef.current, completions: completionsRef.current, xp, version: 1 }),
    [xp],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ready,
      habits,
      completions,
      xp,
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
    [ready, habits, completions, xp, addHabit, updateHabit, deleteHabit, archiveHabit, duplicateHabit, incrementCompletion, setCompletion, resetAll, importData, exportData],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useHabits(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useHabits must be used within HabitStoreProvider");
  return ctx;
}

export { getCount, isComplete };
