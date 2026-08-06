// ============================================================
// Fenom mascot + coins data layer (Supabase). Coin earnings are inserted
// idempotently (unique on user_id+source+ref) and bounded by the DB trigger;
// spends go through the fenom_purchase RPC. All earn calls are best-effort and
// never throw, so they can be fired from anywhere without risking the caller.
// ============================================================

import { supabase } from "@/lib/supabase";
import { COIN_SOURCES } from "./config";
import type {
  CoinTransaction, ItemSlot, MascotItem, MascotItemView, MascotRecord,
} from "./types";

/* ---------- rows → types ---------- */

type ItemRow = {
  id: string; name: string; description: string; category: string; slot: string;
  price: number; required_level: number; rarity: string; asset_key: string;
  seasonal: boolean; limited: boolean; free: boolean; active: boolean; release_date: string | null; sort: number;
};
const toItem = (r: ItemRow): MascotItem => ({
  id: r.id, name: r.name, description: r.description, category: r.category as MascotItem["category"],
  slot: r.slot as ItemSlot, price: r.price, currency: "coins", requiredLevel: r.required_level,
  rarity: r.rarity as MascotItem["rarity"], assetKey: r.asset_key, seasonal: r.seasonal,
  limited: r.limited, free: r.free, active: r.active, releaseDate: r.release_date ?? undefined, sort: r.sort,
});

type TxnRow = { id: string; amount: number; source: string; ref: string | null; created_at: string };
const toTxn = (r: TxnRow): CoinTransaction => ({ id: r.id, amount: r.amount, source: r.source, ref: r.ref, createdAt: r.created_at });

type MascotRow = { id: string; user_id: string; name: string; equipped: Record<string, string | null> | null; created_at: string };
const toMascot = (r: MascotRow): MascotRecord => ({ id: r.id, userId: r.user_id, name: r.name, equipped: (r.equipped ?? {}) as MascotRecord["equipped"], createdAt: r.created_at });

/* ---------- reads ---------- */

export async function getCatalog(): Promise<MascotItem[]> {
  const { data, error } = await supabase.from("mascot_items").select("*").eq("active", true).order("sort");
  if (error || !data) return [];
  return (data as ItemRow[]).map(toItem);
}

export async function getMascot(): Promise<MascotRecord | null> {
  const { data, error } = await supabase.from("mascots").select("*").maybeSingle();
  if (error || !data) return null;
  return toMascot(data as MascotRow);
}

export async function getInventory(): Promise<Set<string>> {
  const { data, error } = await supabase.from("mascot_inventory").select("item_id");
  if (error || !data) return new Set();
  return new Set((data as { item_id: string }[]).map((r) => r.item_id));
}

export async function getTransactions(): Promise<CoinTransaction[]> {
  const { data, error } = await supabase.from("coin_transactions").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as TxnRow[]).map(toTxn);
}

/* ---------- writes ---------- */

export async function ensureMascot(name?: string): Promise<void> {
  await supabase.rpc("fenom_ensure_mascot", { p_name: name ?? "Fen" });
}

export async function setMascotName(name: string): Promise<void> {
  const { error } = await supabase.from("mascots").update({ name: name.trim() || "Fen" }).eq("user_id", (await supabase.auth.getUser()).data.user?.id ?? "");
  if (error) throw new Error(error.message);
}

export async function setEquipped(equipped: Partial<Record<ItemSlot, string | null>>): Promise<void> {
  const uid = (await supabase.auth.getUser()).data.user?.id;
  if (!uid) throw new Error("No has iniciado sesión.");
  const { error } = await supabase.from("mascots").update({ equipped }).eq("user_id", uid);
  if (error) throw new Error(error.message);
}

export async function purchaseItem(itemId: string): Promise<number> {
  const { data, error } = await supabase.rpc("fenom_purchase", { p_item: itemId });
  if (error) throw new Error(mapPurchaseError(error.message));
  return Number((data as { balance?: number } | null)?.balance ?? 0);
}

export async function claimFreeItem(itemId: string): Promise<void> {
  const { error } = await supabase.rpc("fenom_claim_free", { p_item: itemId });
  if (error) throw new Error(mapPurchaseError(error.message));
}

function mapPurchaseError(msg: string): string {
  if (msg.includes("insufficient_coins")) return "No tienes suficientes Fenom Coins.";
  if (msg.includes("already_owned")) return "Ya tienes este artículo.";
  if (msg.includes("item_unavailable")) return "Este artículo no está disponible.";
  return msg;
}

/* ---------- coin earning (best-effort, idempotent) ---------- */

// Fire-and-forget helper: an earn insert must never surface an error to the
// caller (a duplicate simply means it was already awarded).
function award(source: keyof typeof COIN_SOURCES, ref: string): void {
  void (async () => {
    try {
      const uid = (await supabase.auth.getUser()).data.user?.id;
      if (!uid) return;
      await supabase.from("coin_transactions").insert({ user_id: uid, amount: COIN_SOURCES[source], source, ref });
    } catch { /* idempotency conflict or offline — safe to ignore */ }
  })();
}

export const awardHabitCompletion = (habitId: string, date: string) => award("habit_completed", `${habitId}:${date}`);
export const awardDayCompleted = (date: string) => award("day_completed", date);
export const awardLevelUp = (level: number) => award("level_up", `lvl:${level}`);
export const awardAchievement = (id: string) => award("achievement_unlocked", `ach:${id}`);
export const awardStreakMilestone = (milestone: number, habitId: string) => award("streak_milestone", `streak:${habitId}:${milestone}`);

/* ---------- view builder ---------- */

// Merge catalog + ownership + equipped + level into render-ready items.
export function buildItemViews(
  catalog: MascotItem[],
  owned: Set<string>,
  equipped: Partial<Record<ItemSlot, string | null>>,
  level: number,
): MascotItemView[] {
  return catalog.map((it) => ({
    ...it,
    isOwned: owned.has(it.id),
    isEquipped: equipped[it.slot] === it.id,
    isUnlocked: level >= it.requiredLevel,
  }));
}
