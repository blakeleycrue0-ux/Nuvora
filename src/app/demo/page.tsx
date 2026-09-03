"use client";

// ============================================================
// /demo — a FULL fake clone of the Fenom app for recording marketing footage.
// Everything is hardcoded in-memory: no auth, no Supabase, no real users.
// Navigate the tabs, tap habits (the bubble rises), scroll the ranking — it
// looks like a busy, live app. Not linked anywhere; delete after the ad.
// ============================================================

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AreaChart, Area, ResponsiveContainer, XAxis, CartesianGrid, Tooltip } from "recharts";
import {
  LayoutGrid, ListChecks, BarChart3, Trophy, Check, Flame, Crown, Plus,
  Sparkles, Target, Award, Medal, Zap,
} from "lucide-react";
import { ProgressBubble } from "@/components/progress/ProgressBubble";
import { CoinIcon } from "@/components/progress/CoinIcon";
import { HabitIcon, colorValue } from "@/lib/icons";
import { levelFromXP } from "@/lib/momentum/stats";
import { cn } from "@/lib/utils";

type Tab = "home" | "habits" | "progress" | "ranking";

const HABITS = [
  { id: "run", name: "Morning run", cat: "Fitness", icon: "footprints", color: "c-rose", xp: 22, streak: 34 },
  { id: "water", name: "Drink water", cat: "Health", icon: "glass-water", color: "c-sky", xp: 8, streak: 61 },
  { id: "read", name: "Read 20 min", cat: "Learning", icon: "book-open", color: "c-amber", xp: 14, streak: 18 },
  { id: "meditate", name: "Meditate", cat: "Mindfulness", icon: "brain", color: "c-violet", xp: 14, streak: 27 },
  { id: "sleep", name: "Sleep 8h", cat: "Health", icon: "bed", color: "c-indigo", xp: 14, streak: 12 },
  { id: "gym", name: "Strength training", cat: "Fitness", icon: "dumbbell", color: "c-emerald", xp: 22, streak: 9 },
  { id: "journal", name: "Journal", cat: "Mindfulness", icon: "notebook-pen", color: "c-teal", xp: 8, streak: 22 },
];

const BOARD = [
  { rank: 1, name: "Alex", level: 24, xp: 18450 },
  { rank: 2, name: "Daniel", level: 22, xp: 17820 },
  { rank: 3, name: "Sofia", level: 21, xp: 16940 },
  { rank: 4, name: "Lucas", level: 20, xp: 16200 },
  { rank: 5, name: "Emma", level: 19, xp: 15870 },
  { rank: 6, name: "Noah", level: 18, xp: 15420 },
  { rank: 7, name: "Mia", level: 18, xp: 14980 },
  { rank: 8, name: "Leo", level: 17, xp: 14510 },
];

const CHART = [
  { d: "M", v: 5 }, { d: "T", v: 6 }, { d: "W", v: 4 }, { d: "T", v: 7 },
  { d: "F", v: 6 }, { d: "S", v: 7 }, { d: "S", v: 5 },
];

const ACHIEVEMENTS = [
  { icon: Flame, label: "30-day streak", tint: "#45c68e", earned: true },
  { icon: Medal, label: "100 habits", tint: "#c0cad4", earned: true },
  { icon: Crown, label: "Level 10", tint: "#45c68e", earned: true },
  { icon: Sparkles, label: "5,000 XP", tint: "#67b0e0", earned: true },
  { icon: Target, label: "Perfect week", tint: "#e0b45c", earned: false },
  { icon: Award, label: "Year of you", tint: "#a58ce0", earned: false },
];

