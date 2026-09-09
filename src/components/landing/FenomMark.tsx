// The Fenom "F" mark — three slanted rounded bars — reproduced as crisp SVG
// so it can wear the brand palette (off-white / graphite + matte blue) on a
// dark ground. Geometry mirrors the real logo asset; no glow, no gradients.
export function FenomMark({ size = 40, bar = "#F2F1EC", accent = "#526582", className }: {
  size?: number;
  bar?: string;
  accent?: string;
  className?: string;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <g transform="skewX(-9)">
        <rect x="36" y="18" width="74" height="20" rx="10" fill={bar} />
        <rect x="30" y="50" width="64" height="20" rx="10" fill={accent} />
        <rect x="24" y="82" width="34" height="20" rx="10" fill={bar} />
      </g>
    </svg>
  );
}
