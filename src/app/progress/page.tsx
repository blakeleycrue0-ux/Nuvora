"use client";

import { Camera, Trophy, TrendingUp, Flame, Dumbbell, Lock, LineChart as LineChartIcon, Ruler } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { useProfile } from "@/components/app/ProfileProvider";
import { cn } from "@/lib/utils";
import { achievements } from "@/lib/mock-data";

const weeklySummary = [
  { label: "Weight change", icon: TrendingUp, color: "var(--color-success)" },
  { label: "Workouts", icon: Dumbbell, color: "var(--color-primary)" },
  { label: "Avg calories", icon: Flame, color: "var(--chart-4)" },
  { label: "Avg steps", icon: TrendingUp, color: "var(--chart-2)" },
];

const achievementIcon = { flame: Flame, footprints: TrendingUp, trophy: Trophy, dumbbell: Dumbbell } as const;

export default function ProgressPage() {
  const { profile } = useProfile();
  const currentWeight = profile?.current_weight_kg;
  const targetWeight = profile?.target_weight_kg;

  return (
    <AppShell>
      <PageHeader title="Progress" subtitle="Your trends, all in one place" />

      <div className="grid grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-10">
        {/* Weekly summary */}
        <div className="grid grid-cols-2 gap-4 lg:col-span-3 lg:grid-cols-4">
          {weeklySummary.map((s) => (
            <Card key={s.label} className="flex flex-col gap-3 p-4">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: `color-mix(in oklab, ${s.color} 14%, transparent)` }}
              >
                <s.icon size={15} style={{ color: s.color }} />
              </span>
              <div>
                <p className="text-[19px] font-semibold tabular-nums leading-none text-text-muted">—</p>
                <p className="mt-1 text-[11.5px] text-text-muted">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Weight graph */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] text-text-secondary">Current weight</p>
              {currentWeight ? (
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-[26px] font-semibold tabular-nums text-text">{currentWeight}</span>
                  <span className="text-[13px] text-text-muted">kg</span>
                  {targetWeight && <Badge tone="default">Goal {targetWeight} kg</Badge>}
                </div>
              ) : (
                <p className="mt-1 text-[15px] text-text-muted">Not set yet</p>
              )}
            </div>
          </div>
          <EmptyState
            icon={LineChartIcon}
            title="No weigh-ins logged yet"
            description="Log your weight regularly to see your trend line here."
          />
        </Card>

        {/* Progress photos */}
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-text">Progress photos</h3>
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            {["Front", "Side", "Back"].map((label) => (
              <button
                key={label}
                className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-text-muted transition-colors hover:border-white/20 hover:text-text-secondary"
              >
                <Camera size={18} />
                <span className="text-[11px]">{label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Measurements */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-[15px] font-semibold text-text">Measurements</h3>
          <EmptyState
            icon={Ruler}
            title="No measurements logged yet"
            description="Add your chest, waist, hips and more to track changes over time."
            compact
          />
        </Card>

        {/* Achievements */}
        <Card className="p-6">
          <h3 className="text-[15px] font-semibold text-text">Achievements</h3>
          <div className="mt-4 flex flex-col gap-3">
            {achievements.map((a) => {
              const Icon = achievementIcon[a.icon as keyof typeof achievementIcon];
              return (
                <div key={a.title} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      a.earned ? "bg-warning-soft" : "bg-white/[0.03]",
                    )}
                  >
                    {a.earned ? (
                      <Icon size={16} className="text-warning" />
                    ) : (
                      <Lock size={14} className="text-text-muted" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className={cn("truncate text-[13px] font-medium", a.earned ? "text-text" : "text-text-muted")}>
                      {a.title}
                    </p>
                    <p className="truncate text-[11.5px] text-text-muted">{a.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
