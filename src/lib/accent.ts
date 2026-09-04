// User-selectable accent color. Persisted in localStorage and applied by
// overriding the accent CSS variables on <html>. The same map is inlined in
// the pre-paint script in layout.tsx to avoid a flash.

export type AccentKey = "navy" | "green" | "lime" | "amber" | "violet" | "aqua";

// order: --accent, --accent-2, --accent-3, --accent-soft, --accent-ring, --accent-ink
export const ACCENTS: Record<AccentKey, { label: string; swatch: string; vars: string[] }> = {
  navy:   { label: "Marino", swatch: "#3a5a94", vars: ["#3a5a94", "#40619c", "#4a6ba6", "rgba(58,90,148,0.16)", "rgba(58,90,148,0.42)", "#eef2f8"] },
  green:  { label: "Verde",  swatch: "#45c68e", vars: ["#45c68e", "#52c795", "#5ec99a", "rgba(69,198,142,0.14)", "rgba(69,198,142,0.40)", "#07130d"] },
  lime:   { label: "Lima",   swatch: "#d7ff28", vars: ["#d7ff28", "#c9f51e", "#e4ff5c", "rgba(215,255,40,0.12)", "rgba(215,255,40,0.40)", "#0b1400"] },
  amber:  { label: "Ámbar",  swatch: "#e0a44b", vars: ["#e0a44b", "#e6ad5a", "#ecb86e", "rgba(224,164,75,0.14)", "rgba(224,164,75,0.40)", "#170f00"] },
  violet: { label: "Violeta", swatch: "#8f7fb0", vars: ["#8f7fb0", "#9a8bbb", "#a897c6", "rgba(143,127,176,0.16)", "rgba(143,127,176,0.42)", "#0d0a14"] },
  aqua:   { label: "Aqua",   swatch: "#49c8d0", vars: ["#49c8d0", "#57cfd6", "#6ad7dd", "rgba(73,200,208,0.14)", "rgba(73,200,208,0.40)", "#031316"] },
};

const KEYS = ["--accent", "--accent-2", "--accent-3", "--accent-soft", "--accent-ring", "--accent-ink"];
const STORAGE_KEY = "fenom-accent";

export function applyAccent(key: AccentKey) {
  const a = ACCENTS[key];
  if (!a) return;
  const r = document.documentElement.style;
  a.vars.forEach((v, i) => r.setProperty(KEYS[i], v));
}

export function storedAccent(): AccentKey | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v && v in ACCENTS ? (v as AccentKey) : null;
  } catch {
    return null;
  }
}

export function setAccent(key: AccentKey) {
  try { localStorage.setItem(STORAGE_KEY, key); } catch {}
  applyAccent(key);
}
