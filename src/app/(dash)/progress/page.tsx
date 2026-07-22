"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, BarChart, Bar, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from "recharts";
import {
  Flame, Trophy, Target, CheckCircle2, XCircle, Percent, Award,
} from "lucide-react";
import { useHabits } from "@/lib/momentum/store";
import {
  overallStats, dayProgress, isScheduled, isComplete, completionRate,
  currentStreak, longestStreak, computeAchievements, levelFromXP,
} from "@/lib/momentum/stats";
import { lastNDays, weekdayShort, monthLabel, diffDays } from "@/lib/momentum/date";
import { HabitIcon, colorValue, ACHIEVEMENT_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";

type Range = "week" | "month" | "quarter" | "year";
const RANGE_DAYS: Record<Range, number> = { week: 7, month: 30, quarter: 90, year: 365 };

export default function ProgressPage() {
  const { habits, completions, xp, ready } = useHabits();
  const [range, setRange] = useState<Range>("month");
  const active = useMemo(() => habits.filter((h) => !h.archived), [habits]);
  const stats = useMemo(() => overallStats(habits, completions), [habits, completions]);
  const level = useMemo(() => levelFromXP(xp), [xp]);
  const achievements = useMemo(() => computeAchievements(habits, completions, xp), [habits, completions, xp]);

  // Completion trend over range
  const trend = useMemo(() => {
    const days = RANGE_DAYS[range];
    const dates = lastNDays(days);
    const step = days <= 7 ? 1 : days <= 30 ? 1 : days <= 90 ? 3 : 14;
    const out: { label: string; pct: number; completed: number }[] = [];
    for (let i = 0; i < dates.length; i += step) {
      const slice = dates.slice(i, i + step);
      let pctSum = 0, comp = 0, n = 0;
      for (const d of slice) {
        const p = dayProgress(habits, completions, d);
        if (p.total > 0) { pctSum += p.pct; n++; }
        comp += p.completed;
      }
      const d0 = slice[0];
      const label = days <= 7 ? weekdayShort(d0).slice(0, 3) : days <= 30 ? d0.slice(8) : monthLabel(d0) + " " + d0.slice(8);
      out.push({ label, pct: n ? Math.round(pctSum / n) : 0, completed: comp });
    }
    return out;
  }, [range, habits, completions]);

  // Per-weekday success (which days you're most consistent)
  const weekdayStats = useMemo(() => {
    const buckets = Array.from({ length: 7 }, () => ({ scheduled: 0, done: 0 }));
    for (const d of lastNDays(RANGE_DAYS[range])) {
      const dow = new Date(d).getDay();
      for (const h of active) {
        if (diffDays(d, h.createdAt) < 0) continue;
        if (isScheduled(h, d)) {
          buckets[dow].scheduled++;
          if (isComplete(h, completions, d)) buckets[dow].done++;
        }
      }
    }
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return buckets.map((b, i) => ({ day: names[i], pct: b.scheduled ? Math.round((b.done / b.scheduled) * 100) : 0 }));
  }, [range, active, completions]);

  // Missed vs completed in range
  const rangeTotals = useMemo(() => {
    let scheduled = 0, done = 0;
    for (const d of lastNDays(RANGE_DAYS[range])) {
      for (const h of active) {
        if (diffDays(d, h.createdAt) < 0) continue;
        if (isScheduled(h, d)) { scheduled++; if (isComplete(h, completions, d)) done++; }
      }
    }
    return { scheduled, done, missed: scheduled - done, rate: scheduled ? Math.round((done / scheduled) * 100) : 0 };
  }, [range, active, completions]);

  // Per-habit leaderboard
  const habitStats = useMemo(() =>
    active.map((h) => ({
      habit: h,
      streak: currentStreak(h, completions),
      longest: longestStreak(h, completions),
      rate: completionRate(h, completions, RANGE_DAYS[range]),
    })).sort((a, b) => b.rate - a.rate),
  [active, completions, range]);

  const bestWeekday = weekdayStats.reduce((a, b) => (b.pct > a.pct ? b : a), weekdayStats[0]);

  if (!ready) {
    return (
      <div className="container-page py-10">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-surface-2" />
        <div className="mt-7 grid gap-5 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-3xl bg-surface-2" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-7 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-text sm:text-[30px]">Progress</h1>
          <p className="mt-1 text-[14px] text-text-secondary">Deep insights into your consistency and momentum.</p>
        </div>
        <div className="inline-flex rounded-xl border border-border bg-surface p-1">
          {(["week", "month", "quarter", "year"] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn("relative rounded-lg px-3 py-1.5 text-[13px] font-medium capitalize transition-colors", range === r ? "text-white" : "text-text-secondary hover:text-text")}
            >
              {range === r && <motion.span layoutId="range-pill" className="absolute inset-0 rounded-lg accent-gradient" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative z-10">{r}</span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Percent} label="Success rate" value={`${rangeTotals.rate}%`} tint="var(--c-emerald)" sub={`${rangeTotals.done} of ${rangeTotals.scheduled} scheduled`} />
        <Kpi icon={Flame} label="Best current streak" value={stats.bestCurrentStreak} tint="var(--c-amber)" sub="days in a row" />
        <Kpi icon={Trophy} label="Longest streak ever" value={stats.bestLongestStreak} tint="var(--c-fuchsia)" sub="all-time record" />
        <Kpi icon={Target} label="Total completions" value={stats.totalCompletions} tint="var(--c-indigo)" sub="lifetime" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        {/* Completion trend */}
        <Panel title="Completion trend" subtitle="Average daily completion rate" className="lg:col-span-2">
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} minTickGap={16} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={40} unit="%" />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => [`${v}%`, "Completion"]}
                />
                <Area type="monotone" dataKey="pct" stroke="var(--accent)" strokeWidth={2.5} fill="url(#trendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Completed vs missed donut-ish */}
        <Panel title="Completed vs missed" subtitle={`Past ${range}`}>
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative flex h-[150px] w-[150px] items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--danger-soft)" strokeWidth="4" />
                <motion.circle
                  cx="18" cy="18" r="15.9" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={100} initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 100 - rangeTotals.rate }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  pathLength={100}
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-[26px] font-bold text-text">{rangeTotals.rate}%</p>
                <p className="text-[11px] text-text-muted">completed</p>
              </div>
            </div>
            <div className="mt-4 flex w-full gap-3">
              <LegendStat icon={CheckCircle2} color="var(--success)" label="Completed" value={rangeTotals.done} />
              <LegendStat icon={XCircle} color="var(--danger)" label="Missed" value={rangeTotals.missed} />
            </div>
          </div>
        </Panel>

        {/* Best day of week */}
        <Panel title="Consistency by weekday" subtitle={`Your strongest day is ${bestWeekday.day}`} className="lg:col-span-2">
          <div className="h-[210px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayStats} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={40} unit="%" />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--surface-2)" }} formatter={(v) => [`${v}%`, "Success"]} />
                <Bar dataKey="pct" radius={[8, 8, 0, 0]} maxBarSize={44}>
                  {weekdayStats.map((w, i) => (
                    <Cell key={i} fill={w.day === bestWeekday.day ? "var(--accent)" : "var(--accent-soft)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        {/* Level card */}
        <Panel title="Experience" subtitle={`Level ${level.level} · ${level.title}`}>
          <div className="flex flex-col items-center py-3">
            <div className="relative flex h-[110px] w-[110px] items-center justify-center rounded-full accent-gradient text-white shadow-[var(--shadow-glow)]">
              <div className="text-center">
                <p className="text-[30px] font-bold leading-none">{level.level}</p>
                <p className="text-[10px] uppercase tracking-wider opacity-90">Level</p>
              </div>
            </div>
            <p className="mt-4 text-[13px] font-semibold text-text">{xp} XP total</p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-bg-subtle">
              <motion.div initial={{ width: 0 }} animate={{ width: `${level.pct}%` }} transition={{ duration: 1 }} className="h-full rounded-full accent-gradient" />
            </div>
            <p className="mt-2 text-[11.5px] text-text-muted">{level.need - level.into} XP to level {level.level + 1}</p>
          </div>
        </Panel>
      </div>

      {/* Habit leaderboard */}
      <Panel title="Habit performance" subtitle={`Success rate over the past ${range}`} className="mt-5">
        {habitStats.length === 0 ? (
          <p className="py-8 text-center text-[13px] text-text-muted">No active habits yet.</p>
        ) : (
          <div className="space-y-3">
            {habitStats.map(({ habit, streak, longest, rate }) => {
              const color = colorValue(habit.color);
              return (
                <div key={habit.id} className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface-2 p-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}>
                    <HabitIcon name={habit.icon} size={18} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[14px] font-semibold text-text">{habit.name}</p>
                      <span className="shrink-0 text-[14px] font-bold" style={{ color }}>{rate}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-bg-subtle">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${rate}%` }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full" style={{ background: color }} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 text-[11.5px] text-text-muted">
                      <span className="inline-flex items-center gap-1"><Flame size={12} style={{ color: "var(--c-amber)" }} /> {streak} streak</span>
                      <span className="inline-flex items-center gap-1"><Trophy size={12} style={{ color: "var(--c-fuchsia)" }} /> {longest} best</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Achievements */}
      <Panel title="Achievements" subtitle={`${achievements.filter((a) => a.earned).length} of ${achievements.length} unlocked`} className="mt-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {achievements.map((a) => {
            const Icon = ACHIEVEMENT_ICONS[a.icon] ?? Award;
            const tierColor = { bronze: "#cd7f32", silver: "#9ca3af", gold: "#f59e0b", diamond: "#22d3ee" }[a.tier];
            return (
              <div key={a.id} className={cn("flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all", a.earned ? "border-border bg-surface-2 hover:-translate-y-0.5 hover:shadow-[var(--shadow-sm)]" : "border-dashed border-border")}>
                <span className={cn("flex h-12 w-12 items-center justify-center rounded-full", !a.earned && "opacity-40 grayscale")} style={{ background: `color-mix(in oklab, ${tierColor} 18%, transparent)`, color: tierColor }}>
                  <Icon size={22} />
                </span>
                <div>
                  <p className={cn("text-[12.5px] font-semibold leading-tight", a.earned ? "text-text" : "text-text-muted")}>{a.title}</p>
                  <p className="mt-0.5 text-[10.5px] leading-tight text-text-muted">{a.description}</p>
                </div>
                {!a.earned && (
                  <div className="mt-auto h-1 w-full overflow-hidden rounded-full bg-bg-subtle">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${a.progress * 100}%` }} />
                  </div>
                )}
                {a.earned && <span className="rounded-full bg-success-soft px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-success">Unlocked</span>}
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

const tooltipStyle = {
  background: "var(--elevated)",
  border: "1px solid var(--border)",
  borderRadius: 12,
  fontSize: 12,
  boxShadow: "var(--shadow-md)",
  color: "var(--text)",
} as const;

function Kpi({ icon: Icon, label, value, tint, sub }: { icon: typeof Flame; label: string; value: number | string; tint: string; sub: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: `color-mix(in oklab, ${tint} 15%, transparent)`, color: tint }}>
        <Icon size={19} />
      </span>
      <p className="mt-3.5 text-[26px] font-bold tracking-tight text-text">{value}</p>
      <p className="text-[13px] font-medium text-text">{label}</p>
      <p className="mt-0.5 text-[11.5px] text-text-muted">{sub}</p>
    </motion.div>
  );
}

function Panel({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6", className)}>
      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-text">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-text-muted">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function LegendStat({ icon: Icon, color, label, value }: { icon: typeof CheckCircle2; color: string; label: string; value: number }) {
  return (
    <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2">
      <Icon size={16} style={{ color }} />
      <div>
        <p className="text-[15px] font-bold leading-none text-text">{value}</p>
        <p className="mt-0.5 text-[11px] text-text-muted">{label}</p>
      </div>
    </div>
  );
}
