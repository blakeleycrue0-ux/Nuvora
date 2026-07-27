// Content for the guided onboarding: focus areas and the goal → habit
// templates they expand into. Keeping this data out of the page keeps the
// step components readable.

import type { Difficulty, Frequency, HabitColor } from "./types";

export interface GoalTemplate {
  id: string;
  label: string; // shown on the chip
  name: string; // resulting habit name
  icon: string;
  color: HabitColor;
  category: string;
  difficulty: Difficulty;
  frequency: Frequency;
  verify?: boolean; // pre-enable AI photo verification for visual habits
}

export interface FocusArea {
  id: string;
  label: string;
  icon: string;
  color: HabitColor;
  blurb: string;
  goals: GoalTemplate[];
}

const daily: Frequency = { type: "daily" };

export const FOCUS_AREAS: FocusArea[] = [
  {
    id: "health",
    label: "Health",
    icon: "heart-pulse",
    color: "c-rose",
    blurb: "Feel better, day to day",
    goals: [
      { id: "water", label: "Drink water", name: "Drink water", icon: "glass-water", color: "c-sky", category: "Health", difficulty: "easy", frequency: daily },
      { id: "veg", label: "Eat vegetables", name: "Eat vegetables", icon: "salad", color: "c-emerald", category: "Health", difficulty: "medium", frequency: daily, verify: true },
      { id: "steps", label: "10k steps", name: "Walk 10k steps", icon: "footprints", color: "c-teal", category: "Health", difficulty: "medium", frequency: daily },
      { id: "vitamins", label: "Take vitamins", name: "Take vitamins", icon: "apple", color: "c-amber", category: "Health", difficulty: "easy", frequency: daily },
    ],
  },
  {
    id: "fitness",
    label: "Fitness",
    icon: "dumbbell",
    color: "c-fuchsia",
    blurb: "Get stronger and move more",
    goals: [
      { id: "workout", label: "Exercise", name: "Exercise", icon: "dumbbell", color: "c-rose", category: "Fitness", difficulty: "hard", frequency: daily, verify: true },
      { id: "stretch", label: "Stretch", name: "Stretch", icon: "waves", color: "c-teal", category: "Fitness", difficulty: "easy", frequency: daily },
      { id: "run", label: "Go for a run", name: "Go for a run", icon: "footprints", color: "c-emerald", category: "Fitness", difficulty: "hard", frequency: { type: "custom", timesPerWeek: 3 }, verify: true },
      { id: "cycle", label: "Cycle", name: "Cycle", icon: "bike", color: "c-sky", category: "Fitness", difficulty: "medium", frequency: { type: "custom", timesPerWeek: 3 } },
    ],
  },
  {
    id: "mind",
    label: "Mind",
    icon: "brain",
    color: "c-violet",
    blurb: "Calmer, clearer, more present",
    goals: [
      { id: "meditate", label: "Meditate", name: "Meditate", icon: "brain", color: "c-violet", category: "Mindfulness", difficulty: "medium", frequency: daily },
      { id: "journal", label: "Journal", name: "Journal", icon: "notebook-pen", color: "c-emerald", category: "Mindfulness", difficulty: "easy", frequency: daily },
      { id: "gratitude", label: "Gratitude", name: "Write 3 gratitudes", icon: "heart", color: "c-rose", category: "Mindfulness", difficulty: "easy", frequency: daily },
      { id: "breathe", label: "Breathing", name: "Breathing exercise", icon: "wind", color: "c-teal", category: "Mindfulness", difficulty: "easy", frequency: daily },
    ],
  },
  {
    id: "sleep",
    label: "Sleep",
    icon: "bed",
    color: "c-indigo",
    blurb: "Rest deeper, wake sharper",
    goals: [
      { id: "bedtime", label: "Sleep by 11pm", name: "Sleep by 11pm", icon: "bed", color: "c-indigo", category: "Sleep", difficulty: "medium", frequency: daily },
      { id: "nophone", label: "No phone in bed", name: "No phone in bed", icon: "phone-off", color: "c-violet", category: "Sleep", difficulty: "medium", frequency: daily },
      { id: "wake", label: "Wake at 6am", name: "Wake at 6am", icon: "sunrise", color: "c-amber", category: "Sleep", difficulty: "hard", frequency: daily },
    ],
  },
  {
    id: "focus",
    label: "Focus",
    icon: "target",
    color: "c-amber",
    blurb: "Do more of what matters",
    goals: [
      { id: "planday", label: "Plan my day", name: "Plan my day", icon: "list-checks", color: "c-amber", category: "Productivity", difficulty: "easy", frequency: daily },
      { id: "deepwork", label: "Deep work", name: "Deep work block", icon: "zap", color: "c-indigo", category: "Productivity", difficulty: "hard", frequency: daily },
      { id: "nosocial", label: "Limit social media", name: "Limit social media", icon: "phone-off", color: "c-rose", category: "Productivity", difficulty: "hard", frequency: daily },
      { id: "inbox", label: "Clear inbox", name: "Clear my inbox", icon: "list-checks", color: "c-teal", category: "Productivity", difficulty: "easy", frequency: daily },
    ],
  },
  {
    id: "learning",
    label: "Learning",
    icon: "graduation-cap",
    color: "c-sky",
    blurb: "Grow a little every day",
    goals: [
      { id: "read", label: "Read", name: "Read", icon: "book-open", color: "c-amber", category: "Learning", difficulty: "medium", frequency: daily, verify: true },
      { id: "language", label: "Learn a language", name: "Practice a language", icon: "languages", color: "c-sky", category: "Learning", difficulty: "medium", frequency: daily },
      { id: "code", label: "Code", name: "Code", icon: "code", color: "c-indigo", category: "Learning", difficulty: "hard", frequency: daily },
      { id: "study", label: "Study", name: "Study", icon: "graduation-cap", color: "c-violet", category: "Learning", difficulty: "medium", frequency: daily },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    icon: "leaf",
    color: "c-emerald",
    blurb: "Build a life you love",
    goals: [
      { id: "quit", label: "Quit smoking", name: "Stay smoke-free", icon: "cigarette-off", color: "c-rose", category: "Lifestyle", difficulty: "hard", frequency: daily },
      { id: "save", label: "Save money", name: "Save money", icon: "piggy-bank", color: "c-emerald", category: "Lifestyle", difficulty: "medium", frequency: daily },
      { id: "tidy", label: "Tidy up", name: "Tidy my space", icon: "sparkles", color: "c-teal", category: "Lifestyle", difficulty: "easy", frequency: daily, verify: true },
      { id: "create", label: "Make art", name: "Make something", icon: "palette", color: "c-fuchsia", category: "Lifestyle", difficulty: "medium", frequency: daily, verify: true },
    ],
  },
];

export const MOTIVATIONS: { id: string; label: string; icon: string }[] = [
  { id: "health", label: "Feel healthier & more energetic", icon: "heart-pulse" },
  { id: "discipline", label: "Build discipline & self-respect", icon: "flame" },
  { id: "goals", label: "Reach a specific goal", icon: "target" },
  { id: "stress", label: "Feel calmer & less stressed", icon: "leaf" },
  { id: "confidence", label: "Grow my confidence", icon: "sparkles" },
];

export const CONSISTENCY: { id: string; label: string; hint: string }[] = [
  { id: "new", label: "I'm just starting out", hint: "No routine yet — that's fine" },
  { id: "onoff", label: "On and off", hint: "I start habits but they fade" },
  { id: "steady", label: "Pretty consistent", hint: "I want to do even better" },
];

export const REVIEWS: { name: string; quote: string; stars: number }[] = [
  { name: "Alex R.", quote: "The photo verification actually keeps me honest. I've never held a streak this long.", stars: 5 },
  { name: "Priya M.", quote: "Beautiful, calm, and it just works. It replaced three other apps for me.", stars: 5 },
  { name: "Daniel K.", quote: "The XP and level-ups make showing up genuinely fun. 74-day streak and counting.", stars: 5 },
  { name: "Sofía L.", quote: "Finally an app that feels premium without being cluttered. I look forward to opening it.", stars: 5 },
];
