"use client";

import { useState } from "react";
import { Camera, Trophy, TrendingDown, TrendingUp, Flame, Dumbbell, Lock } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LineChart } from "@/components/ui/LineChart";
import { cn } from "@/lib/utils";
import { weightHistory, weightHistoryLong, measurements, achievements, today } from "@/lib/mock-data";

const ranges = ["1M", "3M", "6M"] as const;

const weeklySummary = [
  { label: "Weight change", value: "-8.4 lb", icon: TrendingDown, color: "var(--color-success)" },
  { label: "Workouts", value: "4", icon: Dumbbell, color: "var(--color-primary)" },
  { label: "Avg calories", value: "2,103", icon: Flame, color: "var(--chart-4)" },
  { label: "Avg steps", value: "9,566", icon: TrendingUp, color: "var(--chart-2)" },
];

const achievementIcon = { flame: Flame, footprints: TrendingUp, trophy: Trophy, dumbbell: Dumbbell } as const;

export default function ProgressPage() {
  const [range, setRange] = useState<(typeof ranges)[number]>("3M");
  const data = range === "1M" ? weightHistory : weightHistoryLong;

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
                <p className="text-[19px] font-semibold tabular-nums leading-none text-text">{s.value}</p>
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
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[26px] font-semibold tabular-nums text-text">{today.weight.value}</span>
                <span className="text-[13px] text-text-muted">{today.weight.unit}</span>
                <Badge tone="success">{today.weight.delta} lb</Badge>
              </div>
            </div>
            <div className="inline-flex gap-1 rounded-full border border-border bg-bg-elevated p-1">
              {ranges.map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors",
                    range === r ? "bg-primary text-white" : "text-text-secondary hover:text-text",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6">
            <LineChart data={data} color="var(--color-primary)" formatValue={(v) => `${v} lb`} />
          </div>
        </Card>

        {/* Progress photos */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-semibold text-text">Progress photos</h3>
            <Badge tone="default">Week 8</Badge>
          </div>
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
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {measurements.map((m) => (
              <div key={m.label} className="rounded-xl border border-border bg-bg-elevated p-3.5">
                <p className="text-[11.5px] text-text-muted">{m.label}</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-[17px] font-semibold tabular-nums text-text">{m.value}</span>
                  <span className="text-[11px] text-text-muted">{m.unit}</span>
                </div>
                <span
                  className={cn(
                    "mt-1 inline-block text-[11px] font-medium tabular-nums",
                    m.delta < 0 ? "text-success" : "text-text-secondary",
                  )}
                >
                  {m.delta > 0 ? "+" : ""}
                  {m.delta} this month
                </span>
              </div>
            ))}
          </div>
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
