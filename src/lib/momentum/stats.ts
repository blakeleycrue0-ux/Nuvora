import type { Completions, Difficulty, Frequency, Habit } from "./types";
import { addDays, dayOfMonth, dayOfWeek, diffDays, lastNDays, todayISO } from "./date";

export const key = (habitId: string, date: string) => `${habitId}|${date}`;

export function getCount(c: Completions, habitId: string, date: string): number {
  return c[key(habitId, date)] ?? 0;
}

export function isScheduled(habit: Habit, date: string): boolean {
  const f: Frequency = habit.frequency;
  switch (f.type) {
    case "daily":
      return true;
    case "weekly":
      return f.days.includes(dayOfWeek(date));
    case "monthly":
      return f.dates.includes(dayOfMonth(date));
    case "custom":
      return true; // custom = flexible target/week, available any day
  }
}

export function isComplete(habit: Habit, c: Completions, date: string): boolean {
  return getCount(c, habit.id, date) >= habit.targetPerDay;
}

export const DIFFICULTY_XP: Record<Difficulty, number> = { easy: 8, medium: 14, hard: 22 };

export function xpForCompletion(difficulty: Difficulty): number {
  return DIFFICULTY_XP[difficulty];
}

export function currentStreak(habit: Habit, c: Completions, end = todayISO()): number {
  let streak = 0;
  let cursor = end;
  let guard = 0;
  // Allow today to be pending without breaking the streak.
  if (isScheduled(habit, cursor) && !isComplete(habit, c, cursor)) {
    cursor = addDays(cursor, -1);
  }
  while (guard++ < 400) {
    if (isScheduled(habit, cursor)) {
      if (isComplete(habit, c, cursor)) {
        streak++;
      } else {
        break;
      }
    }
    cursor = addDays(cursor, -1);
    // stop once we're before the habit was created
    if (diffDays(cursor, habit.createdAt) < -1) break;
  }
  return streak;
}

export function longestStreak(habit: Habit, c: Completions, end = todayISO()): number {
  let best = 0;
  let run = 0;
  let cursor = habit.createdAt;
  let guard = 0;
  while (diffDays(end, cursor) >= 0 && guard++ < 1000) {
    if (isScheduled(habit, cursor)) {
      if (isComplete(habit, c, cursor)) {
        run++;
        best = Math.max(best, run);
      } else {
        run = 0;
      }
    }
    cursor = addDays(cursor, 1);
  }
  return best;
}

export function completionRate(habit: Habit, c: Completions, days = 30, end = todayISO()): number {
  let scheduled = 0;
  let done = 0;
  for (const d of lastNDays(days, end)) {
    if (diffDays(d, habit.createdAt) < 0) continue;
    if (isScheduled(habit, d)) {
      scheduled++;
      if (isComplete(habit, c, d)) done++;
    }
  }
  return scheduled === 0 ? 0 : Math.round((done / scheduled) * 100);
}

export interface DayProgress {
  completed: number;
  total: number;
  pct: number;
}

export function dayProgress(habits: Habit[], c: Completions, date = todayISO()): DayProgress {
  const scheduled = habits.filter((h) => !h.archived && isScheduled(h, date) && diffDays(date, h.createdAt) >= 0);
  const completed = scheduled.filter((h) => isComplete(h, c, date)).length;
  const total = scheduled.length;
  return { completed, total, pct: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export interface LevelInfo {
  level: number;
  into: number;
  need: number;
  pct: number;
  title: string;
}

const LEVEL_TITLES = [
  "Beginner",
  "Spark",
  "Builder",
  "Consistent",
  "Focused",
  "Disciplined",
  "Unstoppable",
  "Master",
  "Legend",
  "Momentum God",
];

export function levelFromXP(xp: number): LevelInfo {
  let level = 1;
  let need = 100;
  let acc = 0;
  while (xp >= acc + need && level < 999) {
    acc += need;
    level++;
    need += 60;
  }
  const into = xp - acc;
  return {
    level,
    into,
    need,
    pct: Math.round((into / need) * 100),
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
  };
}

/** Total completions (across all habits) for each of the last `days` days. */
export function heatmapData(habits: Habit[], c: Completions, days = 133): { date: string; count: number }[] {
  const dates = lastNDays(days);
  return dates.map((date) => {
    let count = 0;
    for (const h of habits) count += getCount(c, h.id, date);
    return { date, count };
  });
}

/** Completed-habit counts per day for the last `days` days (for charts). */
export function dailyCompletionSeries(habits: Habit[], c: Completions, days = 7) {
  return lastNDays(days).map((date) => {
    const p = dayProgress(habits, c, date);
    return { date, completed: p.completed, total: p.total, pct: p.pct };
  });
}

export function totalCompletions(c: Completions): number {
  return Object.values(c).reduce((a, b) => a + b, 0);
}

export function overallStats(habits: Habit[], c: Completions) {
  const active = habits.filter((h) => !h.archived);
  const streaks = active.map((h) => currentStreak(h, c));
  const longest = active.map((h) => longestStreak(h, c));
  const rates = active.map((h) => completionRate(h, c, 30));
  return {
    activeCount: active.length,
    bestCurrentStreak: streaks.length ? Math.max(...streaks) : 0,
    bestLongestStreak: longest.length ? Math.max(...longest) : 0,
    avgStreak: streaks.length ? Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length) : 0,
    avgRate: rates.length ? Math.round(rates.reduce((a, b) => a + b, 0) / rates.length) : 0,
    totalCompletions: totalCompletions(c),
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
  earned: boolean;
  progress: number; // 0..1
}

export function computeAchievements(habits: Habit[], c: Completions, xp: number): Achievement[] {
  const active = habits.filter((h) => !h.archived);
  const total = totalCompletions(c);
  const bestStreak = active.length ? Math.max(0, ...active.map((h) => longestStreak(h, c))) : 0;
  const level = levelFromXP(xp).level;

  const def = (
    id: string,
    title: string,
    description: string,
    icon: string,
    tier: Achievement["tier"],
    value: number,
    goal: number,
  ): Achievement => ({
    id,
    title,
    description,
    icon,
    tier,
    earned: value >= goal,
    progress: Math.min(1, value / goal),
  });

  return [
    def("first-step", "First Step", "Complete your first habit", "footprints", "bronze", total, 1),
    def("getting-going", "Getting Going", "Complete 10 habits", "zap", "bronze", total, 10),
    def("century", "Centurion", "Complete 100 habits", "medal", "silver", total, 100),
    def("streak-7", "Warming Up", "Reach a 7-day streak", "flame", "bronze", bestStreak, 7),
    def("streak-30", "On Fire", "Reach a 30-day streak", "flame", "gold", bestStreak, 30),
    def("streak-100", "Century Streak", "Reach a 100-day streak", "trophy", "diamond", bestStreak, 100),
    def("level-5", "Rising", "Reach level 5", "trending-up", "silver", level, 5),
    def("level-10", "Elite", "Reach level 10", "crown", "diamond", level, 10),
    def("collector", "Collector", "Track 5 habits at once", "layers", "silver", active.length, 5),
  ];
}
