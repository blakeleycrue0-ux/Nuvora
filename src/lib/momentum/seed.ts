import type { Completions, Habit, MomentumData } from "./types";
import { addDays, dayOfWeek, isoDate, todayISO } from "./date";
import { DIFFICULTY_XP, isScheduled, key } from "./stats";

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return isoDate(d);
}

const seedHabits: Habit[] = [
  {
    id: "h_meditate",
    name: "Morning Meditation",
    icon: "brain",
    color: "c-violet",
    category: "Mindfulness",
    notes: "10 minutes, right after waking up.",
    frequency: { type: "daily" },
    targetPerDay: 1,
    difficulty: "easy",
    reminder: "07:00",
    tags: ["morning", "calm"],
    createdAt: daysAgo(84),
    archived: false,
    order: 0,
  },
  {
    id: "h_water",
    name: "Drink Water",
    icon: "droplets",
    color: "c-sky",
    category: "Health",
    frequency: { type: "daily" },
    targetPerDay: 3,
    difficulty: "easy",
    reminder: "10:00",
    tags: ["health"],
    createdAt: daysAgo(84),
    archived: false,
    order: 1,
  },
  {
    id: "h_read",
    name: "Read 20 Minutes",
    icon: "book-open",
    color: "c-amber",
    category: "Learning",
    frequency: { type: "daily" },
    targetPerDay: 1,
    difficulty: "medium",
    reminder: "21:00",
    tags: ["evening", "growth"],
    createdAt: daysAgo(70),
    archived: false,
    order: 2,
  },
  {
    id: "h_workout",
    name: "Workout",
    icon: "dumbbell",
    color: "c-rose",
    category: "Fitness",
    notes: "Push / pull / legs split.",
    frequency: { type: "weekly", days: [1, 3, 5, 6] },
    targetPerDay: 1,
    difficulty: "hard",
    reminder: "18:00",
    tags: ["strength"],
    createdAt: daysAgo(84),
    archived: false,
    order: 3,
  },
  {
    id: "h_journal",
    name: "Journal",
    icon: "pen-line",
    color: "c-emerald",
    category: "Mindfulness",
    frequency: { type: "daily" },
    targetPerDay: 1,
    difficulty: "easy",
    reminder: "22:00",
    tags: ["evening", "reflect"],
    createdAt: daysAgo(56),
    archived: false,
    order: 4,
  },
  {
    id: "h_nosugar",
    name: "No Added Sugar",
    icon: "salad",
    color: "c-teal",
    category: "Health",
    frequency: { type: "daily" },
    targetPerDay: 1,
    difficulty: "medium",
    tags: ["diet"],
    createdAt: daysAgo(42),
    archived: false,
    order: 5,
  },
];

// Deterministic-ish pseudo random so the seed is stable per day but varied.
function rand(seedStr: string): number {
  let h = 2166136261;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export function buildSeed(): MomentumData {
  const completions: Completions = {};
  let xp = 0;
  const today = todayISO();

  for (const h of seedHabits) {
    // consistency per habit (some are strong, some spotty)
    const consistency = h.id === "h_meditate" ? 0.92 : h.id === "h_workout" ? 0.85 : h.id === "h_nosugar" ? 0.7 : 0.82;
    let cursor = h.createdAt;
    let guard = 0;
    while (cursor <= today && guard++ < 400) {
      if (isScheduled(h, cursor) && cursor !== today) {
        const r = rand(h.id + cursor);
        if (r < consistency) {
          const count = h.targetPerDay > 1 ? Math.min(h.targetPerDay, 1 + Math.floor(rand("c" + h.id + cursor) * h.targetPerDay)) : 1;
          const reached = count >= h.targetPerDay ? count : count;
          completions[key(h.id, cursor)] = reached;
          xp += DIFFICULTY_XP[h.difficulty] * reached;
        }
      }
      cursor = addDays(cursor, 1);
    }
  }

  // Complete a couple of today's easy habits so the dashboard isn't empty,
  // but leave most pending so the user has something satisfying to tap.
  const meditate = seedHabits.find((h) => h.id === "h_meditate")!;
  if (isScheduled(meditate, today) && dayOfWeek(today) !== 7) {
    completions[key("h_meditate", today)] = 1;
    xp += DIFFICULTY_XP.easy;
  }
  completions[key("h_water", today)] = 1; // 1 of 3 — partial progress

  return { habits: seedHabits, completions, xp, version: 1 };
}
