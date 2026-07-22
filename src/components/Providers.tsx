"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { HabitStoreProvider } from "@/lib/momentum/store";
import { ConfettiProvider } from "@/components/Confetti";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HabitStoreProvider>
          <ConfettiProvider>{children}</ConfettiProvider>
        </HabitStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
