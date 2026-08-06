"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { HabitStoreProvider } from "@/lib/momentum/store";
import { ConfettiProvider } from "@/components/Confetti";
import { CelebrationProvider } from "@/components/Celebration";
import { ProgressProvider } from "@/components/progress/ProgressProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HabitStoreProvider>
          <ProgressProvider>
            <ConfettiProvider>
              <CelebrationProvider>{children}</CelebrationProvider>
            </ConfettiProvider>
          </ProgressProvider>
        </HabitStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
