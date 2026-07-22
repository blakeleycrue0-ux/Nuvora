import Link from "next/link";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

// Logo mark + wordmark lockup.
export function Wordmark({ className, href = "/", size = "md" }: { className?: string; href?: string | null; size?: "sm" | "md" | "lg" }) {
  const text = { sm: "text-[17px]", md: "text-[19px]", lg: "text-[22px]" };
  const mark = { sm: 20, md: 23, lg: 27 };
  const inner = (
    <span className={cn("inline-flex items-center gap-2 select-none text-text", className)}>
      <Logo size={mark[size]} />
      <span className={cn("font-semibold tracking-[-0.02em]", text[size])}>Momentum</span>
    </span>
  );
  if (href === null) return inner;
  return (
    <Link href={href} aria-label="Momentum home" className="inline-flex">
      {inner}
    </Link>
  );
}
