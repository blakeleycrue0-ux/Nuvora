export const today = {
  date: "Tuesday, July 20",
  greeting: "Good morning, Alex",
  calories: { consumed: 1160, goal: 2400 },
  protein: { value: 98, goal: 160 },
  carbs: { value: 132, goal: 240 },
  fat: { value: 38, goal: 70 },
  water: { value: 1.8, goal: 3 },
  steps: { value: 8412, goal: 10000 },
  weight: { value: 176.2, unit: "lb", delta: -0.4 },
  workout: { name: "Push Day — Chest & Triceps", duration: 52, done: false },
};

export const weeklyCalories = [
  { label: "Mon", value: 2180 },
  { label: "Tue", value: 1160 },
  { label: "Wed", value: 2340 },
  { label: "Thu", value: 1980 },
  { label: "Fri", value: 2410 },
  { label: "Sat", value: 2600 },
  { label: "Sun", value: 2050 },
];

export const weeklySteps = [
  { label: "Mon", value: 9200 },
  { label: "Tue", value: 8412 },
  { label: "Wed", value: 11300 },
  { label: "Thu", value: 6800 },
  { label: "Fri", value: 10450 },
  { label: "Sat", value: 13200 },
  { label: "Sun", value: 7600 },
];

export const weightHistory = [
  { label: "Jun 22", value: 184.6 },
  { label: "Jun 29", value: 182.9 },
  { label: "Jul 6", value: 181.4 },
  { label: "Jul 13", value: 178.8 },
  { label: "Jul 20", value: 176.2 },
];

export const weightHistoryLong = [
  { label: "Jan", value: 196.4 },
  { label: "Feb", value: 193.1 },
  { label: "Mar", value: 190.8 },
  { label: "Apr", value: 187.2 },
  { label: "May", value: 183.6 },
  { label: "Jun", value: 180.1 },
  { label: "Jul", value: 176.2 },
];

export const measurements = [
  { label: "Chest", value: 41.2, unit: '"', delta: -1.1 },
  { label: "Waist", value: 33.5, unit: '"', delta: -2.4 },
  { label: "Hips", value: 39.8, unit: '"', delta: -1.0 },
  { label: "Arms", value: 14.1, unit: '"', delta: 0.4 },
  { label: "Thighs", value: 22.6, unit: '"', delta: -0.8 },
  { label: "Body Fat", value: 16.8, unit: "%", delta: -3.2 },
];

export const achievements = [
  { title: "14-day logging streak", description: "Logged every meal for two weeks straight.", icon: "flame", earned: true },
  { title: "First 10K steps", description: "Hit 10,000 steps in a single day.", icon: "footprints", earned: true },
  { title: "-10 lb milestone", description: "Lost your first ten pounds.", icon: "trophy", earned: true },
  { title: "30-day streak", description: "Log every day for a month.", icon: "flame", earned: false },
  { title: "Consistency king", description: "Complete 20 workouts in a month.", icon: "dumbbell", earned: false },
];

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

export const todayWorkout = {
  name: "Push Day — Chest & Triceps",
  exercises: [
    { name: "Barbell Bench Press", sets: [{ reps: 8, weight: 155 }, { reps: 8, weight: 155 }, { reps: 6, weight: 165 }] },
    { name: "Incline Dumbbell Press", sets: [{ reps: 10, weight: 60 }, { reps: 10, weight: 60 }, { reps: 8, weight: 65 }] },
    { name: "Overhead Press", sets: [{ reps: 8, weight: 95 }, { reps: 8, weight: 95 }] },
    { name: "Tricep Pushdown", sets: [{ reps: 12, weight: 50 }, { reps: 12, weight: 50 }, { reps: 10, weight: 55 }] },
  ],
};

export const personalRecords = [
  { exercise: "Barbell Bench Press", value: "185 lb × 3", date: "Jul 12" },
  { exercise: "Back Squat", value: "245 lb × 5", date: "Jul 8" },
  { exercise: "Deadlift", value: "285 lb × 3", date: "Jun 30" },
  { exercise: "Overhead Press", value: "115 lb × 5", date: "Jun 24" },
];

export const workoutHistory = [
  { name: "Push Day — Chest & Triceps", date: "Jul 18", duration: 54, volume: 12840 },
  { name: "Pull Day — Back & Biceps", date: "Jul 16", duration: 49, volume: 11200 },
  { name: "Leg Day", date: "Jul 14", duration: 61, volume: 15680 },
  { name: "Push Day — Chest & Triceps", date: "Jul 11", duration: 52, volume: 12310 },
];

export const meals = [
  {
    name: "Breakfast",
    time: "7:40 AM",
    calories: 420,
    items: ["Greek yogurt & berries", "Espresso"],
  },
  {
    name: "Lunch",
    time: "12:30 PM",
    calories: 640,
    items: ["Grilled chicken bowl", "Brown rice", "Avocado"],
  },
  {
    name: "Snack",
    time: "3:15 PM",
    calories: 180,
    items: ["Protein shake"],
  },
  {
    name: "Dinner",
    time: "—",
    calories: 0,
    items: [],
  },
];

export const aiSuggestions = [
  "Generate today's workout",
  "Adjust my calories",
  "Create a meal plan",
  "Why did my weight go up?",
];
