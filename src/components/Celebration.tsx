"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Award, Sparkles, ChevronsUp } from "lucide-react";
import { ACHIEVEMENT_ICONS } from "@/lib/icons";
import { useConfetti } from "@/components/Confetti";

// --- Sound & haptics ---------------------------------------------------------
let audioCtx: AudioContext | null = null;
function playTones(freqs: number[], duration = 0.45, type: OscillatorType = "sine", gain = 0.06) {
  if (typeof window === "undefined") return;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    audioCtx = audioCtx ?? new Ctor();
    const ctx = audioCtx;
    if (ctx.state === "suspended") void ctx.resume();
    freqs.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.value = f;
      const t0 = ctx.currentTime + i * 0.09;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(t0);
      o.stop(t0 + duration + 0.02);
    });
  } catch {
    /* audio unavailable */
  }
}

function haptic(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern); // no-op on iOS Safari; works on Android/native
  } catch {
    /* ignore */
  }
}

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
  celebrateLevelUp: (level: number, title: string) => void;
}

const CelebrationContext = createContext<CelebrationValue>({
  celebrateXP: () => {},
  celebrateAchievement: () => {},
  celebrateLevelUp: () => {},
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
  const [levelUp, setLevelUp] = useState<{ level: number; title: string } | null>(null);
  const current = queue[0] ?? null;

  const celebrateXP = useCallback((amount: number, x?: number, y?: number) => {
    if (!amount || amount <= 0 || typeof window === "undefined") return;
    const id = ++seq;
    const px = x ?? window.innerWidth / 2;
    const py = y ?? window.innerHeight / 2;
    setPops((p) => [...p, { id, amount, x: px, y: py }]);
    playTones([680], 0.16, "triangle", 0.045);
    haptic(12);
    window.setTimeout(() => setPops((p) => p.filter((o) => o.id !== id)), 1200);
  }, []);

  const celebrateAchievement = useCallback((a: CelebAchievement) => {
    setQueue((q) => [...q, a]);
  }, []);

  const celebrateLevelUp = useCallback((level: number, title: string) => {
    setLevelUp({ level, title });
  }, []);

  // Confetti + chime when an achievement modal appears.
  useEffect(() => {
    if (!current || typeof window === "undefined") return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.4;
    fire(cx, cy);
    playTones([523.25, 659.25, 783.99], 0.5, "sine", 0.06);
    haptic([20, 40, 30]);
    const t1 = window.setTimeout(() => fire(cx - 90, cy + 20), 220);
    const t2 = window.setTimeout(() => fire(cx + 90, cy + 20), 460);
    const auto = window.setTimeout(() => setQueue((q) => q.slice(1)), 4500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(auto);
    };
  }, [current, fire]);

  // Big celebration when the user levels up.
  useEffect(() => {
    if (!levelUp || typeof window === "undefined") return;
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight * 0.42;
    fire(cx, cy);
    playTones([523.25, 659.25, 783.99, 1046.5], 0.6, "sine", 0.07);
    haptic([30, 50, 30, 50, 70]);
    const t1 = window.setTimeout(() => fire(cx - 110, cy), 200);
    const t2 = window.setTimeout(() => fire(cx + 110, cy), 400);
    const t3 = window.setTimeout(() => fire(cx, cy - 30), 650);
    const auto = window.setTimeout(() => setLevelUp(null), 4800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(auto);
    };
  }, [levelUp, fire]);

  const value = useMemo(
    () => ({ celebrateXP, celebrateAchievement, celebrateLevelUp }),
    [celebrateXP, celebrateAchievement, celebrateLevelUp],
  );

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

      {/* Level-up overlay */}
      <AnimatePresence>
        {levelUp && <LevelUpCard key={levelUp.level} level={levelUp.level} title={levelUp.title} onClose={() => setLevelUp(null)} />}
      </AnimatePresence>
    </CelebrationContext.Provider>
  );
}

function LevelUpCard({ level, title, onClose }: { level: number; title: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[130] flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      {/* radiating light beams */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute h-[520px] w-[520px] rounded-full"
        style={{ background: "conic-gradient(from 0deg, transparent, color-mix(in oklab, var(--accent) 40%, transparent), transparent, color-mix(in oklab, var(--accent) 40%, transparent), transparent)" }}
        initial={{ opacity: 0, rotate: 0, scale: 0.6 }}
        animate={{ opacity: 0.5, rotate: 360, scale: 1 }}
        transition={{ opacity: { duration: 0.5 }, rotate: { duration: 12, repeat: Infinity, ease: "linear" }, scale: { duration: 0.6 } }}
      />
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.7, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className="relative flex flex-col items-center text-center"
      >
        <motion.p
          initial={{ letterSpacing: "0.05em", opacity: 0, y: 10 }}
          animate={{ letterSpacing: "0.35em", opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-[13px] font-bold uppercase text-accent"
        >
          Level Up
        </motion.p>

        <motion.div
          initial={{ scale: 0.4, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.1 }}
          className="relative mt-4 flex h-40 w-40 items-center justify-center"
        >
          <motion.span aria-hidden className="absolute inset-0 rounded-full accent-gradient opacity-30 blur-2xl"
            animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} />
          <div className="relative flex h-36 w-36 flex-col items-center justify-center rounded-full accent-gradient text-accent-ink shadow-[var(--shadow-glow)]">
            <ChevronsUp size={22} className="mb-1 opacity-80" />
            <span className="text-[46px] font-bold leading-none">{level}</span>
          </div>
        </motion.div>

        <h2 className="mt-6 text-[26px] font-semibold tracking-[-0.02em] text-white">{title}</h2>
        <p className="mt-1 text-[14px] text-white/70">You reached level {level}</p>

        <button onClick={onClose} className="mt-7 inline-flex h-11 items-center justify-center rounded-xl bg-white px-8 text-[14px] font-semibold text-black transition-transform hover:scale-[1.03]">
          Continue
        </button>
      </motion.div>
    </motion.div>
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
