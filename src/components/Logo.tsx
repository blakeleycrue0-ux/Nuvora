import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {mark && (
        <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-white p-1 shadow-[0_1px_0_0_rgba(0,0,0,0.04)_inset,0_4px_10px_-2px_rgba(0,0,0,0.25)]">
          <Image src="/logo-mark.png" alt="" width={20} height={20} className="h-full w-full object-contain" priority />
        </span>
      )}
      <span className="text-[16px] font-semibold tracking-tight text-text">Nuvora</span>
    </span>
  );
}
