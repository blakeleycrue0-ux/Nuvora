import { cn } from "@/lib/utils";

// Momentum mark — the supplied brand artwork, shown on a light rounded tile
// (like an app icon) so it renders cleanly on any background. Sourced from
// /public/logo-mark.png; not redrawn.
export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-mark.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn("rounded-[24%] object-contain", className)}
    />
  );
}
