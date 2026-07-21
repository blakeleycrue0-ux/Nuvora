import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, className, compact }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 text-center",
        compact ? "py-8" : "py-14",
        className,
      )}
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04]">
        <Icon size={17} className="text-text-muted" />
      </span>
      <p className="text-[13.5px] font-medium text-text">{title}</p>
      {description && <p className="max-w-[26ch] text-[12.5px] text-text-secondary">{description}</p>}
    </div>
  );
}
