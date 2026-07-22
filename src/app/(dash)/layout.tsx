"use client";

import { type ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import { LogOut } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Avatar } from "@/components/app/Avatar";
import { navItems } from "@/components/app/nav";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function DashLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, signOut } = useAuth();

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface/50 px-4 py-6 lg:flex">
        <div className="px-2">
          <Wordmark />
        </div>
        <nav className="mt-9 flex flex-1 flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-colors",
                  active ? "text-white" : "text-text-secondary hover:text-text hover:bg-surface-2",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-xl accent-gradient shadow-[var(--shadow-glow)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={18} className="relative z-10" strokeWidth={2.1} />
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5">
          <Avatar size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-text">{user.name}</p>
            <p className="truncate text-[11.5px] text-text-muted">{user.email}</p>
          </div>
          <button
            onClick={signOut}
            aria-label="Sign out"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-danger"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-bg/80 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <Wordmark size="sm" />
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2.5">
            <ThemeToggle />
            <div className="lg:hidden">
              <Avatar size={36} />
            </div>
          </div>
        </header>

        <main className="flex-1 pb-24 lg:pb-10">{children}</main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/90 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-md items-stretch justify-between px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2.5">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="flex flex-1 flex-col items-center gap-1 py-1">
                <Icon
                  size={22}
                  strokeWidth={active ? 2.4 : 1.9}
                  className={cn("transition-colors", active ? "text-accent" : "text-text-muted")}
                />
                <span className={cn("text-[10.5px] font-medium", active ? "text-text" : "text-text-muted")}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
