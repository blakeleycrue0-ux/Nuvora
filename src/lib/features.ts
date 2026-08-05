// ============================================================
// Product-mode feature flags.
//
// Fenom v1 ships as a PERSONAL-ONLY experience. The entire Teams / Clubs
// system stays in the codebase (DB tables, RLS, APIs, UI, business logic)
// but is switched OFF here so no normal UI path can reach it.
//
// To bring Teams back in a future version, set NEXT_PUBLIC_FEATURE_TEAMS
// to "true" in the environment (or flip the default below). Nothing else
// needs to be rebuilt — the code is intact behind this flag.
// ============================================================

export const FEATURE_TEAMS = process.env.NEXT_PUBLIC_FEATURE_TEAMS === "true";

// Convenience: the personal experience is always on.
export const FEATURE_PERSONAL = true;
