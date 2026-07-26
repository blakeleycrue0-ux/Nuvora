"use client";

import { useEffect, useRef } from "react";
import { useHabits } from "@/lib/momentum/store";
import { computeAchievements } from "@/lib/momentum/stats";
import { useCelebration } from "@/components/Celebration";

// Watches for newly-earned achievements and fires the celebration overlay.
// Seeds the already-earned set on first load so it doesn't re-celebrate them.
export function AchievementWatcher() {
  const { habits, completions, xp, ready } = useHabits();
  const { celebrateAchievement } = useCelebration();
  const seeded = useRef(false);
  const earned = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!ready) return;
    const achievements = computeAchievements(habits, completions, xp);
    const earnedNow = achievements.filter((a) => a.earned);

    if (!seeded.current) {
      earned.current = new Set(earnedNow.map((a) => a.id));
      seeded.current = true;
      return;
    }

    for (const a of earnedNow) {
      if (!earned.current.has(a.id)) {
        earned.current.add(a.id);
        celebrateAchievement({ id: a.id, title: a.title, description: a.description, icon: a.icon, tier: a.tier });
      }
    }
  }, [ready, habits, completions, xp, celebrateAchievement]);

  return null;
}
