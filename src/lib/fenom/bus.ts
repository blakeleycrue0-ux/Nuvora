// ============================================================
// Tiny, framework-agnostic event bus so the habit store can announce things
// (e.g. a habit was just completed) without importing React or the mascot
// system. The MascotProvider subscribes. Emitting is always best-effort and
// must never break the caller — emitters wrap calls in try/catch.
// ============================================================

import type { FenomEvent } from "./types";

type Listener = (e: FenomEvent) => void;

const listeners = new Set<Listener>();

export const fenomBus = {
  emit(e: FenomEvent) {
    for (const l of listeners) {
      try { l(e); } catch { /* a bad listener must not affect others or the emitter */ }
    }
  },
  subscribe(l: Listener): () => void {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};
