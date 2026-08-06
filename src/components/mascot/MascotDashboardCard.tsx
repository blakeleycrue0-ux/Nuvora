"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, Flame, ChevronRight } from "lucide-react";
import { Mascot } from "@/components/mascot/Mascot";
import { useMascot } from "@/components/mascot/MascotProvider";
import { levelFromXP } from "@/lib/fenom/economy";
import { overallStats } from "@/lib/momentum/stats";
import { useHabits } from "@/lib/momentum/store";

// Home companion card. Deliberately secondary to the day's habits: a calm,
// clean card that shows the fixed tiger reacting, the current level and best
// streak, linking to the companion page.
export function MascotDashboardCard() {
  const { ready, name, level, reaction } = useMascot();
  const { habits, completions, xp } = useHabits();
  const lv = levelFromXP(xp);
  const { bestCurrentStreak } = overallStats(habits, completions);

  if (!ready) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="mt-5">
      <Link href="/mascot" className="group block overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-all hover:border-border-strong hover:shadow-[var(--shadow-md)]">
        <div className="flex items-center gap-4">
          <Mascot state={reaction.state} animation={reaction.animation} name={name} size={64} />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium text-text-muted">Tu compañero</p>
            <p className="truncate text-[16px] font-semibold text-text">{name}</p>
            <div className="mt-1 flex items-center gap-3 text-[12.5px] text-text-secondary">
              <span className="inline-flex items-center gap-1"><Sparkles size={12} className="text-accent" /> Nivel {level}</span>
              <span className="inline-flex items-center gap-1"><Flame size={12} className="text-accent" /> {bestCurrentStreak} días</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-text-muted transition-transform group-hover:translate-x-0.5" />
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full accent-gradient" style={{ width: `${lv.pct}%` }} /></div>
      </Link>
    </motion.div>
  );
}
