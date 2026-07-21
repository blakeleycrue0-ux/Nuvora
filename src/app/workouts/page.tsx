"use client";

import { useMemo, useState } from "react";
import { Dumbbell, Search, Trophy, Clock, Flame, ChevronRight, Check } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
  exerciseLibrary,
  todayWorkout,
  personalRecords,
  workoutHistory,
} from "@/lib/mock-data";

const tabs = ["Today", "Library", "History", "Records"] as const;
type Tab = (typeof tabs)[number];

const muscleColors: Record<string, string> = {
  Chest: "var(--chart-1)",
  Back: "var(--chart-2)",
  Shoulders: "var(--chart-4)",
  Legs: "var(--chart-6)",
  Arms: "var(--chart-5)",
  Core: "var(--chart-7)",
};

export default function WorkoutsPage() {
  const [tab, setTab] = useState<Tab>("Today");
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<string>("All");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const muscles = ["All", ...Array.from(new Set(exerciseLibrary.map((e) => e.muscle)))];

  const filtered = useMemo(
    () =>
      exerciseLibrary.filter(
        (e) =>
          (muscle === "All" || e.muscle === muscle) &&
          e.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, muscle],
  );

  return (
    <AppShell>
      <PageHeader
        title="Workouts"
        subtitle="Build, log and track every session"
        action={
          <Button size="sm" variant="primary" className="hidden sm:inline-flex">
            New Workout
          </Button>
        }
      />

      <div className="px-4 sm:px-6 lg:px-10">
        <div className="inline-flex gap-1 rounded-full border border-border bg-card p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                tab === t ? "bg-primary text-white" : "text-text-secondary hover:text-text",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "Today" && (
            <div className="flex flex-col gap-4">
              <Card className="flex items-center justify-between gap-4 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft">
                    <Dumbbell size={19} className="text-primary" />
                  </span>
                  <div>
                    <h2 className="text-[16px] font-semibold text-text">{todayWorkout.name}</h2>
                    <p className="text-[12.5px] text-text-secondary">
                      {todayWorkout.exercises.length} exercises &middot; ~52 min
                    </p>
                  </div>
                </div>
                <Button size="sm">Finish</Button>
              </Card>

              {todayWorkout.exercises.map((exercise) => (
                <Card key={exercise.name} className="p-5">
                  <h3 className="text-[14.5px] font-semibold text-text">{exercise.name}</h3>
                  <div className="mt-4 grid max-w-sm grid-cols-[28px_84px_84px_36px] items-center gap-3 text-[11.5px] font-medium text-text-muted">
                    <span>Set</span>
                    <span>Reps</span>
                    <span>Weight</span>
                    <span />
                  </div>
                  <div className="mt-1 flex max-w-sm flex-col divide-y divide-border">
                    {exercise.sets.map((set, i) => {
                      const key = `${exercise.name}-${i}`;
                      const done = checked[key];
                      return (
                        <div
                          key={key}
                          className="grid grid-cols-[28px_84px_84px_36px] items-center gap-3 py-2.5"
                        >
                          <span className="text-[13px] tabular-nums text-text-secondary">{i + 1}</span>
                          <span className="text-[13.5px] tabular-nums text-text">{set.reps} reps</span>
                          <span className="text-[13.5px] tabular-nums text-text">{set.weight} lb</span>
                          <button
                            onClick={() => setChecked((c) => ({ ...c, [key]: !c[key] }))}
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full border transition-colors",
                              done
                                ? "border-success bg-success-soft text-success"
                                : "border-border text-transparent hover:border-text-muted",
                            )}
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === "Library" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <Input
                    placeholder="Search exercises..."
                    className="pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="no-scrollbar flex gap-2 overflow-x-auto">
                  {muscles.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMuscle(m)}
                      className={cn(
                        "shrink-0 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-colors",
                        muscle === m
                          ? "border-primary/40 bg-primary-soft text-primary"
                          : "border-border text-text-secondary hover:text-text",
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((exercise) => (
                  <Card key={exercise.name} interactive className="flex items-center gap-4 p-4">
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                      style={{ background: `color-mix(in oklab, ${muscleColors[exercise.muscle]} 16%, transparent)` }}
                    >
                      <Dumbbell size={17} style={{ color: muscleColors[exercise.muscle] }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13.5px] font-medium text-text">{exercise.name}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <Badge tone="default">{exercise.muscle}</Badge>
                        <span className="text-[11.5px] text-text-muted">{exercise.equipment}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="shrink-0 text-text-muted" />
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tab === "History" && (
            <div className="flex flex-col gap-3">
              {workoutHistory.map((session) => (
                <Card key={session.name + session.date} className="flex items-center justify-between gap-4 p-4">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
                      <Dumbbell size={16} className="text-primary" />
                    </span>
                    <div>
                      <p className="text-[13.5px] font-medium text-text">{session.name}</p>
                      <p className="text-[12px] text-text-muted">{session.date}</p>
                    </div>
                  </div>
                  <div className="hidden items-center gap-5 sm:flex">
                    <div className="flex items-center gap-1.5 text-[12.5px] text-text-secondary">
                      <Clock size={14} className="text-text-muted" />
                      {session.duration} min
                    </div>
                    <div className="flex items-center gap-1.5 text-[12.5px] text-text-secondary">
                      <Flame size={14} className="text-text-muted" />
                      {session.volume.toLocaleString()} lb
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-text-muted" />
                </Card>
              ))}
            </div>
          )}

          {tab === "Records" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {personalRecords.map((pr) => (
                <Card key={pr.exercise} className="flex items-center gap-4 p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning-soft">
                    <Trophy size={18} className="text-warning" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-medium text-text">{pr.exercise}</p>
                    <p className="text-[12.5px] text-text-secondary">
                      {pr.value} <span className="text-text-muted">&middot; {pr.date}</span>
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