export default function DemoApp() {
  const [tab, setTab] = useState<Tab>("home");
  const [xp, setXp] = useState(1240);
  const [coins, setCoins] = useState(1250);
  const [done, setDone] = useState<Set<string>>(new Set(["water", "meditate"]));
  const [fx, setFx] = useState<{ id: number; xp: number } | null>(null);
  const lv = levelFromXP(xp);

  const complete = (h: (typeof HABITS)[number]) => {
    if (done.has(h.id)) return;
    setDone((s) => new Set(s).add(h.id));
    setXp((x) => x + h.xp);
    setCoins((c) => c + 5);
    setFx({ id: Date.now(), xp: h.xp });
  };

  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-bg/85 px-5 backdrop-blur-xl">
        <span className="text-[18px] font-bold tracking-[-0.02em]">Fenom</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[13px] font-semibold shadow-[var(--shadow-sm)]">
          <CoinIcon size={16} />
          <motion.span key={coins} initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
            {coins.toLocaleString()}
          </motion.span>
        </span>
      </header>

      <main className="mx-auto max-w-md px-5 pb-28 pt-6">
        {tab === "home" && <Home lv={lv} xp={xp} fx={fx} habits={HABITS} done={done} onComplete={complete} />}
        {tab === "habits" && <Habits habits={HABITS} done={done} onComplete={complete} />}
        {tab === "progress" && <Progress lv={lv} xp={xp} />}
        {tab === "ranking" && <Ranking lv={lv} xp={xp} />}
      </main>

      {/* Bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-4 pb-4 pt-2.5">
          {([["home", "Home", LayoutGrid], ["habits", "Habits", ListChecks], ["progress", "Progress", BarChart3], ["ranking", "Ranking", Trophy]] as const).map(([k, label, Icon]) => (
            <button key={k} onClick={() => setTab(k)} className="flex flex-1 flex-col items-center gap-1 py-1">
              <Icon size={22} strokeWidth={tab === k ? 2.4 : 1.9} className={cn("transition-colors", tab === k ? "text-accent" : "text-text-muted")} />
              <span className={cn("text-[10.5px] font-medium", tab === k ? "text-text" : "text-text-muted")}>{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

/* ---------------- Home ---------------- */
function Home({ lv, xp, fx, habits, done, onComplete }: any) {
  return (
    <div>
      <p className="text-[13px] font-medium text-text-muted">Good morning</p>
      <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Crue</h1>

      <div className="mt-5 flex flex-col items-center rounded-3xl border border-border bg-surface px-6 py-8 shadow-[var(--shadow-sm)]">
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
          <ProgressBubble pct={lv.pct} level={lv.level} xp={xp} size={236} />
        </div>
        <p className="mt-5 text-[14px] font-medium text-text-secondary">{lv.need - lv.into} XP to Level {lv.level + 1}</p>
        <div className="mt-5 grid w-full grid-cols-3 gap-3">
          <Stat icon={Flame} label="Streak" value="61" />
          <Stat icon={Zap} label="This week" value="40" />
          <Stat icon={Target} label="Active" value={String(habits.length)} />
        </div>
      </div>

      <p className="mt-7 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Today</p>
      <div className="mt-2.5 space-y-2.5">
        {habits.slice(0, 5).map((h: any) => <HabitCard key={h.id} h={h} done={done.has(h.id)} onClick={() => onComplete(h)} />)}
      </div>
    </div>
  );
}

/* ---------------- Habits ---------------- */
function Habits({ habits, done, onComplete }: any) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Habits</h1>
        <span className="inline-flex items-center gap-1.5 rounded-xl accent-gradient px-3 py-2 text-[13px] font-semibold text-accent-ink"><Plus size={15} /> New</span>
      </div>
      <div className="mt-5 space-y-2.5">
        {habits.map((h: any) => <HabitCard key={h.id} h={h} done={done.has(h.id)} onClick={() => onComplete(h)} showStreak />)}
      </div>
    </div>
  );
}

