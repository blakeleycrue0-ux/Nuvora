"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Users, Flame, ArrowRight } from "lucide-react";
import { myMemberGroups, groupHabits, myGroupCompletions, streakFor, type TeamGroup } from "@/lib/teams";
import { todayISO, lastNDays } from "@/lib/momentum/date";

// Compact "your team" summary shown on the personal dashboard when the user
// belongs to a group. Renders nothing for non-members.
export function TeamCard() {
  const [group, setGroup] = useState<TeamGroup | null>(null);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const gs = await myMemberGroups();
      if (!active) return;
      const g = gs[0] ?? null;
      setGroup(g);
      if (g) {
        const [h, c] = await Promise.all([groupHabits(g.id), myGroupCompletions(g.id, lastNDays(21)[0])]);
        if (!active) return;
        const today = todayISO();
        setTotal(h.length);
        setDone(c.filter((x) => x.date === today).length);
        setStreak(streakFor(new Set(c.map((x) => x.date))));
      }
      setReady(true);
    })();
    return () => { active = false; };
  }, []);

  if (!ready || !group) return null;

  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
      <Link href="/team" className="group block overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-colors hover:border-border-strong">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Users size={22} /></span>
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium text-text-muted">Tu equipo</p>
            <p className="truncate text-[16px] font-semibold text-text">{group.name}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[13px] font-semibold text-text"><Flame size={14} className="text-accent" /> {streak}</div>
          <ArrowRight size={18} className="text-text-muted transition-transform group-hover:translate-x-0.5" />
        </div>
        <div className="mt-4 flex items-center justify-between text-[12.5px] text-text-secondary"><span>Hoy</span><span>{done} de {total} hábitos</span></div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full accent-gradient" style={{ width: `${pct}%` }} /></div>
      </Link>
    </motion.div>
  );
}
