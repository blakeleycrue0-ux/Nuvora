"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings } from "lucide-react";
import { Logo } from "@/components/Logo";
import { navItems } from "@/components/app/nav-items";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-bg-elevated/60 px-4 py-6 lg:flex">
      <Link href="/" className="px-2">
        <Logo />
      </Link>

      <nav className="mt-10 flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                active ? "text-text" : "text-text-secondary hover:text-text hover:bg-white/[0.04]",
              )}
            >
              {active && (
                <span className="absolute inset-0 rounded-xl bg-primary-soft ring-1 ring-inset ring-primary/20" />
              )}
              <Icon size={17} strokeWidth={2} className="relative z-10" />
              <span className="relative z-10">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-col gap-1 border-t border-border pt-4">
        <button className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:bg-white/[0.04] hover:text-text">
          <Settings size={17} />
          Settings
        </button>
        <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5B9DFF] to-primary text-[12px] font-semibold text-white">
            A
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-medium text-text">Alex Rivera</span>
            <span className="text-[11.5px] text-text-muted">Pro plan</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
