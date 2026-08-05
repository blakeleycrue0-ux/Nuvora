"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useHabits } from "@/lib/momentum/store";
import { fenomBus } from "@/lib/fenom/bus";
import { EVENT_REACTION, MASCOT_MESSAGES, MASCOT_IDLE_MESSAGES } from "@/lib/fenom/config";
import { levelFromXP, balanceOf } from "@/lib/fenom/economy";
import {
  ensureMascot, getMascot, getCatalog, getInventory, getTransactions,
  setMascotName, setEquipped, purchaseItem, claimFreeItem, buildItemViews,
  awardHabitCompletion, awardDayCompleted, awardLevelUp,
} from "@/lib/fenom/mascot";
import type {
  CoinTransaction, FenomEvent, ItemSlot, MascotAnimation, MascotItem, MascotItemView, MascotRecord, MascotState,
} from "@/lib/fenom/types";

interface Reaction { state: MascotState; animation: MascotAnimation; message: string; at: number }

interface MascotValue {
  ready: boolean;
  mascot: MascotRecord | null;
  name: string;
  level: number;
  balance: number;
  catalog: MascotItem[];
  owned: Set<string>;
  transactions: CoinTransaction[];
  itemViews: MascotItemView[];
  reaction: Reaction;
  refresh: () => Promise<void>;
  rename: (name: string) => Promise<void>;
  equip: (slot: ItemSlot, itemId: string | null) => Promise<void>;
  purchase: (itemId: string) => Promise<void>;
  claimFree: (itemId: string) => Promise<void>;
  react: (e: FenomEvent) => void;
}

const MascotContext = createContext<MascotValue | null>(null);

const pick = (arr?: string[]) => (arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : "");
const idleReaction = (): Reaction => ({ state: "idle", animation: "none", message: pick(MASCOT_IDLE_MESSAGES), at: 0 });

export function MascotProvider({ children }: { children: ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const { xp, ready: storeReady, habits, completions } = useHabits();

  const [mascot, setMascot] = useState<MascotRecord | null>(null);
  const [catalog, setCatalog] = useState<MascotItem[]>([]);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [ready, setReady] = useState(false);
  const [reaction, setReaction] = useState<Reaction>(idleReaction);

  const level = useMemo(() => levelFromXP(xp).level, [xp]);
  const balance = useMemo(() => balanceOf(transactions), [transactions]);
  const equipped = mascot?.equipped ?? {};
  const itemViews = useMemo(() => buildItemViews(catalog, owned, equipped, level), [catalog, owned, equipped, level]);

  const refresh = useCallback(async () => {
    const [inv, txns] = await Promise.all([getInventory(), getTransactions()]);
    setOwned(inv); setTransactions(txns);
  }, []);

  // One-time setup per signed-in user: make sure the mascot + welcome bonus
  // exist, then load everything.
  useEffect(() => {
    if (!authReady) return;
    if (!user) { setReady(false); setMascot(null); setCatalog([]); setOwned(new Set()); setTransactions([]); return; } // eslint-disable-line react-hooks/set-state-in-effect
    let active = true;
    (async () => {
      await ensureMascot();
      const [m, cat, inv, txns] = await Promise.all([getMascot(), getCatalog(), getInventory(), getTransactions()]);
      if (!active) return;
      setMascot(m); setCatalog(cat); setOwned(inv); setTransactions(txns); setReady(true);
    })();
    return () => { active = false; };
  }, [authReady, user]);

  // Central reaction handler: set the mascot's transient state + message.
  const react = useCallback((e: FenomEvent) => {
    const r = EVENT_REACTION[e.type];
    if (!r) return;
    setReaction({ state: r.state, animation: r.animation, message: pick(MASCOT_MESSAGES[e.type]), at: Date.now() });
  }, []);

  // Debounced balance refresh after coin-earning events.
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(() => { void refresh(); }, 900);
  }, [refresh]);

  // Subscribe to app-wide events (habit completed, etc.) coming from the store.
  useEffect(() => {
    if (!user) return;
    return fenomBus.subscribe((e) => {
      if (e.type === "HABIT_COMPLETED" && e.habitId && e.date) awardHabitCompletion(e.habitId, e.date);
      if (e.type === "DAY_COMPLETED" && e.date) awardDayCompleted(e.date);
      react(e);
      scheduleRefresh();
    });
  }, [user, react, scheduleRefresh]);

  // Detect a "perfect day" from live store data and celebrate once per day.
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

  // Detect level-ups and reward them.
  const lastLevelRef = useRef<number | null>(null);
  useEffect(() => {
    if (!ready) return;
    if (lastLevelRef.current !== null && level > lastLevelRef.current) {
      awardLevelUp(level);
      react({ type: "LEVEL_UP", level });
      scheduleRefresh();
    }
    lastLevelRef.current = level;
  }, [ready, level, react, scheduleRefresh]);

  const rename = useCallback(async (name: string) => { await setMascotName(name); setMascot((m) => (m ? { ...m, name } : m)); }, []);

  const equip = useCallback(async (slot: ItemSlot, itemId: string | null) => {
    const next = { ...(mascot?.equipped ?? {}), [slot]: itemId };
    setMascot((m) => (m ? { ...m, equipped: next } : m));
    await setEquipped(next);
    react({ type: "ITEM_EQUIPPED", itemId: itemId ?? undefined });
  }, [mascot, react]);

  const purchase = useCallback(async (itemId: string) => {
    await purchaseItem(itemId);
    await refresh();
    react({ type: "ITEM_PURCHASED", itemId });
  }, [refresh, react]);

  const claimFree = useCallback(async (itemId: string) => {
    await claimFreeItem(itemId);
    await refresh();
    react({ type: "ITEM_PURCHASED", itemId });
  }, [refresh, react]);

  const value = useMemo<MascotValue>(() => ({
    ready, mascot, name: mascot?.name ?? "Fen", level, balance, catalog, owned, transactions, itemViews,
    reaction, refresh, rename, equip, purchase, claimFree, react,
  }), [ready, mascot, level, balance, catalog, owned, transactions, itemViews, reaction, refresh, rename, equip, purchase, claimFree, react]);

  return <MascotContext.Provider value={value}>{children}</MascotContext.Provider>;
}

export function useMascot(): MascotValue {
  const ctx = useContext(MascotContext);
  if (!ctx) throw new Error("useMascot must be used within MascotProvider");
  return ctx;
}
