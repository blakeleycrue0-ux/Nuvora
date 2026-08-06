"use client";

import { motion } from "motion/react";
import { CoinIcon } from "./CoinIcon";
import { useProgress } from "./ProgressProvider";
import { cn } from "@/lib/utils";

// Clean Fenom Coins balance pill. The number gently pops when it changes.
export function CoinBalance({ className }: { className?: string }) {
  const { coins, ready } = useProgress();
  if (!ready) return null;
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[14px] font-semibold text-text shadow-[var(--shadow-sm)]", className)}>
      <CoinIcon size={18} />
      <motion.span key={coins} initial={{ scale: 1.25 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
        {coins.toLocaleString()}
      </motion.span>
    </span>
  );
}
