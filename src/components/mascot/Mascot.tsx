"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { mascotStateAsset, itemAsset } from "@/lib/fenom/assets";
import type { MascotAnimation, MascotState } from "@/lib/fenom/types";

// The Fenom mascot — a single fixed tiger companion. Asset-agnostic: while no
// artwork exists it shows a clean, neutral placeholder (never an invented or
// AI-generated character). When real tiger art is registered in
// lib/fenom/assets it renders in place, with an always-on subtle idle float.
//
// `layers` (equipped item art) is only used when the customization system is
// re-enabled; in the fixed-mascot build it stays empty.
export interface MascotProps {
  state?: MascotState;
  animation?: MascotAnimation;
  layers?: string[];
  name?: string;
  size?: number;
  className?: string;
}

const anim: Record<MascotAnimation, Variants> = {
  none: { animate: {} },
  bounce: { animate: { y: [0, -8, 0], transition: { duration: 0.6, repeat: 1 } } },
  celebrate: { animate: { scale: [1, 1.08, 0.98, 1], rotate: [0, -3, 3, 0], transition: { duration: 0.7 } } },
  wave: { animate: { rotate: [0, -4, 4, 0], transition: { duration: 0.8 } } },
  sleep: { animate: { y: [0, 2, 0], transition: { duration: 2.4, repeat: Infinity } } },
  levelup: { animate: { scale: [1, 1.15, 1], y: [0, -12, 0], transition: { duration: 0.8 } } },
};

export function Mascot({ state = "idle", animation = "none", layers = [], name = "Fen", size = 180, className }: MascotProps) {
  const baseSrc = mascotStateAsset(state);

  return (
    <div className={cn("relative select-none", className)} style={{ width: size, height: size }} aria-label={`Mascota ${name}`}>
      {/* Soft stage glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full opacity-25 blur-2xl"
        style={{ background: "radial-gradient(circle at 50% 42%, var(--accent), transparent 62%)" }} />

      {/* Gentle continuous idle float, with per-event animations layered on top */}
      <motion.div
        className="absolute inset-0"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div className="h-full w-full" variants={anim[animation]} animate="animate">
          {baseSrc ? (
            <div className="absolute inset-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={baseSrc} alt="" className="absolute inset-0 h-full w-full object-contain" />
              {layers.map((key) => {
                const src = itemAsset(key);
                return src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={key} src={src} alt="" className="absolute inset-0 h-full w-full object-contain" />
                ) : null;
              })}
            </div>
          ) : (
            // Neutral placeholder until the Fenom tiger artwork is provided.
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[30%] border border-border bg-surface-2/60">
              <span className="text-[15px] font-semibold text-text">{name}</span>
              <span className="mt-0.5 text-[11px] font-medium text-text-muted">tu compañero</span>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
