import { cn } from "@/lib/utils";

export function Logo({ className, mark = true }: { className?: string; mark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {mark && (
        <span className="relative inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-[#5B9DFF] to-[#3B82F6] shadow-[0_1px_0_0_rgba(255,255,255,0.25)_inset,0_4px_10px_-2px_rgba(59,130,246,0.55)]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 14.5L9 8L14 15L20 5"
              stroke="white"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}
      <span className="text-[16px] font-semibold tracking-tight text-text">Nuvora</span>
    </span>
  );
}
