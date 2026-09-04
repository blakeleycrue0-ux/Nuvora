// Local focus-session log (per device). Persists minutes focused per habit/day
// so the app can show real "time invested" without a backend. Emits an event
// so widgets refresh live.

export interface FocusSession { habitId: string; date: string; minutes: number; ts: number; }

const KEY = "fenom-focus-log";
export const FOCUS_EVENT = "fenom-focus-changed";

export function getSessions(): FocusSession[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function logFocus(habitId: string, minutes: number, date = new Date().toISOString().slice(0, 10)) {
  const m = Math.round(minutes);
  if (m <= 0) return;
  try {
    const list = getSessions();
    list.push({ habitId, date, minutes: m, ts: Date.now() });
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(FOCUS_EVENT));
  } catch {}
}
