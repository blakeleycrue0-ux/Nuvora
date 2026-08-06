"use client";

import Link from "next/link";
import { Coins } from "lucide-react";
import { useMascot } from "@/components/mascot/MascotProvider";
import { FEATURE_MASCOT_CUSTOMIZATION } from "@/lib/features";

// Compact Fenom Coins balance for the app top bar. Only shown when the coins /
// customization economy is enabled (hidden in the current fixed-mascot build).
export function CoinPill() {
  const { ready, balance } = useMascot();
  if (!FEATURE_MASCOT_CUSTOMIZATION || !ready) return null;
  return (
    <Link href="/mascot"
      aria-label={`${balance} Fenom Coins`}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1.5 text-[13px] font-semibold text-text transition-colors hover:border-border-strong">
      <Coins size={14} className="text-amber-500" /> {balance}
    </Link>
  );
}
