import Anthropic from "@anthropic-ai/sdk";
import type { GeneratedPlan, ActivityLevel, DietaryPreference, Equipment, Goal } from "@/lib/types";
import { computeFallbackPlan } from "@/lib/plan-calculator";

interface PlanInput {
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

const PLAN_SCHEMA = {
  type: "object",
  properties: {
    calorieGoal: { type: "integer" },
    proteinGoal: { type: "integer" },
    carbsGoal: { type: "integer" },
    fatGoal: { type: "integer" },
    summary: { type: "string" },
    weeklyWorkoutSplit: { type: "array", items: { type: "string" } },
  },
  required: ["calorieGoal", "proteinGoal", "carbsGoal", "fatGoal", "summary", "weeklyWorkoutSplit"],
  additionalProperties: false,
} as const;

export async function generatePlan(input: PlanInput): Promise<GeneratedPlan> {
  const fallback = computeFallbackPlan(input);

  if (!process.env.ANTHROPIC_API_KEY) {
    return fallback;
  }

  try {
    // Netlify functions cut off around 10s. Cap the model call well under that
    // (no thinking, low effort, short timeout, no retries) so a slow response
    // falls back to the instant calculator instead of failing the whole request.
    const client = new Anthropic({ timeout: 8000, maxRetries: 0 });
    const age = new Date().getFullYear() - input.birthYear;

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      output_config: { effort: "low", format: { type: "json_schema", schema: PLAN_SCHEMA } },
      messages: [
        {
          role: "user",
          content: `You are Nuvora's AI fitness coach. Build a personalized daily nutrition and weekly workout plan for this person:

- Goal: ${input.goal.replace("_", " ")}
- Sex: ${input.sex}, Age: ${age}
- Height: ${input.heightCm} cm
- Current weight: ${input.currentWeightKg} kg, Target weight: ${input.targetWeightKg} kg
- Activity level: ${input.activityLevel.replace("_", " ")}
- Wants to train ${input.workoutDaysPerWeek} days/week
- Dietary preference: ${input.dietaryPreference}
- Equipment access: ${input.equipment.replace("_", " ")}

Use sound sports-nutrition principles (Mifflin-St Jeor for BMR, appropriate protein per kg for the goal) to set calorieGoal, proteinGoal, carbsGoal (grams), and fatGoal (grams). Write a warm, encouraging 2-3 sentence "summary" explaining the plan. Provide weeklyWorkoutSplit as a short array of workout day names (e.g. ["Push", "Pull", "Legs"]) matching the requested training frequency and equipment access.`,
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return fallback;

    const parsed = JSON.parse(textBlock.text) as GeneratedPlan;
    if (
      typeof parsed.calorieGoal !== "number" ||
      typeof parsed.proteinGoal !== "number" ||
      typeof parsed.carbsGoal !== "number" ||
      typeof parsed.fatGoal !== "number" ||
      typeof parsed.summary !== "string" ||
      !Array.isArray(parsed.weeklyWorkoutSplit)
    ) {
      return fallback;
    }

    return parsed;
  } catch {
    return fallback;
  }
}
