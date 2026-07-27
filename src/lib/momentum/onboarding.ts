// Tracks whether the user has completed the first-run onboarding.
// Stored separately from habit data so it survives a data reset.

const KEY = "momentum-onboarded";

// Fast local cache used alongside the per-user Supabase flag (user.onboarded).
// The Supabase flag is the source of truth across devices; this avoids a
// flash/redirect while the session refreshes right after finishing onboarding.
export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setOnboarded(done = true): void {
  try {
    if (done) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  } catch {
    /* storage disabled */
  }
}
