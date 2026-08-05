"use client";

import { type ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { HabitStoreProvider } from "@/lib/momentum/store";
import { ConfettiProvider } from "@/components/Confetti";
import { CelebrationProvider } from "@/components/Celebration";
import { MascotProvider } from "@/components/mascot/MascotProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HabitStoreProvider>
          <MascotProvider>
            <ConfettiProvider>
              <CelebrationProvider>{children}</CelebrationProvider>
            </ConfettiProvider>
          </MascotProvider>
        </HabitStoreProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
