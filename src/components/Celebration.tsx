"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Award, Sparkles } from "lucide-react";
import { ACHIEVEMENT_ICONS } from "@/lib/icons";
import { useConfetti } from "@/components/Confetti";

export interface CelebAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: "bronze" | "silver" | "gold" | "diamond";
}

interface CelebrationValue {
  celebrateXP: (amount: number, x?: number, y?: number) => void;
  celebrateAchievement: (a: CelebAchievement) => void;
}

const CelebrationContext = createContext<CelebrationValue>({
  celebrateXP: () => {},
  celebrateAchievement: () => {},
});

const TIER_COLORS: Record<string, string> = {
  bronze: "#94a3b0",
  silver: "#c0cad4",
  gold: "#45c68e",
  diamond: "#67b0e0",
};

let seq = 0;

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const { fire } = useConfetti();
  const [pops, setPops] = useState<{ id: number; amount: number; x: number; y: number }[]>([]);
  const [queue, setQueue] = useState<CelebAchievement[]>([]);
  const current = queue[0] ?? null;

  const celebrateXP = useCallback((amount: number, x?: number, y?: number) => {
    if (!amount || amount <= 0 || typeof window === "undefined") return;
    const id = ++seq;
    const px = x ?? window.innerWidth / 2;
    const py = y ?? window.innerHeight / 2;
    setPops((p) => [...p, { id, amount, x: px, y: py }]);
    window.setTimeout(() => setPops((p) => p.filter((o) => o.id !== id)), 1200);
  }, []);

  const celebrateAchievement = useCallback((a: CelebAchievement) => {
    setQueue((q) => [...q, a]);
  }, []);

  // Confetti bursts when an achievement modal appears.
  useEffect(() => {
    if (!current || typeof window === "undefined") return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.4;
    fire(cx, cy);
    const t1 = window.setTimeout(() => fire(cx - 90, cy + 20), 220);
    const t2 = window.setTimeout(() => fire(cx + 90, cy + 20), 460);
    const auto = window.setTimeout(() => setQueue((q) => q.slice(1)), 4500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(auto);
    };
  }, [current, fire]);

  const value = useMemo(() => ({ celebrateXP, celebrateAchievement }), [celebrateXP, celebrateAchievement]);

  return (
    <CelebrationContext.Provider value={value}>
      {children}

      {/* Floating +XP pops */}
      <div className="pointer-events-none fixed inset-0 z-[110] overflow-hidden">
        <AnimatePresence>
          {pops.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.6, x: p.x, y: p.y }}
              animate={{ opacity: 1, scale: 1, y: p.y - 72 }}
              exit={{ opacity: 0, y: p.y - 112 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2"
            >
              <span className="inline-flex items-center gap-1 rounded-full accent-gradient px-3 py-1 text-[13px] font-bold text-accent-ink shadow-[var(--shadow-glow)]">
                <Sparkles size={13} /> +{p.amount} XP
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Achievement unlocked overlay */}
      <AnimatePresence>
        {current && <AchievementCard key={current.id} a={current} onClose={() => setQueue((q) => q.slice(1))} />}
      </AnimatePresence>
    </CelebrationContext.Provider>
  );
}

function AchievementCard({ a, onClose }: { a: CelebAchievement; onClose: () => void }) {
  const Icon = ACHIEVEMENT_ICONS[a.icon] ?? Award;
  const color = TIER_COLORS[a.tier] ?? "#45c68e";
  return (
    <motion.div
      className="fixed inset-0 z-[120] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ scale: 0.8, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-border bg-elevated p-7 text-center shadow-[var(--shadow-lg)]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-44"
          style={{ background: `radial-gradient(circle at 50% 0%, ${color}55, transparent 70%)` }} />

        <p className="relative text-[12px] font-semibold uppercase tracking-[0.18em] text-text-muted">
          Achievement unlocked
        </p>

        <div className="relative mx-auto mt-5 flex h-24 w-24 items-center justify-center">
          <motion.span aria-hidden className="absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(circle, ${color}55, transparent 70%)` }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }} />
          <motion.span
            initial={{ rotate: -14, scale: 0.5 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 11, delay: 0.1 }}
            className="relative flex h-20 w-20 items-center justify-center rounded-full"
            style={{ background: `color-mix(in oklab, ${color} 22%, var(--surface))`, color, boxShadow: `0 0 34px -4px ${color}` }}
          >
            <Icon size={38} />
          </motion.span>
        </div>

        <h3 className="relative mt-5 text-[19px] font-semibold text-text">{a.title}</h3>
        <p className="relative mt-1 text-[13.5px] leading-relaxed text-text-secondary">{a.description}</p>

        <button
          onClick={onClose}
          className="relative mt-6 inline-flex h-11 w-full items-center justify-center rounded-xl accent-gradient text-[14px] font-semibold text-accent-ink"
        >
          Nice!
        </button>
      </motion.div>
    </motion.div>
  );
}

export function useCelebration() {
  return useContext(CelebrationContext);
}
