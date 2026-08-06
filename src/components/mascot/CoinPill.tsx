"use client";

import Link from "next/link";
import { Coins } from "lucide-react";
import { useMascot } from "@/components/mascot/MascotProvider";

// Compact Fenom Coins balance for the app top bar. Tapping opens the mascot
// hub (where coins are earned/spent). Hidden until the mascot data is ready.
export function CoinPill() {
  const { ready, balance } = useMascot();
  if (!ready) return null;
  return (
    <Link href="/mascot"
      aria-label={`${balance} Fenom Coins`}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1.5 text-[13px] font-semibold text-text transition-colors hover:border-border-strong">
      <Coins size={14} className="text-amber-500" /> {balance}
    </Link>
  );
}
