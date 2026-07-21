"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Dumbbell,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Meter } from "@/components/ui/Meter";
import { cn } from "@/lib/utils";
import type {
  ActivityLevel,
  DietaryPreference,
  Equipment,
  Goal,
  GeneratedPlan,
} from "@/lib/types";

interface Answers {
  goal: Goal | null;
  sex: "male" | "female" | "other" | null;
  birthYear: string;
  heightCm: string;
  currentWeightKg: string;
  targetWeightKg: string;
  activityLevel: ActivityLevel | null;
  workoutDaysPerWeek: number | null;
  dietaryPreference: DietaryPreference | null;
  equipment: Equipment | null;
}

const initialAnswers: Answers = {
  goal: null,
  sex: null,
  birthYear: "",
  heightCm: "",
  currentWeightKg: "",
  targetWeightKg: "",
  activityLevel: null,
  workoutDaysPerWeek: null,
  dietaryPreference: null,
  equipment: null,
};

const goalOptions: { value: Goal; label: string; description: string }[] = [
  { value: "lose_fat", label: "Lose fat", description: "Steady deficit, keep your strength" },
  { value: "build_muscle", label: "Build muscle", description: "Controlled surplus, train hard" },
  { value: "maintain", label: "Maintain", description: "Hold steady, stay consistent" },
  { value: "general_health", label: "General health", description: "Feel better, move more" },
];

const activityOptions: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "sedentary", label: "Sedentary", description: "Desk job, little exercise" },
  { value: "light", label: "Lightly active", description: "Light exercise 1-3 days/week" },
  { value: "moderate", label: "Moderately active", description: "Moderate exercise 3-5 days/week" },
  { value: "active", label: "Active", description: "Hard exercise 6-7 days/week" },
  { value: "very_active", label: "Very active", description: "Physical job or 2x/day training" },
];

const dietaryOptions: { value: DietaryPreference; label: string }[] = [
  { value: "none", label: "No preference" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "keto", label: "Keto" },
];

