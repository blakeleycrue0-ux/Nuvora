"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from "recharts";
import { Flame, Plus, Check, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useHabits } from "@/lib/momentum/store";
import {
  overallStats, levelFromXP, isScheduled, dayProgress,
  completionRate, dailyCompletionSeries,
} from "@/lib/momentum/stats";
import { todayISO, prettyDate, weekdayShort, lastNDays, diffDays } from "@/lib/momentum/date";
import { Button } from "@/components/ui/Button";
import { Heatmap } from "@/components/app/Heatmap";
import { HabitRow } from "@/components/app/HabitRow";
import { TeamCard } from "@/components/app/TeamCard";
import { ProgressBubble } from "@/components/progress/ProgressBubble";
import { EarnPulse } from "@/components/progress/EarnPulse";
import { CountUp } from "@/components/CountUp";
import { FEATURE_TEAMS } from "@/lib/features";
import { colorValue } from "@/lib/icons";
import { cn } from "@/lib/utils";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const stagger = { show: { transition: { staggerChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { habits, completions, xp, ready } = useHabits();
  const today = todayISO();

  const active = useMemo(() => habits.filter((h) => !h.archived), [habits]);
  const scheduledToday = useMemo(
    () => active.filter((h) => isScheduled(h, today) && diffDays(today, h.createdAt) >= 0),
    [active, today],
  );
  const stats = useMemo(() => overallStats(habits, completions), [habits, completions]);
  const level = useMemo(() => levelFromXP(xp), [xp]);
  const dp = useMemo(() => dayProgress(habits, completions, today), [habits, completions, today]);

  // Trailing 7 days for the consistency strip.
  const week = useMemo(
    () => lastNDays(7).map((d) => ({ date: d, letter: weekdayShort(d).slice(0, 1), ...dayProgress(habits, completions, d) })),
    [habits, completions],
  );
  const perfect7 = week.filter((d) => d.total > 0 && d.pct === 100).length;

  // Mini bars (last 14 days) for the highlight card.
  const bars = useMemo(() => dailyCompletionSeries(habits, completions, 14), [habits, completions]);
  const maxBar = Math.max(1, ...bars.map((b) => b.completed));

  // 30-day trend.
  const trend = useMemo(
    () => dailyCompletionSeries(habits, completions, 30).map((s) => ({ date: s.date, pct: s.pct, completed: s.completed })),
    [habits, completions],
  );

  // Completion counts per category (for the waffle).
  const catCounts = useMemo(() => {
    const byId = new Map(habits.map((h) => [h.id, { cat: h.category, color: colorValue(h.color) }]));
    const m = new Map<string, { count: number; color: string }>();
    for (const [k, c] of Object.entries(completions)) {
      if (c <= 0) continue;
      const info = byId.get(k.split("|")[0]);
      if (!info) continue;
      const prev = m.get(info.cat);
      m.set(info.cat, { count: (prev?.count ?? 0) + c, color: info.color });
    }
    return [...m.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count);
  }, [habits, completions]);
  const catTotal = catCounts.reduce((a, b) => a + b.count, 0);

  const waffle = useMemo(() => {
    const cells: string[] = [];
    if (catTotal > 0) {
      for (const c of catCounts) {
        const n = Math.round((c.count / catTotal) * 100);
        for (let i = 0; i < n && cells.length < 100; i++) cells.push(c.color);
      }
    }
    while (cells.length < 100) cells.push("");
    return cells.slice(0, 100);
  }, [catCounts, catTotal]);

  // Per-category 30-day success rate (for the goal rings).
  const catRates = useMemo(() => {
    const groups = new Map<string, { color: string; rates: number[] }>();
    for (const h of active) {
      const color = colorValue(h.color);
      const r = completionRate(h, completions, 30);
      const g = groups.get(h.category);
      if (g) g.rates.push(r);
      else groups.set(h.category, { color, rates: [r] });
    }
    return [...groups.entries()]
      .map(([name, g]) => ({ name, color: g.color, rate: Math.round(g.rates.reduce((a, b) => a + b, 0) / g.rates.length) }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 4);
  }, [active, completions]);

  if (!ready) return <DashboardSkeleton />;

  return (
    <div className="container-page py-9 lg:py-14">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-text-muted">{prettyDate(today)}</p>
          <h1 className="font-display mt-3 text-[38px] font-semibold leading-[0.98] text-text sm:text-[54px]">
            {greeting()},<br className="hidden sm:block" /> {user?.name?.split(" ")[0] ?? "friend"}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-text-secondary">
            {dp.total === 0
              ? "Nothing scheduled today — enjoy the rest."
              : dp.pct === 100
                ? `Perfect day — all ${dp.total} done. 🔥`
                : `${dp.completed} of ${dp.total} done today${stats.bestCurrentStreak > 0 ? ` · ${stats.bestCurrentStreak}-day streak` : ""}.`}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <Button href="/habits" className="hidden sm:inline-flex"><Plus size={17} /> New habit</Button>
        </div>
      </motion.div>

      {FEATURE_TEAMS && <div className="mt-6"><TeamCard /></div>}

      {active.length === 0 ? (
        <EmptyBoard />
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="show"
          className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-6">

          {/* Highlight — lifetime completions, accent-filled */}
          <motion.div variants={item} className="col-span-2 lg:col-span-4">
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[26px] bg-accent p-6 text-accent-ink shadow-[var(--shadow-sm)] sm:p-7">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-70">Lifetime</p>
                  <p className="font-display mt-2 text-[54px] font-semibold leading-[0.9] sm:text-[68px]">
                    <CountUp value={stats.totalCompletions} />
                  </p>
                  <p className="mt-2 text-[13px] font-medium opacity-80">
                    {active.length} {active.length === 1 ? "habit" : "habits"} · {stats.bestCurrentStreak}-day streak
                  </p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent-ink)_12%,transparent)]">
                  <Flame size={21} />
                </span>
              </div>
              <div className="mt-7 flex items-end gap-1.5">
                {bars.map((b, i) => (
                  <div key={i} className="flex-1 rounded-t-[3px] bg-[color-mix(in_oklab,var(--accent-ink)_26%,transparent)]"
                    style={{ height: `${10 + (b.completed / maxBar) * 46}px` }} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Level */}
          <motion.div variants={item} className="col-span-2 lg:col-span-2">
            <Widget className="flex h-full flex-col items-center justify-center py-7">
              <div className="relative"><EarnPulse /><ProgressBubble pct={level.pct} level={level.level} xp={xp} size={164} /></div>
              <p className="mt-4 text-[13px] font-semibold text-text">{level.title}</p>
              <p className="mt-0.5 text-[12px] text-text-muted">{level.need - level.into} XP to level {level.level + 1}</p>
            </Widget>
          </motion.div>

          {/* Today */}
          <motion.div variants={item} className="col-span-2 lg:col-span-3">
            <Widget className="flex h-full flex-col">
              <WidgetHead title="Today" hint={`${dp.completed}/${dp.total || 0} done`}
                action={<Link href="/habits" className="text-[13px] font-medium text-accent hover:underline">Manage</Link>} />
              {scheduledToday.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Check size={22} /></span>
                  <p className="text-[13px] text-text-muted">Nothing scheduled today.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {scheduledToday.map((h) => <HabitRow key={h.id} habit={h} />)}
                </div>
              )}
            </Widget>
          </motion.div>

          {/* Consistency */}
          <motion.div variants={item} className="col-span-2 lg:col-span-3">
            <Widget>
              <WidgetHead title="Consistency" action={<span className="text-[13px] font-semibold text-accent">{perfect7}/7 days</span>} />
              <div className="grid grid-cols-7 gap-2">
                {week.map((d) => (
                  <div key={d.date} className="flex flex-col items-center gap-2">
                    <span className="text-[11px] font-medium text-text-muted">{d.letter}</span>
                    <span className={cn(
                      "flex aspect-square w-full items-center justify-center rounded-2xl text-[11px] font-semibold",
                      d.total > 0 && d.pct === 100 ? "bg-accent text-accent-ink"
                        : d.completed > 0 ? "bg-accent-soft text-accent"
                          : "bg-bg-subtle text-text-muted",
                    )}>
                      {d.total > 0 && d.pct === 100 ? <Check size={16} strokeWidth={3} /> : d.completed > 0 ? `${d.pct}%` : ""}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[12.5px] text-text-muted">
                {perfect7 === 7 ? "A perfect week. Remarkable." : perfect7 > 0 ? `${perfect7} full ${perfect7 === 1 ? "day" : "days"} this week — keep going.` : "Complete a full day to light one up."}
              </p>
            </Widget>
          </motion.div>

          {/* Activity heatmap */}
          <motion.div variants={item} className="col-span-2 lg:col-span-4">
            <Widget>
              <WidgetHead title="Activity" hint="Every completion" />
              <Heatmap weeks={20} />
            </Widget>
          </motion.div>

          {/* Goal rings */}
          <motion.div variants={item} className="col-span-2 lg:col-span-2">
            <Widget className="h-full">
              <WidgetHead title="Goal rings" hint="30-day rate" />
              {catRates.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-text-muted">No data yet.</p>
              ) : (
                <div className="flex items-center gap-5">
                  <GoalRings data={catRates} />
                  <div className="flex-1 space-y-2.5">
                    {catRates.map((c) => (
                      <div key={c.name} className="flex items-center justify-between gap-2 text-[12.5px]">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                          <span className="truncate text-text">{c.name}</span>
                        </span>
                        <span className="tabular-nums text-text-muted">{c.rate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Widget>
          </motion.div>

          {/* Waffle */}
          <motion.div variants={item} className="col-span-2 lg:col-span-2">
            <Widget className="h-full">
              <WidgetHead title="Effort split" hint="100 squares" />
              {catTotal === 0 ? (
                <p className="py-6 text-center text-[13px] text-text-muted">No data yet.</p>
              ) : (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-10 gap-1.5">
                    {waffle.map((color, i) => (
                      <span key={i} className="aspect-square rounded-[3px]" style={{ background: color || "var(--bg-subtle)" }} />
                    ))}
                  </div>
                  <div className="space-y-2">
                    {catCounts.slice(0, 4).map((c) => (
                      <div key={c.name} className="flex items-center justify-between gap-2 text-[12.5px]">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color }} />
                          <span className="truncate text-text">{c.name}</span>
                        </span>
                        <span className="tabular-nums text-text-muted">{Math.round((c.count / catTotal) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Widget>
          </motion.div>

          {/* Trend */}
          <motion.div variants={item} className="col-span-2 lg:col-span-2">
            <Widget className="h-full">
              <WidgetHead title="Trend" hint="30 days" />
              <div className="-mx-1 h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend} margin={{ top: 8, right: 6, left: 6, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                        <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Tooltip
                      cursor={{ stroke: "var(--accent)", strokeWidth: 1, strokeDasharray: "4 4" }}
                      contentStyle={{ background: "var(--elevated)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-md)" }}
                      formatter={(v) => [`${v}%`, "Completed"]}
                      labelFormatter={() => ""}
                    />
                    <Area type="monotone" dataKey="pct" stroke="var(--accent)" strokeWidth={2.5} fill="url(#dashTrend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-border pt-3 text-[13px]">
                <span className="text-text-muted">30-day success rate</span>
                <span className="font-semibold text-text">{stats.avgRate}%</span>
              </div>
            </Widget>
          </motion.div>

        </motion.div>
      )}
    </div>
  );
}

/* ---------- widget primitives ---------- */

function Widget({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("rounded-[26px] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6", className)}>
      {children}
    </div>
  );
}

function WidgetHead({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-baseline gap-2.5">
        <h3 className="font-display text-[16px] font-semibold text-text">{title}</h3>
        {hint && <span className="text-[12px] text-text-muted">{hint}</span>}
      </div>
      {action}
    </div>
  );
}

function GoalRings({ data }: { data: { name: string; color: string; rate: number }[] }) {
  const size = 132;
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      {data.map((d, i) => {
        const r = c - 11 - i * 15;
        if (r <= 4) return null;
        const circ = 2 * Math.PI * r;
        const off = circ * (1 - d.rate / 100);
        return (
          <g key={d.name} transform={`rotate(-90 ${c} ${c})`}>
            <circle cx={c} cy={c} r={r} fill="none" stroke="var(--border)" strokeWidth={10} />
            <motion.circle
              cx={c} cy={c} r={r} fill="none" stroke={d.color} strokeWidth={10} strokeLinecap="round"
              strokeDasharray={circ}
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset: off }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
            />
          </g>
        );
      })}
    </svg>
  );
}

function EmptyBoard() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-[26px] border border-dashed border-border bg-surface px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Sparkles size={26} /></span>
      <h2 className="font-display mt-5 text-[24px] font-semibold text-text">Your board is empty</h2>
      <p className="mt-2 max-w-sm text-[14px] leading-relaxed text-text-secondary">
        Add your first habit and this space fills with your streaks, rings, heatmaps and progress — a living picture of your consistency.
      </p>
      <Button href="/habits" className="mt-6"><Plus size={17} /> Create your first habit <ArrowUpRight size={16} /></Button>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container-page py-10 lg:py-14">
      <div className="h-12 w-64 skeleton rounded-xl bg-surface-2" />
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <div className="col-span-2 h-44 skeleton rounded-[26px] bg-surface-2 lg:col-span-4" />
        <div className="col-span-2 h-44 skeleton rounded-[26px] bg-surface-2 lg:col-span-2" />
        <div className="col-span-2 h-64 skeleton rounded-[26px] bg-surface-2 lg:col-span-3" />
        <div className="col-span-2 h-64 skeleton rounded-[26px] bg-surface-2 lg:col-span-3" />
        <div className="col-span-2 h-52 skeleton rounded-[26px] bg-surface-2 lg:col-span-4" />
        <div className="col-span-2 h-52 skeleton rounded-[26px] bg-surface-2 lg:col-span-2" />
      </div>
    </div>
  );
}
