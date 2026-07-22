// Tracks whether the user has completed the first-run onboarding.
// Stored separately from habit data so it survives a data reset.

const KEY = "momentum-onboarded";

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
