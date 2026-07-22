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
      <g transform="translate(50 50) skewX(-12) translate(-50 -50)">
        <rect x="34" y="25" width="42" height="12.5" rx="6.25" fill="currentColor" />
        <rect x="27" y="43.75" width="50" height="12.5" rx="6.25" fill="var(--accent-3)" />
        <rect x="37" y="62.5" width="30" height="12.5" rx="6.25" fill="currentColor" />
      </g>
    </svg>
  );
}
