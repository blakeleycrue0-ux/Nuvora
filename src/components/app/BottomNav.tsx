"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/components/app/nav-items";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg/85 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2 pb-[calc(env(safe-area-inset-bottom)+6px)] pt-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors"
            >
              <Icon
                size={21}
                strokeWidth={active ? 2.25 : 1.75}
                className={cn("transition-colors", active ? "text-primary" : "text-text-muted")}
              />
              <span
                className={cn(
                  "text-[10.5px] font-medium transition-colors",
                  active ? "text-text" : "text-text-muted",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
