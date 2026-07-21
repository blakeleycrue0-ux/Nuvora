export type Goal = "lose_fat" | "build_muscle" | "maintain" | "general_health";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Equipment = "full_gym" | "home_basic" | "bodyweight_only";
export type DietaryPreference = "none" | "vegetarian" | "vegan" | "pescatarian" | "keto";

export interface GeneratedPlan {
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatGoal: number;
  summary: string;
  weeklyWorkoutSplit: string[];
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  is_pro: boolean;
  onboarding_completed: boolean;
  goal: Goal | null;
  sex: "male" | "female" | "other" | null;
  birth_year: number | null;
  height_cm: number | null;
  current_weight_kg: number | null;
  target_weight_kg: number | null;
  activity_level: ActivityLevel | null;
  workout_days_per_week: number | null;
  dietary_preference: DietaryPreference | null;
  equipment: Equipment | null;
  plan: GeneratedPlan | null;
  created_at: string;
  updated_at: string;
}
