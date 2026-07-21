"use client";

import { Flame, Droplets, Footprints, Scale, Beef, Dumbbell, ArrowRight, Sparkles, CalendarClock } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatCard } from "@/components/app/StatCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Meter } from "@/components/ui/Meter";
import { useProfile } from "@/components/app/ProfileProvider";
import { aiSuggestions } from "@/lib/mock-data";

const todayLabel = new Date().toLocaleDateString(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
});

export default function DashboardPage() {
  const { profile } = useProfile();
  const plan = profile?.plan;

  const firstName = profile?.full_name?.split(" ")[0];
  const greeting = firstName ? `Good morning, ${firstName}` : "Good morning";

  const calorieGoal = plan?.calorieGoal ?? 2000;
  const caloriesConsumed = 0;
  const caloriesLeft = calorieGoal - caloriesConsumed;

  const macros = [
    { label: "Protein", value: 0, goal: plan?.proteinGoal ?? 150, color: "var(--chart-1)" },
    { label: "Carbs", value: 0, goal: plan?.carbsGoal ?? 200, color: "var(--chart-4)" },
    { label: "Fat", value: 0, goal: plan?.fatGoal ?? 65, color: "var(--chart-5)" },
  ];

  const currentWeight = profile?.current_weight_kg;
  const targetWeight = profile?.target_weight_kg;

  return (
    <AppShell>
      <PageHeader
        title={greeting}
        subtitle={todayLabel}
        action={
          <Button size="sm" variant="secondary" className="hidden sm:inline-flex">
            Log entry
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-10">
        {/* Today's calories — hero card */}
        <Card className="flex flex-col justify-between gap-6 p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-text-secondary">Calories remaining</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[34px] font-semibold tabular-nums leading-none text-text">
                  {caloriesLeft.toLocaleString()}
                </span>
                <span className="text-[13px] text-text-muted">of {calorieGoal.toLocaleString()} kcal</span>
              </div>
              {!plan && (
                <p className="mt-1.5 text-[11.5px] text-text-muted">Using a default goal — finish onboarding for a personalized target.</p>
              )}
            </div>
            <ProgressRing value={caloriesConsumed} max={calorieGoal} size={92} strokeWidth={9}>
              <div className="flex flex-col items-center">
                <Flame size={18} className="text-primary" />
                <span className="mt-0.5 text-[11px] font-medium tabular-nums text-text">
                  {Math.round((caloriesConsumed / calorieGoal) * 100)}%
                </span>
              </div>
            </ProgressRing>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {macros.map((macro) => (
              <div key={macro.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-text-secondary">{macro.label}</span>
                  <span className="tabular-nums text-text-muted">
                    {macro.value}/{macro.goal}g
                  </span>
                </div>
                <Meter value={macro.value} max={macro.goal} color={macro.color} />
              </div>
            ))}
          </div>
        </Card>

        {/* Today's workout */}
        <Card className="flex flex-col justify-between gap-5 p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-text-secondary">Your split</p>
              <h3 className="mt-1 text-[16px] font-semibold text-text">
                {plan?.weeklyWorkoutSplit?.length ? plan.weeklyWorkoutSplit.join(" · ") : "Not set yet"}
              </h3>
            </div>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
              <Dumbbell size={17} className="text-primary" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="default">
              <CalendarClock size={11} />
              {plan?.weeklyWorkoutSplit?.length ?? 0} days/week
            </Badge>
          </div>
          <Button href="/workouts" variant="primary" className="w-full group">
            Go to Workouts
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Card>

        {/* Quick stats */}
        <StatCard
          icon={Beef}
          color="var(--chart-1)"
          label="Protein"
          value="0"
          unit="g"
          progress={{ value: 0, max: plan?.proteinGoal ?? 150 }}
          goalLabel={`Goal ${plan?.proteinGoal ?? 150}g`}
        />
        <StatCard
          icon={Droplets}
          color="var(--color-primary)"
          label="Water"
          value="0"
          unit="L"
          progress={{ value: 0, max: 3 }}
          goalLabel="Goal 3L"
        />
        <StatCard
          icon={Footprints}
          color="var(--chart-2)"
          label="Steps"
          value="0"
          progress={{ value: 0, max: 10000 }}
          goalLabel="Goal 10,000"
        />
        <Card className="flex flex-col justify-between gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success-soft">
              <Scale size={15} className="text-success" />
            </span>
            <span className="text-[12px] text-text-muted">Weight</span>
          </div>
          {currentWeight ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-[22px] font-semibold tabular-nums leading-none text-text">
                  {currentWeight}
                </span>
                <span className="text-[12px] text-text-muted">kg</span>
              </div>
              {targetWeight && (
                <Badge tone="default" className="w-fit">
                  Goal {targetWeight} kg
                </Badge>
              )}
            </>
          ) : (
            <p className="text-[12px] text-text-muted">Not set yet</p>
          )}
        </Card>

        {/* Weekly overview */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-text-secondary">This week</p>
              <h3 className="mt-1 text-[16px] font-semibold text-text">Calorie intake</h3>
            </div>
          </div>
          <EmptyState
            icon={Flame}
            title="No meals logged yet"
            description="Log meals on the Nutrition page to see your weekly trend here."
          />
        </Card>

        {/* AI Coach teaser */}
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
              <Sparkles size={16} className="text-primary" />
            </span>
            <h3 className="text-[15px] font-semibold text-text">Ask your coach</h3>
          </div>
          <div className="flex flex-col gap-2">
            {aiSuggestions.slice(0, 3).map((s) => (
              <a
                key={s}
                href="/coach"
                className="rounded-xl border border-border bg-bg-elevated px-3.5 py-2.5 text-[13px] text-text-secondary transition-colors hover:border-white/[0.14] hover:text-text"
              >
                {s}
              </a>
            ))}
          </div>
          <Button href="/coach" variant="ghost" size="sm" className="w-fit px-0">
            Open Coach
            <ArrowRight size={14} />
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
