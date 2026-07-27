// Momentum mark — three slanted bars (motion). The outer two follow the current
// text color (so they invert per theme) and the middle bar is the brand green,
// matching the supplied logo.
export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <g transform="translate(50 50) skewX(-11) translate(-50 -50)">
        <rect x="36" y="24" width="48" height="13" rx="6.5" fill="currentColor" />
        <rect x="28" y="43" width="47" height="13" rx="6.5" fill="var(--accent-3)" />
        <rect x="17" y="62" width="32" height="13" rx="6.5" fill="currentColor" />
      </g>
    </svg>
  );
}
