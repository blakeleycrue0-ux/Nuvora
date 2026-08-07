// ============================================================
// Product-mode feature flags.
//
// Fenom runs the PERSONAL experience (habits, XP, Progress Bubble, ranking)
// AND the Football Clubs / Teams experience together. Nothing about Teams was
// ever deleted — DB tables, RLS, APIs, business logic and UI all stayed in the
// codebase; this flag only controls whether the Teams UI is exposed.
//
// Teams is ON by default now. Set NEXT_PUBLIC_FEATURE_TEAMS="false" to hide it
// again without removing any code.
// ============================================================

export const FEATURE_TEAMS = process.env.NEXT_PUBLIC_FEATURE_TEAMS !== "false";

// Convenience: the personal experience is always on.
export const FEATURE_PERSONAL = true;

// Mascot customization: clothing, shop, equip, inventory and the Fenom Coins
// economy. Disabled for now — the mascot is a single fixed Fenom tiger and the
// focus stays on habits, XP, streaks and progress. All the code + DB tables
// (mascot_items, mascot_inventory, coin_transactions, …) remain intact; flip
// this to true (or set NEXT_PUBLIC_FEATURE_MASCOT_CUSTOMIZATION=true) to bring
// the whole customization + coins system back without rebuilding it.
export const FEATURE_MASCOT_CUSTOMIZATION = process.env.NEXT_PUBLIC_FEATURE_MASCOT_CUSTOMIZATION === "true";
