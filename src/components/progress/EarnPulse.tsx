"use client";

import { AnimatePresence, motion } from "motion/react";
import { CoinIcon } from "./CoinIcon";
import { useProgress } from "./ProgressProvider";

// Subtle "+XP / +coins" fly-up shown when the user earns from an action.
// Re-mounts on every new earn event (keyed by fx.id) and fades itself out.
export function EarnPulse() {
  const { fx } = useProgress();
  return (
    <AnimatePresence>
      {fx && (
        <motion.div
          key={fx.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: [0, 1, 1, 0], y: -34 }}
          transition={{ duration: 1.8, times: [0, 0.15, 0.7, 1], ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-0 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap"
        >
          {fx.xp > 0 && <span className="rounded-full bg-accent-soft px-2.5 py-1 text-[12.5px] font-bold text-accent">+{fx.xp} XP</span>}
          {fx.coins > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-[12.5px] font-bold text-text shadow-[var(--shadow-sm)]">
              <CoinIcon size={13} /> +{fx.coins}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
