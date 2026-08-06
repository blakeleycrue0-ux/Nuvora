"use client";

// ============================================================
// /showcase — a self-contained, pre-filled view of Fenom built ONLY for
// recording marketing footage. It uses the real UI (Progress Bubble, coin,
// leaderboard styles) with curated demo data, so the app looks alive even
// before it has real users. It touches no database and creates no real users.
// Open on a phone, screen-record ~20s, done. Safe to delete after the ad.
// ============================================================

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Flame, Check, Trophy, Crown } from "lucide-react";
import { ProgressBubble } from "@/components/progress/ProgressBubble";
import { CoinIcon } from "@/components/progress/CoinIcon";
import { HabitIcon, colorValue } from "@/lib/icons";
import { levelFromXP } from "@/lib/momentum/stats";
import { cn } from "@/lib/utils";

const DEMO_HABITS = [
  { id: "run", name: "Morning run", icon: "footprints", color: "c-rose", xp: 22 },
  { id: "water", name: "Drink water", icon: "glass-water", color: "c-sky", xp: 8 },
  { id: "read", name: "Read 20 min", icon: "book-open", color: "c-amber", xp: 14 },
  { id: "meditate", name: "Meditate", icon: "brain", color: "c-violet", xp: 14 },
  { id: "sleep", name: "Sleep 8h", icon: "bed", color: "c-indigo", xp: 14 },
];

const DEMO_BOARD = [
  { rank: 1, name: "Alex", level: 24, xp: 18450 },
  { rank: 2, name: "Daniel", level: 22, xp: 17820 },
  { rank: 3, name: "Sofia", level: 21, xp: 16940 },
  { rank: 4, name: "Lucas", level: 20, xp: 16200 },
  { rank: 5, name: "Emma", level: 19, xp: 15870 },
  { rank: 6, name: "Noah", level: 18, xp: 15420 },
];

export default function ShowcasePage() {
  const [xp, setXp] = useState(1240);
  const [coins, setCoins] = useState(1250);
  const [done, setDone] = useState<Set<string>>(new Set(["water"]));
  const [fx, setFx] = useState<{ id: number; xp: number } | null>(null);
  const lv = levelFromXP(xp);

  const complete = (h: (typeof DEMO_HABITS)[number]) => {
    if (done.has(h.id)) return;
    setDone((s) => new Set(s).add(h.id));
    setXp((x) => x + h.xp);
    setCoins((c) => c + 5);
    setFx({ id: Date.now(), xp: h.xp });
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-md px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-text-muted">Good morning</p>
            <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Crue</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[14px] font-semibold shadow-[var(--shadow-sm)]">
            <CoinIcon size={18} />
            <motion.span key={coins} initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
              {coins.toLocaleString()}
            </motion.span>
          </span>
        </div>

        {/* Progress bubble */}
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-border bg-surface px-6 py-8 shadow-[var(--shadow-sm)]">
          <div className="relative">
            <AnimatePresence>
              {fx && (
                <motion.div key={fx.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: [0, 1, 1, 0], y: -34 }}
                  transition={{ duration: 1.6, times: [0, 0.15, 0.7, 1] }}
                  className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-full bg-accent-soft px-2.5 py-1 text-[12.5px] font-bold text-accent">
                  +{fx.xp} XP
                </motion.div>
              )}
            </AnimatePresence>
            <ProgressBubble pct={lv.pct} level={lv.level} xp={xp} size={240} />
          </div>
          <p className="mt-5 text-[14px] font-medium text-text-secondary">{lv.need - lv.into} XP to Level {lv.level + 1}</p>
        </div>

        {/* Today's habits — tap to complete */}
        <p className="mt-7 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Today</p>
        <div className="mt-2.5 space-y-2.5">
          {DEMO_HABITS.map((h) => {
            const isDone = done.has(h.id);
            const val = colorValue(h.color);
            return (
              <button key={h.id} onClick={() => complete(h)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 text-left transition-all hover:border-border-strong active:scale-[0.99]">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${val} 15%, transparent)`, color: val }}>
                  <HabitIcon name={h.icon} size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14.5px] font-semibold">{h.name}</p>
                  <p className="text-[11.5px] text-text-muted">+{h.xp} XP</p>
                </div>
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors", isDone ? "accent-gradient text-accent-ink" : "border-2 border-border-strong")}>
                  {isDone && <Check size={16} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>

        {/* Leaderboard preview */}
        <div className="mt-8 flex items-center gap-2">
          <Trophy size={16} className="text-accent" />
          <p className="text-[12px] font-semibold uppercase tracking-wide text-text-muted">Global ranking</p>
        </div>

        <div className="mt-3 flex items-end justify-center gap-3">
          {[DEMO_BOARD[1], DEMO_BOARD[0], DEMO_BOARD[2]].map((r) => {
            const first = r.rank === 1;
            const ring = r.rank === 1 ? "border-amber-400/70" : r.rank === 2 ? "border-slate-300" : "border-orange-400/60";
            const badge = r.rank === 1 ? "bg-amber-400 text-black" : r.rank === 2 ? "bg-slate-300 text-black" : "bg-orange-400 text-black";
            return (
              <div key={r.rank} className={cn("flex flex-1 flex-col items-center rounded-3xl border bg-surface p-4 text-center shadow-[var(--shadow-sm)]", ring, first ? "py-6" : "mt-4")}>
                {first && <Crown size={18} className="mb-1 text-amber-400" />}
                <Avatar name={r.name} size={first ? 52 : 44} />
                <span className={cn("mt-2 flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold", badge)}>{r.rank}</span>
                <p className="mt-1.5 truncate text-[13px] font-semibold">{r.name}</p>
                <p className="text-[12.5px] font-semibold text-accent">{r.xp.toLocaleString()} XP</p>
              </div>
            );
          })}
        </div>

        <div className="mt-3 space-y-2">
          {DEMO_BOARD.slice(3).map((r) => <BoardRow key={r.rank} r={r} />)}
          <BoardRow r={{ rank: 128, name: "You", level: lv.level, xp }} me />
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
}

function BoardRow({ r, me }: { r: { rank: number; name: string; level: number; xp: number }; me?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border p-3", me ? "border-accent bg-accent-soft" : "border-border bg-surface")}>
      <span className={cn("w-9 shrink-0 text-center text-[13.5px] font-bold", me ? "text-accent" : "text-text-muted")}>{r.rank}</span>
      <Avatar name={r.name} size={36} highlight={me} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold">{me ? "You" : r.name}</p>
        <p className="text-[12px] text-text-muted">Level {r.level}</p>
      </div>
      <span className="shrink-0 text-[13.5px] font-bold">{r.xp.toLocaleString()} <span className="text-[11px] font-medium text-text-muted">XP</span></span>
    </div>
  );
}

function Avatar({ name, size = 36, highlight }: { name: string; size?: number; highlight?: boolean }) {
  const colors = ["#45c68e", "#67b0e0", "#a58ce0", "#e0b45c", "#e58a97", "#4fc3b8"];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full font-bold text-white", highlight && "ring-2 ring-accent ring-offset-2 ring-offset-surface")}
      style={{ width: size, height: size, fontSize: size * 0.4, background: colors[h % colors.length] }}>
      {name[0]?.toUpperCase() ?? "?"}
    </span>
  );
}
