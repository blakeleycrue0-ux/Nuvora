"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

interface Burst {
  id: number;
  x: number;
  y: number;
}

const COLORS = ["#45c68e", "#5ec99a", "#2bb57d", "#eef2f5", "#97a2ae"];

const ConfettiContext = createContext<{ fire: (x: number, y: number) => void }>({ fire: () => {} });

export function ConfettiProvider({ children }: { children: ReactNode }) {
  const [bursts, setBursts] = useState<Burst[]>([]);

  const fire = useCallback((x: number, y: number) => {
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, { id, x, y }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 1100);
  }, []);

  return (
    <ConfettiContext.Provider value={{ fire }}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
        <AnimatePresence>
          {bursts.map((burst) => (
            <BurstPieces key={burst.id} x={burst.x} y={burst.y} />
          ))}
        </AnimatePresence>
      </div>
    </ConfettiContext.Provider>
  );
}

function BurstPieces({ x, y }: { x: number; y: number }) {
  // Randomness is computed once when the burst mounts and memoized, so it stays
  // stable across re-renders (each burst unmounts after ~1.1s).
  /* eslint-disable react-hooks/purity */
  const pieces = useMemo(() => {
    const count = 22;
    return Array.from({ length: count }, (_, i) => {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 60 + Math.random() * 110;
      const size = 6 + Math.random() * 6;
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist - 40,
        color: COLORS[i % COLORS.length],
        size,
        height: size * (Math.random() > 0.5 ? 1 : 1.8),
        rotate: Math.random() * 360,
        duration: 0.9 + Math.random() * 0.3,
        radius: Math.random() > 0.5 ? "50%" : "2px",
      };
    });
  }, []);
  /* eslint-enable react-hooks/purity */

  return (
    <>
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x, y, scale: 0, opacity: 1 }}
          animate={{ x: x + p.dx, y: y + p.dy + 120, scale: 1, opacity: 0, rotate: p.rotate }}
          exit={{ opacity: 0 }}
          transition={{ duration: p.duration, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.height,
            background: p.color,
            borderRadius: p.radius,
            left: 0,
            top: 0,
          }}
        />
      ))}
    </>
  );
}

export function useConfetti() {
  return useContext(ConfettiContext);
}
