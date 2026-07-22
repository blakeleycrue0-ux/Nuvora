"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { navItems } from "@/components/app/nav-items";
import { useProfile } from "@/components/app/ProfileProvider";
import { signOut } from "@/app/actions";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const { profile, user } = useProfile();

  const name = profile?.full_name || user?.email?.split("@")[0] || "Guest";
  const initial = name.charAt(0).toUpperCase();

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
        <Link
          href="/onboarding"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:bg-white/[0.04] hover:text-text"
        >
          <Settings size={17} />
          Edit my info
        </Link>
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-text-secondary transition-colors hover:bg-white/[0.04] hover:text-text"
          >
            <LogOut size={17} />
            Sign out
          </button>
        </form>
        <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-[#5B9DFF] to-primary text-[12px] font-semibold text-white">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[13px] font-medium text-text">{name}</span>
            <span className="text-[11.5px] text-text-muted">
              {profile?.is_pro ? "Pro plan" : "Free plan"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