/* ---------------- Progress ---------------- */
function Progress({ lv, xp }: any) {
  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.02em]">Progress</h1>

      <div className="mt-5 overflow-hidden rounded-3xl accent-gradient p-5 text-accent-ink shadow-[var(--shadow-md)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/15"><Sparkles size={22} /></span>
            <div><p className="text-[12.5px] opacity-80">Level {lv.level}</p><p className="text-[17px] font-bold">{lv.title}</p></div>
          </div>
          <p className="text-[13px] font-semibold opacity-90">{xp.toLocaleString()} XP</p>
        </div>
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-black/20"><div className="h-full rounded-full bg-[color:var(--accent-ink)]" style={{ width: `${lv.pct}%` }} /></div>
        <p className="mt-2.5 text-[12.5px] opacity-80">{lv.need - lv.into} XP to Level {lv.level + 1}</p>
      </div>

      <div className="mt-5 rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <p className="text-[15px] font-semibold">Last 7 days</p>
        <div className="mt-3 h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={CHART} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
              <defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--accent)" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "var(--elevated)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} labelStyle={{ color: "var(--text-muted)" }} formatter={(v) => [`${v} done`, ""]} labelFormatter={() => ""} />
              <Area type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={2.5} fill="url(#dg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap */}
      <div className="mt-5 rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
        <p className="text-[15px] font-semibold">Consistency</p>
        <div className="mt-3 grid grid-flow-col grid-rows-7 gap-1">
          {Array.from({ length: 91 }).map((_, i) => {
            const lvl = [0, 1, 2, 3, 3, 2][Math.floor((Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) * 3) % 6] ?? 0;
            const op = [0.08, 0.35, 0.6, 1][lvl];
            return <span key={i} className="h-3.5 w-3.5 rounded-[3px]" style={{ background: `color-mix(in oklab, var(--accent) ${op * 100}%, var(--surface-2))` }} />;
          })}
        </div>
      </div>

      <p className="mt-6 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Achievements</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.label} className={cn("flex flex-col items-center rounded-2xl border p-3 text-center", a.earned ? "border-border bg-surface" : "border-dashed border-border opacity-50")}>
              <span className="flex h-11 w-11 items-center justify-center rounded-full" style={{ background: `color-mix(in oklab, ${a.tint} 18%, transparent)`, color: a.tint }}><Icon size={20} /></span>
              <p className="mt-2 text-[11px] font-semibold leading-tight">{a.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Ranking ---------------- */
function Ranking({ lv, xp }: any) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Trophy size={19} /></span>
        <div><h1 className="text-[24px] font-semibold tracking-[-0.02em]">Global ranking</h1><p className="text-[13px] text-text-secondary">12,482 athletes</p></div>
      </div>

      <div className="mt-5 overflow-hidden rounded-3xl accent-gradient p-5 text-accent-ink shadow-[var(--shadow-md)]">
        <p className="text-[12.5px] opacity-80">Your position</p>
        <div className="mt-1 flex items-end justify-between">
          <p className="text-[40px] font-bold leading-none">#128</p>
          <div className="text-right"><p className="text-[15px] font-bold">Level {lv.level}</p><p className="text-[13px] opacity-90">{xp.toLocaleString()} XP</p></div>
        </div>
      </div>

      <div className="mt-6 flex items-end justify-center gap-3">
        {[BOARD[1], BOARD[0], BOARD[2]].map((r) => {
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

      <div className="mt-4 space-y-2">
        {BOARD.slice(3).map((r) => <BoardRow key={r.rank} r={r} />)}
        <BoardRow r={{ rank: 128, name: "You", level: lv.level, xp }} me />
      </div>
    </div>
  );
}

/* ---------------- shared ---------------- */
function HabitCard({ h, done, onClick, showStreak }: any) {
  const val = colorValue(h.color);
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 text-left transition-all hover:border-border-strong active:scale-[0.99]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${val} 15%, transparent)`, color: val }}><HabitIcon name={h.icon} size={19} /></span>
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-semibold">{h.name}</p>
        <p className="flex items-center gap-2 text-[11.5px] text-text-muted">
          <span>+{h.xp} XP</span>
          {showStreak && <span className="inline-flex items-center gap-0.5"><Flame size={11} className="text-accent" /> {h.streak}</span>}
        </p>
      </div>
      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors", done ? "accent-gradient text-accent-ink" : "border-2 border-border-strong")}>{done && <Check size={16} strokeWidth={3} />}</span>
    </button>
  );
}

function Stat({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 px-3 py-2.5 text-center">
      <Icon size={16} className="mx-auto text-accent" />
      <p className="mt-1 text-[18px] font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10.5px] text-text-muted">{label}</p>
    </div>
  );
}

function BoardRow({ r, me }: any) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border p-3", me ? "border-accent bg-accent-soft" : "border-border bg-surface")}>
      <span className={cn("w-9 shrink-0 text-center text-[13.5px] font-bold", me ? "text-accent" : "text-text-muted")}>{r.rank}</span>
      <Avatar name={r.name} size={36} highlight={me} />
      <div className="min-w-0 flex-1"><p className="truncate text-[14px] font-semibold">{me ? "You" : r.name}</p><p className="text-[12px] text-text-muted">Level {r.level}</p></div>
      <span className="shrink-0 text-[13.5px] font-bold">{r.xp.toLocaleString()} <span className="text-[11px] font-medium text-text-muted">XP</span></span>
    </div>
  );
}

function Avatar({ name, size = 36, highlight }: any) {
  const colors = ["#45c68e", "#67b0e0", "#a58ce0", "#e0b45c", "#e58a97", "#4fc3b8"];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return <span className={cn("flex shrink-0 items-center justify-center rounded-full font-bold text-white", highlight && "ring-2 ring-accent ring-offset-2 ring-offset-surface")} style={{ width: size, height: size, fontSize: size * 0.4, background: colors[h % colors.length] }}>{name[0]?.toUpperCase() ?? "?"}</span>;
}
