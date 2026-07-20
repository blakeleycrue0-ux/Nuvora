"use client";

import { Flame, Droplets, Footprints, Scale, Beef, Dumbbell, ArrowRight, Sparkles } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { StatCard } from "@/components/app/StatCard";
import { BarChart } from "@/components/ui/BarChart";
import { Meter } from "@/components/ui/Meter";
import { today, weeklyCalories, aiSuggestions } from "@/lib/mock-data";

export default function DashboardPage() {
  const caloriesLeft = today.calories.goal - today.calories.consumed;

  return (
    <AppShell>
      <PageHeader
        title={today.greeting}
        subtitle={today.date}
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
                <span className="text-[13px] text-text-muted">
                  of {today.calories.goal.toLocaleString()} kcal
                </span>
              </div>
            </div>
            <ProgressRing value={today.calories.consumed} max={today.calories.goal} size={92} strokeWidth={9}>
              <div className="flex flex-col items-center">
                <Flame size={18} className="text-primary" />
                <span className="mt-0.5 text-[11px] font-medium tabular-nums text-text">
                  {Math.round((today.calories.consumed / today.calories.goal) * 100)}%
                </span>
              </div>
            </ProgressRing>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Protein", ...today.protein, color: "var(--chart-1)" },
              { label: "Carbs", ...today.carbs, color: "var(--chart-4)" },
              { label: "Fat", ...today.fat, color: "var(--chart-5)" },
            ].map((macro) => (
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
              <p className="text-[13px] text-text-secondary">Today&apos;s workout</p>
              <h3 className="mt-1 text-[16px] font-semibold text-text">{today.workout.name}</h3>
            </div>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
              <Dumbbell size={17} className="text-primary" />
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={today.workout.done ? "success" : "default"}>
              {today.workout.done ? "Completed" : `~${today.workout.duration} min`}
            </Badge>
          </div>
          <Button href="/workouts" variant="primary" className="w-full group">
            {today.workout.done ? "View Summary" : "Start Workout"}
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Button>
        </Card>

        {/* Quick stats */}
        <StatCard
          icon={Beef}
          color="var(--chart-1)"
          label="Protein"
          value={String(today.protein.value)}
          unit="g"
          progress={{ value: today.protein.value, max: today.protein.goal }}
          goalLabel={`${today.protein.goal - today.protein.value}g to go`}
        />
        <StatCard
          icon={Droplets}
          color="var(--color-primary)"
          label="Water"
          value={String(today.water.value)}
          unit="L"
          progress={{ value: today.water.value, max: today.water.goal }}
          goalLabel={`Goal ${today.water.goal}L`}
        />
        <StatCard
          icon={Footprints}
          color="var(--chart-2)"
          label="Steps"
          value={today.steps.value.toLocaleString()}
          progress={{ value: today.steps.value, max: today.steps.goal }}
          goalLabel={`Goal ${today.steps.goal.toLocaleString()}`}
        />
        <Card className="flex flex-col justify-between gap-3 p-4">
          <div className="flex items-center justify-between">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-success-soft">
              <Scale size={15} className="text-success" />
            </span>
            <span className="text-[12px] text-text-muted">Weight</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[22px] font-semibold tabular-nums leading-none text-text">
              {today.weight.value}
            </span>
            <span className="text-[12px] text-text-muted">{today.weight.unit}</span>
          </div>
          <Badge tone="success" className="w-fit">
            {today.weight.delta} lb this week
          </Badge>
        </Card>

        {/* Weekly overview */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-text-secondary">This week</p>
              <h3 className="mt-1 text-[16px] font-semibold text-text">Calorie intake</h3>
            </div>
            <Badge tone="default">Avg 2,103 kcal</Badge>
          </div>
          <div className="mt-6">
            <BarChart
              data={weeklyCalories.map((d) => ({ ...d, highlight: d.label === "Tue" }))}
              color="var(--color-primary)"
              highlightColor="var(--color-primary)"
              formatValue={(v) => `${v.toLocaleString()} kcal`}
            />
          </div>
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
