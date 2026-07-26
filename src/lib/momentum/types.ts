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
}

export interface Verification {
  id: string;
  habitId: string;
  habitName: string;
  date: string;
  approved: boolean;
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
