"use client";

import { useEffect } from "react";
import { useHabits } from "@/lib/momentum/store";
import { isScheduled, isComplete } from "@/lib/momentum/stats";
import { todayISO } from "@/lib/momentum/date";
import { remindersEnabled, notifPermission, showNotif } from "@/lib/notifications";

const NOTIFIED_KEY = "momentum-notified";

// While the app is open, schedule a notification at each habit's reminder time
// (for habits scheduled today that aren't complete yet).
export function ReminderScheduler() {
  const { habits, completions, ready } = useHabits();

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    if (!remindersEnabled() || notifPermission() !== "granted") return;

    const today = todayISO();
    let notified: Record<string, string[]> = {};
    try {
      notified = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || "{}");
    } catch {}
    const doneToday = new Set(notified[today] || []);
    const persist = () => {
      try {
        localStorage.setItem(NOTIFIED_KEY, JSON.stringify({ [today]: [...doneToday] }));
      } catch {}
    };

    const now = Date.now();
    const timers: number[] = [];

    for (const h of habits) {
      if (h.archived || !h.reminder) continue;
      if (!isScheduled(h, today)) continue;
      if (doneToday.has(h.id)) continue;
      if (isComplete(h, completions, today)) continue;

      const [hh, mm] = h.reminder.split(":").map(Number);
      if (Number.isNaN(hh) || Number.isNaN(mm)) continue;
      const when = new Date();
      when.setHours(hh, mm, 0, 0);
      const delay = when.getTime() - now;
      if (delay < 0 || delay > 24 * 60 * 60 * 1000) continue;

      const id = window.setTimeout(() => {
        void showNotif("Momentum", {
          body: `Time for “${h.name}”`,
          tag: `habit-${h.id}-${today}`,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          data: { url: "/dashboard" },
        });
        doneToday.add(h.id);
        persist();
      }, delay);
      timers.push(id);
    }

    return () => timers.forEach((t) => clearTimeout(t));
  }, [ready, habits, completions]);

  return null;
}
