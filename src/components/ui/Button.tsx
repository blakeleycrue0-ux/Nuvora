import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "text-white accent-gradient shadow-[0_1px_0_0_rgba(255,255,255,0.2)_inset] hover:opacity-95 hover:shadow-[var(--shadow-glow)]",
  secondary:
    "bg-surface text-text border border-border hover:border-border-strong hover:bg-surface-2 shadow-[var(--shadow-sm)]",
  outline: "bg-transparent text-text border border-border hover:bg-surface-2",
  ghost: "bg-transparent text-text-secondary hover:text-text hover:bg-surface-2",
  danger: "bg-danger text-white hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-xl",
  md: "h-11 px-5 text-[14px] gap-2 rounded-xl",
  lg: "h-13 px-7 text-[15px] gap-2.5 rounded-2xl",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ className, variant = "primary", size = "md", href, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-200 ease-out select-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]",
      variants[variant],
      sizes[size],
      className,
    );
    if (href) {
      return (
        <Link href={href} className={classes}>
          {children}
        </Link>
      );
    }
    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
