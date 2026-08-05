// ============================================================
// Fenom economy & mascot configuration — the ONE place to tune the system.
//
// Coin amounts here must match the `reward_definitions` table seeded in
// migration 0008 (the DB validates earn transactions against those amounts).
// Item prices / unlock levels live in the DB (`mascot_items`) so they can be
// changed without a deploy and validated server-side on purchase.
// ============================================================

import type { FenomEventType, MascotAnimation, MascotState, Rarity } from "./types";

// Coins awarded per earn source. Keep in sync with reward_definitions.
export const COIN_SOURCES = {
  habit_completed: 5,
  day_completed: 25,
  streak_milestone: 40,
  achievement_unlocked: 50,
  level_up: 50,
  welcome_bonus: 100,
} as const;
export type EarnSource = keyof typeof COIN_SOURCES;

// Streak lengths that pay a milestone bonus.
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365];

// Presentation for each rarity. Uses theme tokens only — no loud gradients.
export const RARITY_META: Record<Rarity, { label: string; ring: string; text: string }> = {
  common: { label: "Común", ring: "border-border", text: "text-text-muted" },
  rare: { label: "Raro", ring: "border-sky-400/60", text: "text-sky-500" },
  epic: { label: "Épico", ring: "border-violet-400/60", text: "text-violet-500" },
  legendary: { label: "Legendario", ring: "border-amber-400/70", text: "text-amber-500" },
};

// Which state (and optional animation) each event should put the mascot in.
export const EVENT_REACTION: Record<FenomEventType, { state: MascotState; animation: MascotAnimation }> = {
  HABIT_COMPLETED: { state: "happy", animation: "bounce" },
  DAY_COMPLETED: { state: "celebrating", animation: "celebrate" },
  LEVEL_UP: { state: "excited", animation: "levelup" },
  ACHIEVEMENT_UNLOCKED: { state: "celebrating", animation: "celebrate" },
  STREAK_STARTED: { state: "proud", animation: "bounce" },
  STREAK_MILESTONE: { state: "proud", animation: "celebrate" },
  STREAK_BROKEN: { state: "sad", animation: "none" },
  ITEM_UNLOCKED: { state: "surprised", animation: "bounce" },
  ITEM_PURCHASED: { state: "happy", animation: "bounce" },
  ITEM_EQUIPPED: { state: "proud", animation: "wave" },
  REMINDER: { state: "reminder", animation: "wave" },
};

// Short, modern, natural copy. No automatic emojis. Expandable per event.
// One line is picked at random when the event fires.
export const MASCOT_MESSAGES: Partial<Record<FenomEventType, string[]>> = {
  HABIT_COMPLETED: ["Bien hecho.", "Uno menos.", "Vamos sumando.", "Eso cuenta."],
  DAY_COMPLETED: ["Día perfecto.", "Todo hecho hoy.", "Así se hace."],
  LEVEL_UP: ["¡Subiste de nivel!", "Mírate.", "Nuevo nivel."],
  ACHIEVEMENT_UNLOCKED: ["Logro desbloqueado.", "Te lo has ganado."],
  STREAK_MILESTONE: ["Sigue así.", "Racha en marcha."],
  STREAK_BROKEN: ["Volvamos a ello.", "Empezamos de nuevo."],
  ITEM_PURCHASED: ["Buena elección.", "Te queda bien."],
  ITEM_EQUIPPED: ["Nuevo look.", "Listo."],
  REMINDER: ["Te queda una tarea.", "Aún estás a tiempo."],
};

// Idle / ambient lines shown when nothing just happened.
export const MASCOT_IDLE_MESSAGES = ["¿Listo para hoy?", "Vamos a por ello.", "Un hábito cada vez."];

// Default mascot name (user can rename).
export const DEFAULT_MASCOT_NAME = "Fen";
