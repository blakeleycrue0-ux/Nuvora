import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  glass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive, glass, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border shadow-[var(--shadow-sm)]",
        glass ? "glass" : "border-border bg-surface",
        interactive && "hover-lift hover:shadow-[var(--shadow-md)] cursor-pointer",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";
