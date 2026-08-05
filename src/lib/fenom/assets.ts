// ============================================================
// Mascot asset resolution. The real Fenom penguin artwork is supplied later.
// Until then every lookup returns null and the <Mascot> component falls back
// to a neutral placeholder container — no invented character, no emoji.
//
// TO ADD ARTWORK LATER (no architecture change needed):
//   1. Drop files under /public/mascot/… (or import modules).
//   2. Register them in STATE_ASSETS / ITEM_ASSETS below by key.
// The component supports PNG, SVG and (later) animated/Rive assets — it only
// needs a resolvable URL or element from these maps.
// ============================================================

import type { MascotState } from "./types";

// e.g. { idle: "/mascot/idle.png", happy: "/mascot/happy.png" }
const STATE_ASSETS: Partial<Record<MascotState, string>> = {};

// Keyed by an item's asset_key, e.g. { "clothing/hoodie": "/mascot/items/hoodie.png" }
const ITEM_ASSETS: Record<string, string> = {};

export function mascotStateAsset(state: MascotState): string | null {
  return STATE_ASSETS[state] ?? null;
}

export function itemAsset(assetKey: string): string | null {
  return ITEM_ASSETS[assetKey] ?? null;
}

// True once real base artwork exists — lets the UI adapt without hardcoding.
export const HAS_MASCOT_ART = Object.keys(STATE_ASSETS).length > 0;
