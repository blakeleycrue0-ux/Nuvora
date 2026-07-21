// Generic catalogs and feature demos — not personal data, safe to keep as-is
// until a user has logged anything of their own.

export const exerciseLibrary = [
  { name: "Barbell Bench Press", muscle: "Chest", equipment: "Barbell", difficulty: "Intermediate" },
  { name: "Incline Dumbbell Press", muscle: "Chest", equipment: "Dumbbell", difficulty: "Intermediate" },
  { name: "Pull-Up", muscle: "Back", equipment: "Bodyweight", difficulty: "Advanced" },
  { name: "Barbell Row", muscle: "Back", equipment: "Barbell", difficulty: "Intermediate" },
  { name: "Overhead Press", muscle: "Shoulders", equipment: "Barbell", difficulty: "Intermediate" },
  { name: "Lateral Raise", muscle: "Shoulders", equipment: "Dumbbell", difficulty: "Beginner" },
  { name: "Back Squat", muscle: "Legs", equipment: "Barbell", difficulty: "Advanced" },
  { name: "Romanian Deadlift", muscle: "Legs", equipment: "Barbell", difficulty: "Intermediate" },
  { name: "Barbell Curl", muscle: "Arms", equipment: "Barbell", difficulty: "Beginner" },
  { name: "Tricep Pushdown", muscle: "Arms", equipment: "Cable", difficulty: "Beginner" },
  { name: "Plank", muscle: "Core", equipment: "Bodyweight", difficulty: "Beginner" },
  { name: "Hanging Leg Raise", muscle: "Core", equipment: "Bodyweight", difficulty: "Advanced" },
];

// Nothing logged yet — every slot starts empty/locked until the user logs
// their own meals, workouts, weigh-ins and measurements.

export const meals = [
  { name: "Breakfast", time: "—", calories: 0, items: [] as string[] },
  { name: "Lunch", time: "—", calories: 0, items: [] as string[] },
  { name: "Snack", time: "—", calories: 0, items: [] as string[] },
  { name: "Dinner", time: "—", calories: 0, items: [] as string[] },
];

export const personalRecords: { exercise: string; value: string; date: string }[] = [];

export const workoutHistory: { name: string; date: string; duration: number; volume: number }[] = [];

export const measurements: { label: string; value: number; unit: string; delta: number }[] = [];

export const achievements = [
  { title: "First meal logged", description: "Log your first meal.", icon: "flame" as const, earned: false },
  { title: "First workout logged", description: "Complete your first workout.", icon: "dumbbell" as const, earned: false },
  { title: "7-day logging streak", description: "Log every day for a week.", icon: "flame" as const, earned: false },
  { title: "First 10K steps", description: "Hit 10,000 steps in a single day.", icon: "footprints" as const, earned: false },
  { title: "First milestone", description: "Reach your first weight milestone.", icon: "trophy" as const, earned: false },
];

export const aiSuggestions = [
  "Generate today's workout",
  "Adjust my calories",
  "Create a meal plan",
  "How am I tracking toward my goal?",
];
