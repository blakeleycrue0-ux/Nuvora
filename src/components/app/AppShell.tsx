import { type ReactNode } from "react";
import { Sidebar } from "@/components/app/Sidebar";
import { BottomNav } from "@/components/app/BottomNav";
import { Logo } from "@/components/Logo";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-bg">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-bg/85 px-4 backdrop-blur-xl sm:px-6 lg:hidden">
          <Logo />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#5B9DFF] to-primary text-[12px] font-semibold text-white">
            A
          </div>
        </header>
        <main className="flex-1 pb-24 lg:pb-10">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
