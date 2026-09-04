export type Difficulty = "easy" | "medium" | "hard";

export type Frequency =
  | { type: "daily" }
  | { type: "weekly"; days: number[] } // 0=Sun .. 6=Sat
  | { type: "monthly"; dates: number[] } // 1..31
  | { type: "custom"; timesPerWeek: number };

export type HabitColor =
  | "c-indigo"
  | "c-violet"
  | "c-fuchsia"
  | "c-rose"
  | "c-amber"
  | "c-emerald"
  | "c-sky"
  | "c-teal";

// How a habit is completed / measured.
//  check    — a simple done/not-done tick (default)
//  counter  — do it N times a day (uses targetPerDay), with +/- controls
//  timer    — focus for a target number of minutes (targetMinutes)
//  quantity — accumulate an amount toward a long-term goal (goalTarget + goalUnit)
export type HabitKind = "check" | "counter" | "timer" | "quantity";

export interface Habit {
  id: string;
  name: string;
  icon: string; // lucide icon key (see icon-map)
  color: HabitColor;
  category: string;
  notes?: string;
  frequency: Frequency;
  targetPerDay: number; // allow multiple completions per day
  difficulty: Difficulty;
  reminder?: string; // "HH:MM"
  tags: string[];
  createdAt: string; // ISO date
  archived: boolean;
  order: number;
  verify?: boolean; // require an AI photo check to complete
  kind?: HabitKind; // completion style (default "check")
  targetMinutes?: number; // timer: daily focus target in minutes
  goalTarget?: number; // quantity: total goal (e.g. 5000)
  goalUnit?: string; // quantity: unit label (e.g. "km")
}

export interface Verification {
  id: string;
  habitId: string;
  habitName: string;
  date: string;
  approved: boolean;
  confidence: number;
  explanation: string;
  xpEarned: number;
  imagePath: string | null;
  createdAt: string;
}

// Completions are stored as a flat map: `${habitId}|${date}` -> count
export type Completions = Record<string, number>;

export interface MomentumData {
  habits: Habit[];
  completions: Completions;
  xp: number;
  version: number;
}
