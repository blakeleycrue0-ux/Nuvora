"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { HabitStoreProvider } from "@/lib/momentum/store";
import { ConfettiProvider } from "@/components/Confetti";
import { CelebrationProvider } from "@/components/Celebration";
import { ProgressProvider } from "@/components/progress/ProgressProvider";
import { FocusProvider } from "@/components/focus/FocusProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HabitStoreProvider>
          <ProgressProvider>
            <ConfettiProvider>
              <CelebrationProvider>
                <FocusProvider>{children}</FocusProvider>
              </CelebrationProvider>
            </ConfettiProvider>
          </ProgressProvider>
        </HabitStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
