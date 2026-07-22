"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  Flame, Trophy, Target, Sparkles, CheckCircle2, Plus, Award, Quote,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useHabits } from "@/lib/momentum/store";
import {
  dayProgress, overallStats, levelFromXP, computeAchievements, isScheduled,
  isComplete, dailyCompletionSeries,
} from "@/lib/momentum/stats";
import { todayISO, prettyDate, weekdayShort, lastNDays, diffDays } from "@/lib/momentum/date";
import { Ring } from "@/components/ui/Ring";
import { Button } from "@/components/ui/Button";
import { Heatmap } from "@/components/app/Heatmap";
import { HabitRow } from "@/components/app/HabitRow";
import { HabitIcon, colorValue, ACHIEVEMENT_ICONS } from "@/lib/icons";
import { cn } from "@/lib/utils";

const QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "You do not rise to the level of your goals. You fall to the level of your systems.", author: "James Clear" },
  { text: "Small habits don't add up. They compound.", author: "James Clear" },
  { text: "Success is the product of daily habits, not once-in-a-lifetime transformations.", author: "James Clear" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

const stagger = {
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 16 },
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
  const progress = useMemo(() => dayProgress(habits, completions, today), [habits, completions, today]);
  const stats = useMemo(() => overallStats(habits, completions), [habits, completions]);
  const level = useMemo(() => levelFromXP(xp), [xp]);
  const achievements = useMemo(() => computeAchievements(habits, completions, xp), [habits, completions, xp]);
  const earned = achievements.filter((a) => a.earned);
  const series = useMemo(() => dailyCompletionSeries(habits, completions, 14), [habits, completions]);

  const quote = useMemo(() => {
    const idx = new Date(today).getDate() % QUOTES.length;
    return QUOTES[idx];
  }, [today]);

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, { count: number; color: string }>();
    for (const h of active) {
      const prev = map.get(h.category);
      map.set(h.category, { count: (prev?.count ?? 0) + 1, color: colorValue(h.color) });
    }
    return [...map.entries()].map(([name, v]) => ({ name, ...v })).sort((a, b) => b.count - a.count);
  }, [active]);

  const recentActivity = useMemo(() => {
    const days = lastNDays(7);
    const out: { date: string; habit: string; color: string; icon: string }[] = [];
    for (let i = days.length - 1; i >= 0 && out.length < 6; i--) {
      const d = days[i];
      for (const h of active) {
        if (isComplete(h, completions, d)) {
          out.push({ date: d, habit: h.name, color: colorValue(h.color), icon: h.icon });
          if (out.length >= 6) break;
        }
      }
    }
    return out;
  }, [active, completions]);

  const chartData = series.map((s) => ({ label: weekdayShort(s.date).slice(0, 1), full: s.date, completed: s.completed, pct: s.pct }));

  if (!ready) return <DashboardSkeleton />;

  return (
    <div className="container-page py-7 lg:py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[13px] font-medium text-text-muted">{prettyDate(today)}</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-text sm:text-[30px]">
            {greeting()}, {user?.name?.split(" ")[0] ?? "friend"}
          </h1>
        </div>
        <Button href="/habits" className="w-full sm:w-auto">
          <Plus size={17} /> New habit
        </Button>
      </motion.div>

      <motion.div variants={stagger} initial="hidden" animate="show" className="mt-7 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Progress hero card */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="relative h-full overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
            <div aria-hidden className="absolute -right-20 -top-20 h-56 w-56 rounded-full accent-gradient opacity-10 blur-3xl" />
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              <Ring value={progress.pct} size={148} stroke={14}>
                <div className="text-center">
                  <p className="text-[34px] font-bold leading-none tracking-tight text-text">{progress.pct}%</p>
                  <p className="mt-1 text-[12px] text-text-muted">{progress.completed}/{progress.total} done</p>
                </div>
              </Ring>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-[20px] font-semibold text-text">
                  {progress.total === 0 ? "No habits scheduled today" : progress.pct === 100 ? "A perfect day" : progress.pct >= 50 ? "You're on a roll" : "Let's get moving"}
                </h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-text-secondary">
                  {progress.total === 0
                    ? "Add a habit to start building momentum today."
                    : `${progress.completed} of ${progress.total} habits completed. ${progress.total - progress.completed > 0 ? `${progress.total - progress.completed} to go — you've got this.` : "Every single one — incredible."}`}
                </p>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  <MiniStat icon={Flame} label="Best streak" value={stats.bestCurrentStreak} tint="var(--accent)" />
                  <MiniStat icon={Trophy} label="Longest" value={stats.bestLongestStreak} tint="var(--c-violet)" />
                  <MiniStat icon={Target} label="Active" value={stats.activeCount} tint="var(--c-sky)" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level / XP card */}
        <motion.div variants={item}>
          <div className="relative isolate flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-transparent p-6 text-accent-ink shadow-[var(--shadow-md)]">
            <div aria-hidden className="absolute inset-0 -z-10 accent-gradient" />
            <div aria-hidden className="absolute inset-0 -z-10 opacity-25" style={{ background: "radial-gradient(circle at 80% 0%, rgba(255,255,255,0.4), transparent 45%)" }} />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--accent-ink)]/15 backdrop-blur">
                  <Sparkles size={22} />
                </span>
                <div>
                  <p className="text-[12.5px] font-medium text-accent-ink/70">Level {level.level}</p>
                  <p className="text-[17px] font-bold leading-tight">{level.title}</p>
                </div>
              </div>
              <p className="text-[13px] font-semibold text-accent-ink/85">{xp} XP</p>
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-between text-[12px] font-medium text-accent-ink/80">
                <span>{level.into} / {level.need} XP</span>
                <span>Level {level.level + 1}</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[color:var(--accent-ink)]/20">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${level.pct}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-[color:var(--accent-ink)]"
                />
              </div>
              <p className="mt-3 text-[12.5px] text-accent-ink/70">
                {level.need - level.into} XP until your next level up.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Today's habits */}
        <motion.div variants={item} className="lg:col-span-2">
          <Panel title="Today's habits" action={<Link href="/habits" className="text-[13px] font-medium text-accent hover:underline">Manage</Link>}>
            {scheduledToday.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="Nothing scheduled today"
                desc="Create a habit or enjoy your rest day."
                cta={<Button href="/habits" size="sm"><Plus size={15} /> Add habit</Button>}
              />
            ) : (
              <div className="space-y-2.5">
                {scheduledToday.map((h) => <HabitRow key={h.id} habit={h} />)}
              </div>
            )}
          </Panel>
        </motion.div>

        {/* Weekly chart */}
        <motion.div variants={item}>
          <Panel title="Last 14 days">
            <div className="h-[168px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 6, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} interval={1} />
                  <Tooltip
                    cursor={{ stroke: "var(--accent)", strokeWidth: 1, strokeDasharray: "4 4" }}
                    contentStyle={{ background: "var(--elevated)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, boxShadow: "var(--shadow-md)" }}
                    labelStyle={{ color: "var(--text-muted)" }}
                    formatter={(v) => [`${v} completed`, ""]}
                    labelFormatter={() => ""}
                  />
                  <Area type="monotone" dataKey="completed" stroke="var(--accent)" strokeWidth={2.5} fill="url(#dashArea)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[13px]">
              <span className="text-text-muted">30-day success rate</span>
              <span className="font-semibold text-text">{stats.avgRate}%</span>
            </div>
          </Panel>
        </motion.div>

        {/* Heatmap */}
        <motion.div variants={item} className="lg:col-span-2">
          <Panel title="Consistency heatmap" subtitle="Every completion, the past few months">
            <Heatmap weeks={20} />
          </Panel>
        </motion.div>

        {/* Categories */}
        <motion.div variants={item}>
          <Panel title="Categories">
            {categoryBreakdown.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-text-muted">No categories yet.</p>
            ) : (
              <div className="space-y-3.5">
                {categoryBreakdown.map((c) => {
                  const max = categoryBreakdown[0].count;
                  return (
                    <div key={c.name}>
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="font-medium text-text">{c.name}</span>
                        <span className="text-text-muted">{c.count}</span>
                      </div>
                      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-bg-subtle">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${(c.count / max) * 100}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                          className="h-full rounded-full"
                          style={{ background: c.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </motion.div>

        {/* Achievements */}
        <motion.div variants={item} className="lg:col-span-2">
          <Panel
            title="Achievements"
            subtitle={`${earned.length} of ${achievements.length} unlocked`}
            action={<Link href="/progress" className="text-[13px] font-medium text-accent hover:underline">View all</Link>}
          >
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-5">
              {achievements.slice(0, 5).map((a) => <AchievementBadge key={a.id} a={a} />)}
            </div>
          </Panel>
        </motion.div>

        {/* Recent activity + quote */}
        <motion.div variants={item}>
          <div className="flex h-full flex-col gap-5">
            <Panel title="Recent activity">
              {recentActivity.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-text-muted">Complete a habit to see activity.</p>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${r.color} 15%, transparent)`, color: r.color }}>
                        <HabitIcon name={r.icon} size={15} />
                      </span>
                      <p className="min-w-0 flex-1 truncate text-[13px] text-text">
                        Completed <span className="font-medium">{r.habit}</span>
                      </p>
                      <span className="shrink-0 text-[11.5px] text-text-muted">{relativeDay(r.date, today)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Panel>

            <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
              <Quote size={26} className="text-accent opacity-40" />
              <p className="mt-3 text-[14.5px] font-medium italic leading-relaxed text-text">&ldquo;{quote.text}&rdquo;</p>
              <p className="mt-3 text-[12.5px] text-text-muted">— {quote.author}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tint }: { icon: typeof Flame; label: string; value: number; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 px-3 py-2.5 text-center">
      <Icon size={16} className="mx-auto" style={{ color: tint }} />
      <p className="mt-1 text-[18px] font-bold leading-none text-text">{value}</p>
      <p className="mt-1 text-[10.5px] text-text-muted">{label}</p>
    </div>
  );
}

function Panel({ title, subtitle, action, children }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="h-full rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-semibold text-text">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[12.5px] text-text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function AchievementBadge({ a }: { a: ReturnType<typeof computeAchievements>[number] }) {
  const Icon = ACHIEVEMENT_ICONS[a.icon] ?? Award;
  const tierColor = { bronze: "#94a3b0", silver: "#c0cad4", gold: "#45c68e", diamond: "#67b0e0" }[a.tier];
  return (
    <div className={cn("flex flex-col items-center rounded-2xl border p-3 text-center transition-colors", a.earned ? "border-border bg-surface-2" : "border-dashed border-border")}>
      <span
        className={cn("flex h-11 w-11 items-center justify-center rounded-full", !a.earned && "opacity-40 grayscale")}
        style={{ background: `color-mix(in oklab, ${tierColor} 18%, transparent)`, color: tierColor }}
      >
        <Icon size={20} />
      </span>
      <p className={cn("mt-2 text-[11px] font-semibold leading-tight", a.earned ? "text-text" : "text-text-muted")}>{a.title}</p>
      {!a.earned && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bg-subtle">
          <div className="h-full rounded-full bg-accent" style={{ width: `${a.progress * 100}%` }} />
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, cta }: { icon: typeof CheckCircle2; title: string; desc: string; cta?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Icon size={22} />
      </span>
      <div>
        <p className="text-[14px] font-semibold text-text">{title}</p>
        <p className="mt-1 text-[13px] text-text-muted">{desc}</p>
      </div>
      {cta}
    </div>
  );
}

function relativeDay(date: string, today: string): string {
  const d = diffDays(today, date);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  return `${d}d ago`;
}

function DashboardSkeleton() {
  return (
    <div className="container-page py-10">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-surface-2" />
      <div className="mt-7 grid gap-5 lg:grid-cols-3">
        <div className="h-52 animate-pulse rounded-3xl bg-surface-2 lg:col-span-2" />
        <div className="h-52 animate-pulse rounded-3xl bg-surface-2" />
        <div className="h-64 animate-pulse rounded-3xl bg-surface-2 lg:col-span-2" />
        <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
      </div>
    </div>
  );
}
