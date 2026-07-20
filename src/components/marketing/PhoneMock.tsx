import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PhoneMock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[9/19.5] w-[280px] rounded-[2.75rem] border-[6px] border-[#1c1d22] bg-bg shadow-[0_1px_0_0_rgba(255,255,255,0.06)_inset,0_40px_80px_-24px_rgba(0,0,0,0.7)]",
        className,
      )}
    >
      <div className="absolute left-1/2 top-0 z-20 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-[#1c1d22]" />
      <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-bg">{children}</div>
    </div>
  );
}
