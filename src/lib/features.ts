// ============================================================
// Product-mode feature flags.
//
// Fenom runs the PERSONAL experience (habits, XP, Progress Bubble, ranking)
// AND the Football Clubs / Teams experience together. Nothing about Teams was
// ever deleted — DB tables, RLS, APIs, business logic and UI all stayed in the
// codebase; this flag only controls whether the Teams UI is exposed.
//
// Teams is HIDDEN by default (personal-only app). Nothing about Teams is
// removed — all the code, DB tables, RLS and business logic stay intact; this
// only controls whether the Teams UI is exposed. Set
// NEXT_PUBLIC_FEATURE_TEAMS="true" to bring the whole clubs experience back.
// ============================================================

export const FEATURE_TEAMS = process.env.NEXT_PUBLIC_FEATURE_TEAMS === "true";

// Convenience: the personal experience is always on.
export const FEATURE_PERSONAL = true;

// Mascot customization: clothing, shop, equip, inventory and the Fenom Coins
// economy. Disabled for now — the mascot is a single fixed Fenom tiger and the
// focus stays on habits, XP, streaks and progress. All the code + DB tables
// (mascot_items, mascot_inventory, coin_transactions, …) remain intact; flip
// this to true (or set NEXT_PUBLIC_FEATURE_MASCOT_CUSTOMIZATION=true) to bring
// the whole customization + coins system back without rebuilding it.
export const FEATURE_MASCOT_CUSTOMIZATION = process.env.NEXT_PUBLIC_FEATURE_MASCOT_CUSTOMIZATION === "true";
