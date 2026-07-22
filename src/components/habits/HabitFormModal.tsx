"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import type { Difficulty, Frequency, Habit, HabitColor } from "@/lib/momentum/types";
import { useHabits } from "@/lib/momentum/store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { HabitIcon, ICON_KEYS, HABIT_COLORS } from "@/lib/icons";
import { cn } from "@/lib/utils";

const CATEGORIES = ["Health", "Fitness", "Mindfulness", "Learning", "Productivity", "Finance", "Creativity", "Social"];
const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const DIFFICULTIES: Difficulty[] = ["easy", "medium", "hard"];

type FreqType = "daily" | "weekly" | "monthly" | "custom";

export function HabitFormModal({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing?: Habit | null;
}) {
  const { addHabit, updateHabit } = useHabits();

  const [name, setName] = useState(editing?.name ?? "");
  const [icon, setIcon] = useState(editing?.icon ?? "target");
  const [color, setColor] = useState<HabitColor>(editing?.color ?? "c-indigo");
  const [category, setCategory] = useState(editing?.category ?? "Health");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [target, setTarget] = useState(editing?.targetPerDay ?? 1);
  const [difficulty, setDifficulty] = useState<Difficulty>(editing?.difficulty ?? "medium");
  const [reminder, setReminder] = useState(editing?.reminder ?? "");
  const [tags, setTags] = useState((editing?.tags ?? []).join(", "));

  const [freqType, setFreqType] = useState<FreqType>(editing?.frequency.type ?? "daily");
  const [weeklyDays, setWeeklyDays] = useState<number[]>(
    editing?.frequency.type === "weekly" ? editing.frequency.days : [1, 3, 5],
  );
  const [timesPerWeek, setTimesPerWeek] = useState(
    editing?.frequency.type === "custom" ? editing.frequency.timesPerWeek : 3,
  );

  const colorVal = HABIT_COLORS.find((c) => c.key === color)!.value;

  const buildFrequency = (): Frequency => {
    if (freqType === "weekly") return { type: "weekly", days: weeklyDays.length ? weeklyDays : [1] };
    if (freqType === "monthly") return { type: "monthly", dates: [1] };
    if (freqType === "custom") return { type: "custom", timesPerWeek };
    return { type: "daily" };
  };

  const submit = () => {
    if (!name.trim()) return;
    const payload = {
      name: name.trim(),
      icon,
      color,
      category,
      notes: notes.trim() || undefined,
      frequency: buildFrequency(),
      targetPerDay: Math.max(1, target),
      difficulty,
      reminder: reminder || undefined,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    if (editing) updateHabit(editing.id, payload);
    else addHabit(payload);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={editing ? "Edit habit" : "New habit"} subtitle="Design a habit you'll actually keep." wide>
      <div className="flex flex-col gap-5">
        {/* Preview + name */}
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: `color-mix(in oklab, ${colorVal} 16%, transparent)`, color: colorVal }}
          >
            <HabitIcon name={icon} size={22} />
          </span>
          <Input placeholder="Habit name (e.g. Morning run)" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>

        {/* Icon picker */}
        <Field label="Icon">
          <div className="no-scrollbar grid max-h-28 grid-cols-9 gap-1.5 overflow-y-auto rounded-xl border border-border bg-surface-2 p-2">
            {ICON_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setIcon(k)}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg transition-colors",
                  icon === k ? "text-white" : "text-text-secondary hover:bg-surface",
                )}
                style={icon === k ? { background: colorVal } : undefined}
              >
                <HabitIcon name={k} size={17} />
              </button>
            ))}
          </div>
        </Field>

        {/* Color */}
        <Field label="Color">
          <div className="flex flex-wrap gap-2">
            {HABIT_COLORS.map((c) => (
              <button
                key={c.key}
                onClick={() => setColor(c.key as HabitColor)}
                className={cn("h-8 w-8 rounded-full transition-transform hover:scale-110", color === c.key && "ring-2 ring-offset-2 ring-offset-surface")}
                style={{ background: c.value, ...(color === c.key ? { boxShadow: `0 0 0 2px ${c.value}` } : {}) }}
                aria-label={c.key}
              />
            ))}
          </div>
        </Field>

        {/* Category */}
        <Field label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
                  category === cat ? "border-transparent text-white accent-gradient" : "border-border text-text-secondary hover:text-text",
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </Field>

        {/* Frequency */}
        <Field label="Frequency">
          <div className="flex flex-wrap gap-2">
            {(["daily", "weekly", "monthly", "custom"] as FreqType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFreqType(f)}
                className={cn(
                  "rounded-xl border px-3.5 py-2 text-[12.5px] font-medium capitalize transition-colors",
                  freqType === f ? "border-accent bg-accent-soft text-accent" : "border-border text-text-secondary hover:text-text",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          {freqType === "weekly" && (
            <div className="mt-3 flex gap-1.5">
              {WEEKDAYS.map((d, i) => {
                const active = weeklyDays.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => setWeeklyDays((prev) => (active ? prev.filter((x) => x !== i) : [...prev, i]))}
                    className={cn(
                      "flex h-9 flex-1 items-center justify-center rounded-lg border text-[12px] font-semibold transition-colors",
                      active ? "border-transparent text-white accent-gradient" : "border-border text-text-secondary",
                    )}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          )}
          {freqType === "custom" && (
            <div className="mt-3 flex items-center gap-3">
              <Stepper value={timesPerWeek} onChange={(v) => setTimesPerWeek(Math.max(1, Math.min(7, v)))} />
              <span className="text-[13px] text-text-secondary">times per week</span>
            </div>
          )}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Times per day">
            <Stepper value={target} onChange={(v) => setTarget(Math.max(1, Math.min(12, v)))} />
          </Field>
          <Field label="Reminder (optional)">
            <Input type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} />
          </Field>
        </div>

        {/* Difficulty */}
        <Field label="Difficulty (higher = more XP)">
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={cn(
                  "flex-1 rounded-xl border px-3 py-2.5 text-[13px] font-medium capitalize transition-colors",
                  difficulty === d ? "border-accent bg-accent-soft text-accent" : "border-border text-text-secondary hover:text-text",
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Tags (comma separated)">
          <Input placeholder="morning, health" value={tags} onChange={(e) => setTags(e.target.value)} />
        </Field>

        <Field label="Notes (optional)">
          <Textarea placeholder="Why does this habit matter to you?" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>

        <div className="flex gap-3 pt-1">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={submit} disabled={!name.trim()}>
            {editing ? "Save changes" : "Create habit"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12.5px] font-semibold text-text-secondary">{label}</span>
      {children}
    </div>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-1">
      <button onClick={() => onChange(value - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text">
        <Minus size={15} />
      </button>
      <span className="w-6 text-center text-[15px] font-semibold tabular-nums text-text">{value}</span>
      <button onClick={() => onChange(value + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-surface hover:text-text">
        <Plus size={15} />
      </button>
    </div>
  );
}
