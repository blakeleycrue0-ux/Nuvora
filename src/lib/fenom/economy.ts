// ============================================================
// Economy helpers. Coin BALANCE is server-authoritative: it is the sum of the
// user's `coin_transactions` ledger (earnings inserted idempotently, spends
// only via the purchase RPC). These helpers are pure and side-effect free.
// ============================================================

import { levelFromXP } from "@/lib/momentum/stats";
import { COIN_SOURCES, STREAK_MILESTONES } from "./config";
import type { CoinTransaction } from "./types";

export { levelFromXP };

// Net coin balance from the ledger.
export function balanceOf(transactions: CoinTransaction[]): number {
  return transactions.reduce((sum, t) => sum + t.amount, 0);
}

// Total earned vs spent (for the wallet summary).
export function earnedSpent(transactions: CoinTransaction[]): { earned: number; spent: number } {
  let earned = 0, spent = 0;
  for (const t of transactions) {
    if (t.amount >= 0) earned += t.amount;
    else spent += -t.amount;
  }
  return { earned, spent };
}

// The largest streak milestone reached (for messaging / bonus refs).
export function reachedMilestone(streak: number): number | null {
  let best: number | null = null;
  for (const m of STREAK_MILESTONES) if (streak >= m) best = m;
  return best;
}

export function coinsFor(source: keyof typeof COIN_SOURCES): number {
  return COIN_SOURCES[source];
}
