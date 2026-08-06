"use client";

import { useState } from "react";

// The official Fenom Coin. Drop the uploaded asset at /public/fenom-coin.png
// (or .svg and change COIN_ASSET) and it is used automatically and exactly as
// provided — no redraw. Until it exists, a neutral, minimal disc placeholder is
// shown (deliberately plain — not coin artwork).
export const COIN_ASSET = "/fenom-coin.png";

export function CoinIcon({ size = 18, className }: { size?: number; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={COIN_ASSET}
        alt="Fenom Coin"
        width={size}
        height={size}
        className={className}
        style={{ width: size, height: size, objectFit: "contain" }}
        onError={() => setFailed(true)}
      />
    );
  }

  // Neutral placeholder disc until the official asset is uploaded.
  return (
    <span
      aria-label="Fenom Coin"
      className={className}
      style={{
        width: size, height: size, display: "inline-block", borderRadius: "9999px",
        background: "radial-gradient(circle at 35% 30%, #f4d47a, #d9a441 70%)",
        boxShadow: "inset 0 0 0 1.5px rgba(0,0,0,0.08)",
      }}
    />
  );
}
