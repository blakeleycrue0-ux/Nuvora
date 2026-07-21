import type { GeneratedPlan, ActivityLevel, Goal } from "@/lib/types";

interface PlanInput {
  goal: Goal;
  sex: "male" | "female" | "other";
  birthYear: number;
  heightCm: number;
  currentWeightKg: number;
  activityLevel: ActivityLevel;
  workoutDaysPerWeek: number;
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const GOAL_ADJUSTMENT: Record<Goal, number> = {
  lose_fat: -500,
  build_muscle: 300,
  maintain: 0,
  general_health: 0,
};

const SPLITS: Record<number, string[]> = {
  2: ["Full Body A", "Full Body B"],
  3: ["Push", "Pull", "Legs"],
  4: ["Upper Body", "Lower Body", "Push", "Pull"],
  5: ["Push", "Pull", "Legs", "Upper Body", "Lower Body"],
  6: ["Push", "Pull", "Legs", "Push", "Pull", "Legs"],
};

export function computeFallbackPlan(input: PlanInput): GeneratedPlan {
  const age = new Date().getFullYear() - input.birthYear;
  const bmrBase = 10 * input.currentWeightKg + 6.25 * input.heightCm - 5 * age;
  const bmr = input.sex === "male" ? bmrBase + 5 : input.sex === "female" ? bmrBase - 161 : bmrBase - 78;

  const tdee = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];
  const calorieGoal = Math.round((tdee + GOAL_ADJUSTMENT[input.goal]) / 10) * 10;

  const proteinPerKg = input.goal === "build_muscle" ? 2.2 : 1.8;
  const proteinGoal = Math.round(input.currentWeightKg * proteinPerKg);
  const fatGoal = Math.round((calorieGoal * 0.25) / 9);
  const carbsGoal = Math.round((calorieGoal - proteinGoal * 4 - fatGoal * 9) / 4);

  const days = Math.min(Math.max(input.workoutDaysPerWeek, 2), 6);
  const weeklyWorkoutSplit = SPLITS[days] ?? SPLITS[3];

  const goalLabel = {
    lose_fat: "losing fat while preserving muscle",
    build_muscle: "building muscle with a steady surplus",
    maintain: "maintaining your current weight",
    general_health: "improving overall health and consistency",
  }[input.goal];

  return {
    calorieGoal,
    proteinGoal,
    carbsGoal,
    fatGoal,
    summary: `Based on your stats, we've set a daily target of ${calorieGoal.toLocaleString()} kcal focused on ${goalLabel}. You'll train ${days} days a week following a ${weeklyWorkoutSplit.join("/")} split.`,
    weeklyWorkoutSplit,
  };
}
