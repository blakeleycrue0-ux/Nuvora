import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePlan } from "@/lib/ai-plan";
import type { ActivityLevel, DietaryPreference, Equipment, Goal } from "@/lib/types";

interface OnboardingPayload {
  goal: Goal;
  sex: "male" | "female" | "other";
  birthYear: number;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg: number;
  activityLevel: ActivityLevel;
  workoutDaysPerWeek: number;
  dietaryPreference: DietaryPreference;
  equipment: Equipment;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await request.json()) as OnboardingPayload;

  const required = [
    body.goal,
    body.sex,
    body.birthYear,
    body.heightCm,
    body.currentWeightKg,
    body.targetWeightKg,
    body.activityLevel,
    body.workoutDaysPerWeek,
    body.dietaryPreference,
    body.equipment,
  ];
  if (required.some((v) => v === undefined || v === null)) {
    return NextResponse.json({ error: "Missing onboarding fields" }, { status: 400 });
  }

  const plan = await generatePlan(body);

  // Upsert (not update) so onboarding still works even if the new-user trigger
  // never created a profile row for this account.
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      goal: body.goal,
      sex: body.sex,
      birth_year: body.birthYear,
      height_cm: body.heightCm,
      current_weight_kg: body.currentWeightKg,
      target_weight_kg: body.targetWeightKg,
      activity_level: body.activityLevel,
      workout_days_per_week: body.workoutDaysPerWeek,
      dietary_preference: body.dietaryPreference,
      equipment: body.equipment,
      plan,
      onboarding_completed: true,
    },
    { onConflict: "id" },
  );

  if (error) {
    return NextResponse.json(
      { error: `Could not save your profile: ${error.message}` },
      { status: 500 },
    );
  }

  return NextResponse.json({ plan });
}
