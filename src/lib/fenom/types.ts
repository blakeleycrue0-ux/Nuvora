// ============================================================
// Fenom mascot + economy types.
//
// The mascot is a branded penguin whose real artwork is supplied later.
// Nothing here depends on a specific asset format — assets are referenced
// by a string `assetKey` and resolved at render time (see lib/fenom/assets).
// ============================================================

// Visual/emotional states the mascot can be in. Drives which asset renders.
export type MascotState =
  | "idle" | "happy" | "excited" | "celebrating" | "sad"
  | "sleepy" | "surprised" | "proud" | "motivating" | "reminder";

// Optional short animation played on top of a state.
export type MascotAnimation =
  | "none" | "celebrate" | "bounce" | "wave" | "sleep" | "levelup";

// Equip slots — one item per slot may be equipped at once. Layered on top of
// the base mascot in this z-order: base < clothing < shoes < accessory < headwear.
export type ItemSlot = "clothing" | "accessory" | "headwear" | "shoes";
export const ITEM_SLOTS: ItemSlot[] = ["clothing", "shoes", "accessory", "headwear"];

// Shop categories (grouping for browsing). A category maps to one slot.
export type ItemCategory = "outfits" | "accessories" | "headwear" | "shoes" | "special" | "seasonal";

export type Rarity = "common" | "rare" | "epic" | "legendary";

// Currency is a union so a second currency can be added later without churn.
export type Currency = "coins";

// A shop item. Price/level/rarity live in the DB (mascot_items) so they are
// the single source of truth and can be validated server-side on purchase.
export interface MascotItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  slot: ItemSlot;
  price: number;
  currency: Currency;
  requiredLevel: number;
  rarity: Rarity;
  assetKey: string;      // resolved to real artwork later; may not exist yet
  seasonal: boolean;
  limited: boolean;
  releaseDate?: string;
  free: boolean;         // claimable without spending coins
  active: boolean;
  sort: number;
}

// Item enriched with the current user's state for rendering the shop/closet.
export interface MascotItemView extends MascotItem {
  isOwned: boolean;
  isEquipped: boolean;
  isUnlocked: boolean;   // level requirement met
}

export interface CoinTransaction {
  id: string;
  amount: number;        // positive = earned/granted, negative = spent
  source: string;        // e.g. habit_completed, shop_purchase, welcome_bonus
  ref: string | null;    // idempotency key (habitId:date, item id, …)
  createdAt: string;
}

export interface MascotRecord {
  id: string;
  userId: string;
  name: string;
  equipped: Partial<Record<ItemSlot, string | null>>;
  createdAt: string;
}

// Events that can drive coins, mascot state, messages and rewards.
export type FenomEventType =
  | "HABIT_COMPLETED" | "DAY_COMPLETED" | "LEVEL_UP" | "ACHIEVEMENT_UNLOCKED"
  | "STREAK_STARTED" | "STREAK_MILESTONE" | "STREAK_BROKEN"
  | "ITEM_UNLOCKED" | "ITEM_PURCHASED" | "ITEM_EQUIPPED" | "REMINDER";

export interface FenomEvent {
  type: FenomEventType;
  // Optional context; kept loose so any emitter can attach what it has.
  habitId?: string;
  date?: string;
  level?: number;
  achievementId?: string;
  streak?: number;
  itemId?: string;
}
