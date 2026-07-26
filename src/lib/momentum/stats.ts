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

  // Per-category completion totals.
  const catById = new Map(habits.map((h) => [h.id, h.category]));
  const catTotals = new Map<string, number>();
  const activeDays = new Set<string>();
  for (const [k, count] of Object.entries(c)) {
    if (count <= 0) continue;
    const [habitId, date] = k.split("|");
    activeDays.add(date);
    const cat = catById.get(habitId);
    if (cat) catTotals.set(cat, (catTotals.get(cat) ?? 0) + count);
  }
  const cat = (name: string) => catTotals.get(name) ?? 0;
  const categoriesTouched = [...catTotals.values()].filter((v) => v > 0).length;

  // Perfect days (100% of scheduled habits done) over the last ~120 days.
  let perfectDays = 0;
  for (const d of lastNDays(120)) {
    const p = dayProgress(habits, c, d);
    if (p.total > 0 && p.pct === 100) perfectDays++;
  }

  // Days since the first habit was created (account longevity).
  const earliest = habits.reduce<string | null>((min, h) => (!min || h.createdAt < min ? h.createdAt : min), null);
  const daysSinceStart = earliest ? Math.max(0, diffDays(todayISO(), earliest)) : 0;

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
    // Consistency — total completions
    def("first-step", "First Step", "Complete your first habit", "footprints", "bronze", total, 1),
    def("getting-going", "Getting Going", "Complete 10 habits", "zap", "bronze", total, 10),
    def("committed", "Committed", "Complete 25 habits", "medal", "bronze", total, 25),
    def("dedicated", "Dedicated", "Complete 50 habits", "medal", "silver", total, 50),
    def("centurion", "Centurion", "Complete 100 habits", "medal", "silver", total, 100),
    def("relentless", "Relentless", "Complete 250 habits", "trophy", "gold", total, 250),
    def("machine", "Machine", "Complete 500 habits", "trophy", "gold", total, 500),
    def("thousand-club", "Thousand Club", "Complete 1,000 habits", "crown", "diamond", total, 1000),

    // Streaks
    def("streak-3", "Warming Up", "Reach a 3-day streak", "flame", "bronze", bestStreak, 3),
    def("streak-7", "One Week Strong", "Reach a 7-day streak", "flame", "bronze", bestStreak, 7),
    def("streak-14", "Fortnight", "Reach a 14-day streak", "flame", "silver", bestStreak, 14),
    def("streak-30", "On Fire", "Reach a 30-day streak", "flame", "gold", bestStreak, 30),
    def("streak-60", "Ironclad", "Reach a 60-day streak", "flame", "gold", bestStreak, 60),
    def("streak-100", "Century Streak", "Reach a 100-day streak", "trophy", "diamond", bestStreak, 100),
    def("streak-180", "Half-Year Hero", "Reach a 180-day streak", "crown", "diamond", bestStreak, 180),
    def("streak-365", "Year of You", "Reach a 365-day streak", "crown", "diamond", bestStreak, 365),

    // Levels
    def("level-2", "Spark", "Reach level 2", "trending-up", "bronze", level, 2),
    def("level-5", "Rising", "Reach level 5", "trending-up", "silver", level, 5),
    def("level-10", "Elite", "Reach level 10", "crown", "gold", level, 10),
    def("level-15", "Master", "Reach level 15", "crown", "gold", level, 15),
    def("level-20", "Grandmaster", "Reach level 20", "crown", "diamond", level, 20),
    def("level-25", "Momentum God", "Reach level 25", "crown", "diamond", level, 25),

    // XP
    def("xp-500", "Experienced", "Earn 500 XP", "sparkles", "bronze", xp, 500),
    def("xp-2000", "Seasoned", "Earn 2,000 XP", "sparkles", "silver", xp, 2000),
    def("xp-5000", "Veteran", "Earn 5,000 XP", "sparkles", "gold", xp, 5000),
    def("xp-10000", "Ascended", "Earn 10,000 XP", "sparkles", "diamond", xp, 10000),

    // Collector — habits tracked at once
    def("collector-3", "Starter Set", "Track 3 habits at once", "layers", "bronze", active.length, 3),
    def("collector-5", "Collector", "Track 5 habits at once", "layers", "silver", active.length, 5),
    def("collector-8", "Curator", "Track 8 habits at once", "layers", "gold", active.length, 8),
    def("collector-12", "Architect", "Track 12 habits at once", "layers", "diamond", active.length, 12),

    // Active days
    def("days-7", "Regular", "Be active on 7 different days", "list-checks", "bronze", activeDays.size, 7),
    def("days-30", "Habitual", "Be active on 30 different days", "list-checks", "silver", activeDays.size, 30),
    def("days-100", "A Way of Life", "Be active on 100 different days", "list-checks", "gold", activeDays.size, 100),

    // Categories
    def("fit-25", "Getting Fit", "Complete 25 Fitness habits", "dumbbell", "bronze", cat("Fitness"), 25),
    def("fit-100", "Athlete", "Complete 100 Fitness habits", "dumbbell", "gold", cat("Fitness"), 100),
    def("health-25", "Well-Being", "Complete 25 Health habits", "heart-pulse", "bronze", cat("Health"), 25),
    def("health-100", "Vitality", "Complete 100 Health habits", "heart-pulse", "gold", cat("Health"), 100),
    def("mind-25", "Centered", "Complete 25 Mindfulness habits", "brain", "bronze", cat("Mindfulness"), 25),
    def("mind-100", "Zen", "Complete 100 Mindfulness habits", "brain", "gold", cat("Mindfulness"), 100),
    def("learn-25", "Curious", "Complete 25 Learning habits", "graduation-cap", "bronze", cat("Learning"), 25),
    def("learn-100", "Scholar", "Complete 100 Learning habits", "graduation-cap", "gold", cat("Learning"), 100),
    def("prod-25", "Focused", "Complete 25 Productivity habits", "target", "bronze", cat("Productivity"), 25),
    def("prod-100", "Powerhouse", "Complete 100 Productivity habits", "target", "gold", cat("Productivity"), 100),
    def("fin-25", "Saver", "Complete 25 Finance habits", "wallet", "silver", cat("Finance"), 25),
    def("create-25", "Creator", "Complete 25 Creativity habits", "palette", "silver", cat("Creativity"), 25),
    def("social-25", "Connected", "Complete 25 Social habits", "heart", "silver", cat("Social"), 25),

    // Perfect days
    def("perfect-1", "Flawless", "Finish a full day at 100%", "sparkles", "bronze", perfectDays, 1),
    def("perfect-10", "Perfectionist", "Have 10 perfect days", "sparkles", "gold", perfectDays, 10),
    def("perfect-30", "Immaculate", "Have 30 perfect days", "crown", "diamond", perfectDays, 30),

    // Rare / longevity
    def("all-rounder", "All-Rounder", "Complete habits in 5 categories", "layers", "gold", categoriesTouched, 5),
    def("founder", "Founder", "Keep Momentum for 30 days", "trophy", "silver", daysSinceStart, 30),
    def("veteran-year", "One-Year Legend", "Keep Momentum for 365 days", "crown", "diamond", daysSinceStart, 365),
  ];
}