const equipmentOptions: { value: Equipment; label: string; description: string }[] = [
  { value: "full_gym", label: "Full gym", description: "Barbells, machines, everything" },
  { value: "home_basic", label: "Home basics", description: "Dumbbells and bands" },
  { value: "bodyweight_only", label: "Bodyweight only", description: "No equipment" },
];

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);

  const update = <K extends keyof Answers>(key: K, value: Answers[K]) =>
    setAnswers((a) => ({ ...a, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canContinue = () => {
    switch (step) {
      case 0:
        return !!answers.goal;
      case 1:
        return !!answers.sex;
      case 2:
        return !!answers.birthYear && !!answers.heightCm;
      case 3:
        return !!answers.currentWeightKg && !!answers.targetWeightKg;
      case 4:
        return !!answers.activityLevel;
      case 5:
        return !!answers.workoutDaysPerWeek;
      case 6:
        return !!answers.dietaryPreference && !!answers.equipment;
      default:
        return true;
    }
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal: answers.goal,
          sex: answers.sex,
          birthYear: Number(answers.birthYear),
          heightCm: Number(answers.heightCm),
          currentWeightKg: Number(answers.currentWeightKg),
          targetWeightKg: Number(answers.targetWeightKg),
          activityLevel: answers.activityLevel,
          workoutDaysPerWeek: answers.workoutDaysPerWeek,
          dietaryPreference: answers.dietaryPreference,
          equipment: answers.equipment,
        }),
      });
      if (!res.ok) throw new Error("Could not generate your plan. Please try again.");
      const data = await res.json();
      setPlan(data.plan);
      setStep(TOTAL_STEPS);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const progress = plan ? 100 : (step / TOTAL_STEPS) * 100;

  return (
    <div className="flex min-h-screen flex-col items-center bg-bg px-4 py-10 sm:py-16">
      <div className="mb-8 flex w-full max-w-lg items-center justify-between">
        <Logo />
        {!plan && (
          <span className="text-[12px] text-text-muted">
            Step {Math.min(step + 1, TOTAL_STEPS)} of {TOTAL_STEPS}
          </span>
        )}
      </div>

      <div className="mb-8 w-full max-w-lg">
        <Meter value={progress} max={100} />
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {!plan ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {step === 0 && (
                <StepShell title="What's your main goal?" subtitle="This shapes your calorie and macro targets.">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {goalOptions.map((opt) => (
                      <OptionCard
                        key={opt.value}
                        selected={answers.goal === opt.value}
                        label={opt.label}
                        description={opt.description}
                        onClick={() => update("goal", opt.value)}
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 1 && (
                <StepShell title="What's your sex?" subtitle="Used to estimate your energy needs accurately.">
                  <div className="grid grid-cols-3 gap-3">
                    {(["male", "female", "other"] as const).map((s) => (
                      <OptionCard
                        key={s}
                        selected={answers.sex === s}
                        label={s.charAt(0).toUpperCase() + s.slice(1)}
                        onClick={() => update("sex", s)}
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 2 && (
                <StepShell title="A bit about you" subtitle="Birth year and height.">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Birth year">
                      <Input
                        type="number"
                        placeholder="1996"
                        value={answers.birthYear}
                        onChange={(e) => update("birthYear", e.target.value)}
                      />
                    </Field>
                    <Field label="Height (cm)">
                      <Input
                        type="number"
                        placeholder="178"
                        value={answers.heightCm}
                        onChange={(e) => update("heightCm", e.target.value)}
                      />
                    </Field>
                  </div>
                </StepShell>
              )}

              {step === 3 && (
                <StepShell title="Current & target weight" subtitle="In kilograms.">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Current weight (kg)">
                      <Input
                        type="number"
                        placeholder="80"
                        value={answers.currentWeightKg}
                        onChange={(e) => update("currentWeightKg", e.target.value)}
                      />
                    </Field>
                    <Field label="Target weight (kg)">
                      <Input
                        type="number"
                        placeholder="74"
                        value={answers.targetWeightKg}
                        onChange={(e) => update("targetWeightKg", e.target.value)}
                      />
                    </Field>
                  </div>
                </StepShell>
              )}

              {step === 4 && (
                <StepShell title="How active are you day to day?" subtitle="Outside of dedicated workouts.">
                  <div className="flex flex-col gap-2.5">
                    {activityOptions.map((opt) => (
                      <OptionCard
                        key={opt.value}
                        selected={answers.activityLevel === opt.value}
                        label={opt.label}
                        description={opt.description}
                        onClick={() => update("activityLevel", opt.value)}
                        wide
                      />
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 5 && (
                <StepShell title="How many days a week can you train?" subtitle="Be realistic — consistency wins.">
                  <div className="grid grid-cols-5 gap-2.5">
                    {[2, 3, 4, 5, 6].map((d) => (
                      <button
                        key={d}
                        onClick={() => update("workoutDaysPerWeek", d)}
                        className={cn(
                          "flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border text-[13px] font-medium transition-colors",
                          answers.workoutDaysPerWeek === d
                            ? "border-primary/50 bg-primary-soft text-primary"
                            : "border-border bg-card text-text-secondary hover:border-white/20",
                        )}
                      >
                        <span className="text-[20px] font-semibold">{d}</span>
                        days
                      </button>
                    ))}
                  </div>
                </StepShell>
              )}

              {step === 6 && (
                <StepShell title="Diet & equipment" subtitle="Helps tailor meal and workout suggestions.">
                  <div className="flex flex-col gap-5">
                    <div>
                      <p className="mb-2.5 text-[12.5px] font-medium text-text-secondary">Dietary preference</p>
                      <div className="flex flex-wrap gap-2">
                        {dietaryOptions.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => update("dietaryPreference", opt.value)}
                            className={cn(
                              "rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                              answers.dietaryPreference === opt.value
                                ? "border-primary/50 bg-primary-soft text-primary"
                                : "border-border text-text-secondary hover:border-white/20",
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2.5 text-[12.5px] font-medium text-text-secondary">Equipment access</p>
                      <div className="flex flex-col gap-2.5">
                        {equipmentOptions.map((opt) => (
                          <OptionCard
                            key={opt.value}
                            selected={answers.equipment === opt.value}
                            label={opt.label}
                            description={opt.description}
                            onClick={() => update("equipment", opt.value)}
                            wide
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </StepShell>
              )}

              {error && <p className="mt-4 text-center text-[13px] text-danger">{error}</p>}

              <div className="mt-8 flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={back} disabled={step === 0 || loading}>
                  <ArrowLeft size={15} />
                  Back
                </Button>
                {step < 6 ? (
                  <Button onClick={next} disabled={!canContinue()}>
                    Continue
                    <ArrowRight size={15} />
                  </Button>
                ) : (
                  <Button onClick={generate} disabled={!canContinue() || loading}>
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Building your plan...
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        Generate my plan
                      </>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-6 flex flex-col items-center text-center">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-success-soft">
                  <Check size={22} className="text-success" />
                </span>
                <h1 className="text-[22px] font-semibold text-text">Your plan is ready</h1>
                <p className="mt-1.5 max-w-sm text-[13.5px] text-text-secondary">{plan.summary}</p>
              </div>

              <Card className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
                {[
                  { label: "Calories", value: plan.calorieGoal, unit: "kcal", icon: Flame, color: "var(--color-primary)" },
                  { label: "Protein", value: plan.proteinGoal, unit: "g", icon: Dumbbell, color: "var(--chart-1)" },
                  { label: "Carbs", value: plan.carbsGoal, unit: "g", icon: Scale, color: "var(--chart-4)" },
                  { label: "Fat", value: plan.fatGoal, unit: "g", icon: Sparkles, color: "var(--chart-5)" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center gap-2 text-center">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: `color-mix(in oklab, ${s.color} 14%, transparent)` }}
                    >
                      <s.icon size={16} style={{ color: s.color }} />
                    </span>
                    <span className="text-[17px] font-semibold tabular-nums text-text">{s.value}</span>
                    <span className="text-[11px] text-text-muted">
                      {s.label} ({s.unit})
                    </span>
                  </div>
                ))}
              </Card>

              <Card className="mt-4 p-6">
                <p className="text-[12.5px] font-medium text-text-secondary">Weekly split</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {plan.weeklyWorkoutSplit.map((day, i) => (
                    <span
                      key={i}
                      className="rounded-full border border-border bg-bg-elevated px-3 py-1.5 text-[12.5px] text-text"
                    >
                      {day}
                    </span>
                  ))}
                </div>
              </Card>

              <Button className="mt-8 w-full" size="lg" onClick={() => router.push("/dashboard")}>
                Go to Dashboard
                <ArrowRight size={16} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1 className="text-[22px] font-semibold tracking-tight text-text">{title}</h1>
      <p className="mt-1.5 text-[13.5px] text-text-secondary">{subtitle}</p>
      <div className="mt-7">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-text-secondary">{label}</span>
      {children}
    </label>
  );
}

function OptionCard({
  selected,
  label,
  description,
  onClick,
  wide,
}: {
  selected: boolean;
  label: string;
  description?: string;
  onClick: () => void;
  wide?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-3 rounded-2xl border p-4 text-left transition-colors",
        wide ? "w-full" : "",
        selected ? "border-primary/50 bg-primary-soft" : "border-border bg-card hover:border-white/20",
      )}
    >
      <div>
        <p className={cn("text-[13.5px] font-medium", selected ? "text-primary" : "text-text")}>{label}</p>
        {description && <p className="mt-0.5 text-[11.5px] text-text-secondary">{description}</p>}
      </div>
      {selected && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
          <Check size={12} />
        </span>
      )}
    </button>
  );
}
