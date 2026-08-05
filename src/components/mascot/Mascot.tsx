"use client";

import { motion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";
import { mascotStateAsset, itemAsset } from "@/lib/fenom/assets";
import type { MascotAnimation, MascotState } from "@/lib/fenom/types";

// Reusable, asset-agnostic mascot renderer.
//
// While no artwork exists it shows a neutral, on-brand placeholder stage (never
// an invented character or emoji). When real assets are registered in
// lib/fenom/assets, the same component renders them in layers:
//   base < clothing < shoes < accessory < headwear
// `layers` is the ordered list of equipped item asset keys to stack on top.
export interface MascotProps {
  state?: MascotState;
  animation?: MascotAnimation;
  layers?: string[];        // equipped item assetKeys, back-to-front
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
    <motion.div
      variants={anim[animation]}
      animate="animate"
      className={cn("relative select-none", className)}
      style={{ width: size, height: size }}
      aria-label={`Mascota ${name} (${state})`}
    >
      {/* Soft stage glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full opacity-30 blur-2xl"
        style={{ background: "radial-gradient(circle at 50% 45%, var(--accent), transparent 65%)" }} />

      {baseSrc ? (
        // Real artwork path (base + layered items). Rendered when assets exist.
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
        // Neutral placeholder stage until the penguin artwork is provided.
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-[28%] border border-dashed border-border-strong bg-surface-2/70">
          <span className="text-[15px] font-semibold text-text">{name}</span>
          <span className="mt-1 text-[11px] font-medium text-text-muted">tu compañero</span>
        </div>
      )}
    </motion.div>
  );
}
