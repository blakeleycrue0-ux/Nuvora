"use client";

import { useState } from "react";
import { Flame, Search, ScanLine, Plus, Sparkles, UtensilsCrossed } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Meter } from "@/components/ui/Meter";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { Modal } from "@/components/ui/Modal";
import { today, meals } from "@/lib/mock-data";

const foodResults = [
  { name: "Chicken Breast, grilled", brand: "Generic", calories: 165, serving: "100g" },
  { name: "Greek Yogurt, plain", brand: "Fage", calories: 100, serving: "170g" },
  { name: "Brown Rice, cooked", brand: "Generic", calories: 216, serving: "1 cup" },
  { name: "Avocado", brand: "Generic", calories: 234, serving: "1 medium" },
  { name: "Whey Protein Isolate", brand: "Optimum Nutrition", calories: 120, serving: "1 scoop" },
];

const aiMeals = [
  { name: "High-protein power bowl", calories: 540, tag: "Hits your protein goal" },
  { name: "Grilled salmon & greens", calories: 480, tag: "Omega-3 rich" },
  { name: "Overnight oats & berries", calories: 360, tag: "Great for tomorrow's breakfast" },
];

export default function NutritionPage() {
  const [scanOpen, setScanOpen] = useState(false);
  const [query, setQuery] = useState("");

  const macros = [
    { label: "Protein", ...today.protein, color: "var(--chart-1)" },
    { label: "Carbs", ...today.carbs, color: "var(--chart-4)" },
    { label: "Fat", ...today.fat, color: "var(--chart-5)" },
  ];

  const filteredFoods = foodResults.filter((f) =>
    f.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <AppShell>
      <PageHeader
        title="Nutrition"
        subtitle={today.date}
        action={
          <Button size="sm" variant="secondary" onClick={() => setScanOpen(true)} className="hidden sm:inline-flex">
            <ScanLine size={15} />
            Scan Barcode
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 px-4 sm:px-6 lg:grid-cols-3 lg:px-10">
        {/* Summary */}
        <Card className="flex flex-col gap-6 p-6 lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[13px] text-text-secondary">Calories consumed</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-[30px] font-semibold tabular-nums leading-none text-text">
                  {today.calories.consumed.toLocaleString()}
                </span>
                <span className="text-[13px] text-text-muted">/ {today.calories.goal.toLocaleString()} kcal</span>
              </div>
            </div>
            <ProgressRing value={today.calories.consumed} max={today.calories.goal} size={78} strokeWidth={8}>
              <Flame size={18} className="text-primary" />
            </ProgressRing>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {macros.map((m) => (
              <div key={m.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[12px]">
                  <span className="text-text-secondary">{m.label}</span>
                  <span className="tabular-nums text-text-muted">{m.value}/{m.goal}g</span>
                </div>
                <Meter value={m.value} max={m.goal} color={m.color} />
              </div>
            ))}
          </div>

          <div className="flex gap-2 sm:hidden">
            <Button size="sm" variant="secondary" onClick={() => setScanOpen(true)} className="flex-1">
              <ScanLine size={15} />
              Scan
            </Button>
          </div>
        </Card>

        {/* AI meal suggestions */}
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft">
              <Sparkles size={16} className="text-primary" />
            </span>
            <h3 className="text-[15px] font-semibold text-text">AI meal suggestions</h3>
          </div>
          <div className="flex flex-col gap-2.5">
            {aiMeals.map((meal) => (
              <div key={meal.name} className="rounded-xl border border-border bg-bg-elevated p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-text">{meal.name}</p>
                  <span className="text-[12px] tabular-nums text-text-muted">{meal.calories} kcal</span>
                </div>
                <p className="mt-1 text-[11.5px] text-text-secondary">{meal.tag}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Meal planner */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-text">Today&apos;s meals</h3>
            <Button size="sm" variant="ghost">
              <Plus size={15} />
              Add meal
            </Button>
          </div>
          <div className="mt-4 flex flex-col divide-y divide-border">
            {meals.map((meal) => (
              <div key={meal.name} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
                    <UtensilsCrossed size={16} className="text-text-secondary" />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-medium text-text">{meal.name}</p>
                    <p className="text-[12px] text-text-muted">
                      {meal.items.length ? meal.items.join(", ") : "Not logged yet"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {meal.calories > 0 && (
                    <span className="text-[13px] tabular-nums text-text-secondary">{meal.calories} kcal</span>
                  )}
                  <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-white/20 hover:text-text">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Food search */}
        <Card className="flex flex-col gap-4 p-6">
          <h3 className="text-[15px] font-semibold text-text">Food search</h3>
          <div className="relative">
            <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              placeholder="Search foods..."
              className="pl-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex flex-col divide-y divide-border">
            {filteredFoods.map((food) => (
              <div key={food.name} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-medium text-text">{food.name}</p>
                  <p className="text-[11.5px] text-text-muted">{food.brand} &middot; {food.serving}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5">
                  <span className="text-[12px] tabular-nums text-text-secondary">{food.calories} kcal</span>
                  <button className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-white/20 hover:text-text">
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={scanOpen} onClose={() => setScanOpen(false)} title="Scan Barcode">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex aspect-square w-full items-center justify-center rounded-2xl border border-dashed border-border bg-bg">
            <ScanLine size={32} className="text-text-muted" />
            {["-top-px -left-px rounded-tl-2xl border-t-2 border-l-2", "-top-px -right-px rounded-tr-2xl border-t-2 border-r-2", "-bottom-px -left-px rounded-bl-2xl border-b-2 border-l-2", "-bottom-px -right-px rounded-br-2xl border-b-2 border-r-2"].map(
              (pos, i) => (
                <span key={i} className={`absolute h-6 w-6 border-primary ${pos}`} />
              ),
            )}
          </div>
          <p className="text-center text-[13px] text-text-secondary">
            Point your camera at a barcode to instantly log a food item. Barcode scanning is coming soon.
          </p>
          <Button variant="secondary" className="w-full" onClick={() => setScanOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>
    </AppShell>
  );
}
