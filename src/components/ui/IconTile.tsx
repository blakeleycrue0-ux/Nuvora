import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconTileProps {
  icon: LucideIcon;
  color?: string;
  className?: string;
  size?: "sm" | "md";
}

export function IconTile({ icon: Icon, color = "var(--color-primary)", className, size = "md" }: IconTileProps) {
  const dims = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const iconDims = size === "sm" ? 16 : 19;

  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl border border-white/[0.06]",
        dims,
        className,
      )}
      style={{
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
      }}
    >
      <Icon size={iconDims} style={{ color }} strokeWidth={1.75} />
    </div>
  );
}
