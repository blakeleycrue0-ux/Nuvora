import { type ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-primary text-white shadow-[0_1px_0_0_rgba(255,255,255,0.12)_inset] hover:bg-primary-hover active:bg-primary-hover",
  secondary:
    "bg-card text-text border border-border hover:bg-card-hover active:bg-card-hover",
  outline:
    "bg-transparent text-text border border-border hover:border-text-muted hover:bg-white/[0.03]",
  ghost: "bg-transparent text-text-secondary hover:text-text hover:bg-white/[0.05]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] gap-1.5 rounded-lg",
  md: "h-11 px-5 text-[14px] gap-2 rounded-xl",
  lg: "h-13 px-7 text-[15px] gap-2.5 rounded-xl",
};

interface ButtonOwnProps {
  variant?: Variant;
  size?: Size;
  href?: string;
}

type ButtonProps = ButtonOwnProps & ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", href, children, ...props }, ref) => {
    const classes = cn(
      "inline-flex items-center justify-center font-medium whitespace-nowrap transition-all duration-200 ease-out",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
      "disabled:opacity-40 disabled:pointer-events-none",
      "active:scale-[0.98]",
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
