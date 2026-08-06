"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Coins, Sparkles, ArrowRight } from "lucide-react";
import { Mascot } from "@/components/mascot/Mascot";
import { useMascot } from "@/components/mascot/MascotProvider";
import { levelFromXP } from "@/lib/fenom/economy";
import { ITEM_SLOTS } from "@/lib/fenom/types";
import { useHabits } from "@/lib/momentum/store";

// Home-screen companion card: shows the mascot reacting to recent activity,
// the current level/XP and coin balance, and links into the mascot hub.
export function MascotDashboardCard() {
  const { ready, name, level, balance, reaction, mascot, catalog } = useMascot();
  const { xp } = useHabits();
  const lv = levelFromXP(xp);

  const layers = useMemo(() => {
    const byId = new Map(catalog.map((c) => [c.id, c.assetKey]));
    return ITEM_SLOTS.map((s) => mascot?.equipped?.[s]).filter(Boolean).map((id) => byId.get(id as string)).filter(Boolean) as string[];
  }, [catalog, mascot]);

  if (!ready) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-5">
      <Link href="/mascot" className="group block overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] transition-colors hover:border-border-strong">
        <div className="flex items-center gap-4">
          <Mascot state={reaction.state} animation={reaction.animation} layers={layers} name={name} size={72} />
          <div className="min-w-0 flex-1">
            <p className="text-[12.5px] font-medium text-text-muted">Tu compañero</p>
            <p className="truncate text-[16px] font-semibold text-text">{name}</p>
            <p className="mt-0.5 flex items-center gap-3 text-[12.5px] text-text-secondary">
              <span className="inline-flex items-center gap-1"><Sparkles size={12} className="text-accent" /> Nivel {level}</span>
              <span className="inline-flex items-center gap-1"><Coins size={12} className="text-amber-500" /> {balance}</span>
            </p>
          </div>
          <ArrowRight size={18} className="text-text-muted transition-transform group-hover:translate-x-0.5" />
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full accent-gradient" style={{ width: `${lv.pct}%` }} /></div>
      </Link>
    </motion.div>
  );
}
