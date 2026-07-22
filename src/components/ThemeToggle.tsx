"use client";

import { Moon, Sun } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface text-text-secondary transition-colors hover:text-text hover:bg-surface-2",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: 14, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="absolute"
        >
          {theme === "dark" ? <Moon size={17} /> : <Sun size={18} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
