import Link from "next/link";
import { cn } from "@/lib/utils";

// Text-only wordmark (per brand: no logo mark).
export function Wordmark({ className, href = "/", size = "md" }: { className?: string; href?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "text-[17px]", md: "text-[19px]", lg: "text-[22px]" };
  const inner = (
    <span className={cn("font-semibold tracking-[-0.02em] text-text select-none", sizes[size], className)}>
      Momentum<span className="accent-text">.</span>
    </span>
  );
  if (href === null) return inner;
  return (
    <Link href={href} aria-label="Momentum home" className="inline-flex">
      {inner}
    </Link>
  );
}
