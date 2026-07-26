"use client";

import { useEffect, useRef } from "react";
import { useHabits } from "@/lib/momentum/store";
import { levelFromXP } from "@/lib/momentum/stats";
import { useCelebration } from "@/components/Celebration";

// Fires the full-screen Level-Up celebration when the user's level increases.
// Seeds the current level on load so it doesn't celebrate on first render.
export function LevelWatcher() {
  const { xp, ready } = useHabits();
  const { celebrateLevelUp } = useCelebration();
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (!ready) return;
    const { level, title } = levelFromXP(xp);
    if (prev.current === null) {
      prev.current = level;
      return;
    }
    if (level > prev.current) {
      celebrateLevelUp(level, title);
    }
    prev.current = level;
  }, [ready, xp, celebrateLevelUp]);

  return null;
}
