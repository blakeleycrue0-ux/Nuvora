"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { PhoneMock } from "@/components/marketing/PhoneMock";
import { MiniDashboardPreview } from "@/components/marketing/MiniDashboardPreview";
import { MiniNutritionPreview } from "@/components/marketing/MiniNutritionPreview";
import { MiniProgressPreview } from "@/components/marketing/MiniProgressPreview";
import { cn } from "@/lib/utils";

const screens = [
  { key: "dashboard", label: "Dashboard", render: () => <MiniDashboardPreview /> },
  { key: "nutrition", label: "Nutrition", render: () => <MiniNutritionPreview /> },
  { key: "progress", label: "Progress", render: () => <MiniProgressPreview /> },
];

export function ScreensPreview() {
  const [active, setActive] = useState(0);

  return (
    <section id="demo" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Inside Nuvora"
          title="Designed like it's the only app you'll ever need"
          description="Every screen is built for speed and clarity — nothing between you and the data that matters."
        />

        <div className="mt-14 flex justify-center">
          <div className="inline-flex gap-1 rounded-full border border-border bg-card p-1">
            {screens.map((screen, i) => (
              <button
                key={screen.key}
                onClick={() => setActive(i)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors",
                  active === i ? "text-white" : "text-text-secondary hover:text-text",
                )}
              >
                {active === i && (
                  <motion.span
                    layoutId="screen-pill"
                    className="absolute inset-0 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{screen.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="relative mt-14 flex justify-center">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 -z-10 h-[420px] rounded-full opacity-[0.12] blur-[110px]"
            style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }}
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={screens[active].key}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <PhoneMock>{screens[active].render()}</PhoneMock>
            </motion.div>
          </AnimatePresence>
        </div>
      </Container>
    </section>
  );
}
