"use client";

import { useEffect, useRef, useState } from "react";

// Animated number that counts up to `value` with an ease-out curve.
export function CountUp({ value, duration = 900, className }: { value: number; duration?: number; className?: string }) {
  const [n, setN] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const a = from.current;
    const b = value;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(a + (b - a) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = b;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{n.toLocaleString()}</span>;
}
