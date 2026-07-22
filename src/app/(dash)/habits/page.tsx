"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Plus, Search, MoreHorizontal, Pencil, Copy, Archive, ArchiveRestore, Trash2,
  Flame, ListChecks, Target, Check,
} from "lucide-react";
import type { Habit } from "@/lib/momentum/types";
import { useHabits } from "@/lib/momentum/store";
import { currentStreak, longestStreak, completionRate, isScheduled, isComplete } from "@/lib/momentum/stats";
import { todayISO } from "@/lib/momentum/date";
import { HabitFormModal } from "@/components/habits/HabitFormModal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { HabitIcon, colorValue } from "@/lib/icons";
import { cn } from "@/lib/utils";

type Filter = "active" | "today" | "archived";

const freqLabel = (h: Habit): string => {
  switch (h.frequency.type) {
    case "daily": return "Daily";
    case "weekly": return `${h.frequency.days.length}× / week`;
    case "monthly": return "Monthly";
    case "custom": return `${h.frequency.timesPerWeek}× / week`;
  }
};

export default function HabitsPage() {
  const { habits, ready } = useHabits();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("active");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const today = todayISO();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return habits
      .filter((h) => {
        if (filter === "archived") return h.archived;
        if (h.archived) return false;
        if (filter === "today") return isScheduled(h, today);
        return true;
      })
      .filter((h) => !q || h.name.toLowerCase().includes(q) || h.category.toLowerCase().includes(q) || h.tags.some((t) => t.toLowerCase().includes(q)))
      .sort((a, b) => a.order - b.order);
  }, [habits, query, filter, today]);

  const counts = useMemo(() => ({
    active: habits.filter((h) => !h.archived).length,
    today: habits.filter((h) => !h.archived && isScheduled(h, today)).length,
    archived: habits.filter((h) => h.archived).length,
  }), [habits, today]);

  const openNew = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (h: Habit) => { setEditing(h); setModalOpen(true); };

  return (
    <div className="container-page py-7 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-text sm:text-[30px]">Habits</h1>
          <p className="mt-1 text-[14px] text-text-secondary">Create, edit, and organize the routines that move you forward.</p>
        </div>
        <Button onClick={openNew} className="w-full sm:w-auto"><Plus size={17} /> New habit</Button>
      </div>

      {/* Controls */}
      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-border bg-surface p-1">
          {(["active", "today", "archived"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "relative rounded-lg px-3.5 py-1.5 text-[13px] font-medium capitalize transition-colors",
                filter === f ? "text-accent-ink" : "text-text-secondary hover:text-text",
              )}
            >
              {filter === f && <motion.span layoutId="habit-filter" className="absolute inset-0 rounded-lg accent-gradient" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
              <span className="relative z-10">{f} <span className="opacity-70">{counts[f]}</span></span>
            </button>
          ))}
        </div>
        <div className="relative sm:w-72">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input placeholder="Search habits, tags…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Grid */}
      {!ready ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 animate-pulse rounded-3xl bg-surface-2" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border py-20 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><ListChecks size={26} /></span>
          <div>
            <p className="text-[16px] font-semibold text-text">
              {query ? "No habits match your search" : filter === "archived" ? "No archived habits" : "No habits yet"}
            </p>
            <p className="mt-1 text-[13.5px] text-text-muted">
              {query ? "Try a different keyword." : "Create your first habit and start your streak today."}
            </p>
          </div>
          {!query && filter !== "archived" && <Button onClick={openNew}><Plus size={16} /> Create habit</Button>}
        </div>
      ) : (
        <motion.div layout className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((h) => (
              <HabitCard key={h.id} habit={h} today={today} onEdit={() => openEdit(h)} />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <HabitFormModal open={modalOpen} onClose={() => setModalOpen(false)} editing={editing} />
    </div>
  );
}

function HabitCard({ habit, today, onEdit }: { habit: Habit; today: string; onEdit: () => void }) {
  const { completions, deleteHabit, archiveHabit, duplicateHabit, incrementCompletion } = useHabits();
  const [menu, setMenu] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const color = colorValue(habit.color);
  const streak = currentStreak(habit, completions);
  const longest = longestStreak(habit, completions);
  const rate = completionRate(habit, completions, 30);
  const scheduledToday = isScheduled(habit, today);
  const done = isComplete(habit, completions, today);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn("group relative flex flex-col rounded-3xl border bg-surface p-5 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]", habit.archived && "opacity-70")}
    >
      <div className="flex items-start justify-between">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: `color-mix(in oklab, ${color} 15%, transparent)`, color }}>
          <HabitIcon name={habit.icon} size={22} />
        </span>
        <div className="relative">
          <button
            onClick={() => setMenu((v) => !v)}
            onBlur={() => setTimeout(() => setMenu(false), 150)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-text"
            aria-label="Options"
          >
            <MoreHorizontal size={18} />
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-2xl border border-border bg-elevated p-1.5 shadow-[var(--shadow-lg)]"
              >
                <MenuItem icon={Pencil} label="Edit" onClick={onEdit} />
                <MenuItem icon={Copy} label="Duplicate" onClick={() => duplicateHabit(habit.id)} />
                <MenuItem
                  icon={habit.archived ? ArchiveRestore : Archive}
                  label={habit.archived ? "Unarchive" : "Archive"}
                  onClick={() => archiveHabit(habit.id, !habit.archived)}
                />
                <MenuItem icon={Trash2} label="Delete" danger onClick={() => setConfirmDelete(true)} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <h3 className="mt-4 text-[16px] font-semibold text-text">{habit.name}</h3>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-text-muted">
        <span>{habit.category}</span>
        <span className="h-1 w-1 rounded-full bg-border-strong" />
        <span>{freqLabel(habit)}</span>
        <span className="h-1 w-1 rounded-full bg-border-strong" />
        <span className="capitalize">{habit.difficulty}</span>
      </div>

      {habit.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {habit.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-text-secondary">#{t}</span>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
        <Stat icon={Flame} value={streak} label="streak" color="var(--c-amber)" />
        <Stat icon={Target} value={longest} label="best" color="var(--c-fuchsia)" />
        <Stat icon={ListChecks} value={`${rate}%`} label="30d" color="var(--c-emerald)" />
      </div>

      {!habit.archived && scheduledToday && (
        <button
          onClick={() => incrementCompletion(habit.id, today, 1)}
          className={cn(
            "mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-xl text-[13px] font-medium transition-all active:scale-[0.98]",
            done ? "text-accent-ink" : "border border-border text-text-secondary hover:border-border-strong hover:text-text",
          )}
          style={done ? { background: color } : undefined}
        >
          {done ? <><Check size={15} strokeWidth={2.6} /> Done today</> : "Mark complete"}
        </button>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 rounded-3xl bg-surface/95 p-5 text-center backdrop-blur-sm"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-danger-soft text-danger"><Trash2 size={20} /></span>
            <p className="text-[14px] font-semibold text-text">Delete &ldquo;{habit.name}&rdquo;?</p>
            <p className="-mt-1 text-[12.5px] text-text-muted">This also removes its history. Can&apos;t be undone.</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="danger" size="sm" onClick={() => deleteHabit(habit.id)}>Delete</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Stat({ icon: Icon, value, label, color }: { icon: typeof Flame; value: number | string; label: string; color: string }) {
  return (
    <div className="text-center">
      <Icon size={15} className="mx-auto" style={{ color }} />
      <p className="mt-1 text-[15px] font-bold leading-none text-text">{value}</p>
      <p className="mt-0.5 text-[10.5px] text-text-muted">{label}</p>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: typeof Pencil; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
        danger ? "text-danger hover:bg-danger-soft" : "text-text-secondary hover:bg-surface-2 hover:text-text",
      )}
    >
      <Icon size={15} /> {label}
    </button>
  );
}
