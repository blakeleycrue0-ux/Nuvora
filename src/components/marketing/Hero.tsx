"use client";

import { motion } from "motion/react";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PhoneMock } from "@/components/marketing/PhoneMock";
import { MiniDashboardPreview } from "@/components/marketing/MiniDashboardPreview";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-16 sm:pt-20">
      {/* Ambient background glow — subtle, no neon */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-10%] h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }}
      />

      <div className="container-page relative grid items-center gap-16 pb-20 lg:grid-cols-2 lg:gap-8 lg:pb-32">
        <div className="flex flex-col items-start gap-7">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3.5 py-1.5 text-[12.5px] font-medium text-text-secondary"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Powered by AI &middot; Built for real progress
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="text-balance text-[40px] font-semibold leading-[1.08] tracking-tight text-text sm:text-[54px] lg:text-[58px]"
          >
            One app.
            <br />
            Everything your health needs.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md text-balance text-[17px] leading-relaxed text-text-secondary"
          >
            Track workouts, nutrition, calories, progress and habits in one
            beautiful experience — no more switching between five different apps.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Button href="/login" size="lg" className="group">
              Get Started
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button href="#demo" variant="secondary" size="lg">
              <PlayCircle size={17} />
              See Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center gap-3 pt-2"
          >
            <div className="flex -space-x-2.5">
              {["#F59E0B", "#22C55E", "#3B82F6", "#A78BFA"].map((c, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-bg"
                  style={{ background: c }}
                />
              ))}
            </div>
            <p className="text-[13px] text-text-secondary">
              Trusted by <span className="font-medium text-text">12,000+</span> people building healthier habits
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex justify-center lg:justify-end"
        >
          <div
            aria-hidden
            className="absolute -inset-x-10 top-10 -z-10 h-[420px] rounded-full opacity-[0.12] blur-[100px]"
            style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }}
          />
          <PhoneMock>
            <MiniDashboardPreview />
          </PhoneMock>
        </motion.div>
      </div>
    </section>
  );
}
