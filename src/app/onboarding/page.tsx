"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight, ArrowLeft, Check, Flame, TrendingUp, Sparkles, CalendarCheck,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { useHabits } from "@/lib/momentum/store";
import { setOnboarded } from "@/lib/momentum/onboarding";
import type { Difficulty, Frequency, HabitColor } from "@/lib/momentum/types";
import { HabitIcon, HABIT_COLORS } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface Suggestion {
  name: string;
  icon: string;
  color: HabitColor;
  category: string;
}

const SUGGESTIONS: Suggestion[] = [
  { name: "Meditate", icon: "brain", color: "c-violet", category: "Mindfulness" },
  { name: "Drink water", icon: "glass-water", color: "c-sky", category: "Health" },
  { name: "Read", icon: "book-open", color: "c-amber", category: "Learning" },
  { name: "Exercise", icon: "dumbbell", color: "c-rose", category: "Fitness" },
  { name: "Journal", icon: "pen-line", color: "c-emerald", category: "Mindfulness" },
  { name: "Walk", icon: "footprints", color: "c-teal", category: "Health" },
];

const PICK_ICONS = ["brain", "glass-water", "book-open", "dumbbell", "pen-line", "footprints", "heart", "sparkles", "code", "leaf", "music", "sunrise"];

const DIFFICULTIES: { key: Difficulty; label: string; hint: string }[] = [
  { key: "easy", label: "Easy", hint: "A gentle daily win" },
  { key: "medium", label: "Medium", hint: "Takes some effort" },
  { key: "hard", label: "Hard", hint: "Truly demanding" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const { addHabit } = useHabits();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("sparkles");
  const [color, setColor] = useState<HabitColor>("c-emerald");
  const [category, setCategory] = useState("Personal");
  const [everyDay, setEveryDay] = useState(true);
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  const colorVal = useMemo(() => HABIT_COLORS.find((c) => c.key === color)!.value, [color]);
  const TOTAL = 3;

  const pickSuggestion = (s: Suggestion) => {
    setName(s.name);
    setIcon(s.icon);
    setColor(s.color);
    setCategory(s.category);
  };

  const finish = (createHabit: boolean) => {
    if (createHabit && name.trim()) {
      const frequency: Frequency = everyDay ? { type: "daily" } : { type: "custom", timesPerWeek: 3 };
      addHabit({
        name: name.trim(),
        icon,
        color,
        category,
        frequency,
        targetPerDay: 1,
        difficulty,
        tags: [],
      });
    }
    setOnboarded(true);
    router.replace("/dashboard");
  };

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      {/* Ambient gold glow */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[880px] -translate-x-1/2 rounded-full opacity-30 blur-[140px]"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 65%)" }} />

      {/* Header: wordmark + progress + skip */}
      <header className="relative z-10 flex items-center justify-between px-5 py-5 sm:px-8">
        <Wordmark href={null} />
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL }).map((_, i) => (
            <span
              key={i}
              className={cn("h-1.5 rounded-full transition-all duration-500", i <= step ? "w-7 accent-gradient" : "w-4 bg-border-strong")}
            />
          ))}
        </div>
        <button
          onClick={() => finish(false)}
          className="text-[13px] font-medium text-text-muted transition-colors hover:text-text"
        >
          Skip
        </button>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-16 pt-2">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <Step key="welcome">
                <Emblem icon={Sparkles} />
                <h1 className="mt-7 text-balance text-center text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] text-text sm:text-[36px]">
                  Welcome to Momentum, {firstName}.
                </h1>
                <p className="mx-auto mt-4 max-w-md text-balance text-center text-[15px] leading-relaxed text-text-secondary">
                  Great lives are built on small, repeated actions. Momentum helps you
                  turn the habits you care about into streaks you never want to break.
                </p>
                <div className="mt-9 flex justify-center">
                  <Button size="lg" onClick={() => setStep(1)} className="group">
                    Let&apos;s begin
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </Step>
            )}

            {step === 1 && (
              <Step key="how">
                <h1 className="text-balance text-center text-[26px] font-semibold leading-tight tracking-[-0.02em] text-text sm:text-[32px]">
                  How Momentum works
                </h1>
                <p className="mx-auto mt-3 max-w-md text-center text-[14.5px] leading-relaxed text-text-secondary">
                  Three simple ideas power everything.
                </p>
                <div className="mt-8 space-y-3.5">
                  <Explain icon={CalendarCheck} title="Check in daily" desc="Mark each habit done as you go. It takes one tap and quietly builds your record." />
                  <Explain icon={Flame} title="Build streaks" desc="Consecutive days stack into streaks. The longer the chain, the harder it is to break." />
                  <Explain icon={TrendingUp} title="Earn XP & watch it compound" desc="Every completion earns experience and levels you up, with analytics that reveal your progress." />
                </div>
                <div className="mt-9 flex items-center justify-between">
                  <button onClick={() => setStep(0)} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-text">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <Button size="lg" onClick={() => setStep(2)} className="group">
                    Create my first habit
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </div>
              </Step>
            )}

            {step === 2 && (
              <Step key="create">
                <h1 className="text-balance text-center text-[26px] font-semibold leading-tight tracking-[-0.02em] text-text sm:text-[32px]">
                  Your first habit
                </h1>
                <p className="mx-auto mt-3 max-w-md text-center text-[14.5px] leading-relaxed text-text-secondary">
                  Start with something small you can do most days. You can always add more later.
                </p>

                {/* Suggestions */}
                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => {
                    const active = name === s.name;
                    const val = HABIT_COLORS.find((c) => c.key === s.color)!.value;
                    return (
                      <button
                        key={s.name}
                        onClick={() => pickSuggestion(s)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all",
                          active ? "border-transparent text-accent-ink" : "border-border text-text-secondary hover:border-border-strong hover:text-text",
                        )}
                        style={active ? { background: val } : undefined}
                      >
                        <HabitIcon name={s.icon} size={15} />
                        {s.name}
                      </button>
                    );
                  })}
                </div>

                {/* Name + preview */}
                <div className="mt-6 flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                    style={{ background: `color-mix(in oklab, ${colorVal} 18%, transparent)`, color: colorVal }}>
                    <HabitIcon name={icon} size={22} />
                  </span>
                  <Input placeholder="Name your habit" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
                </div>

                {/* Icon row */}
                <div className="mt-5">
                  <p className="mb-2 text-[12.5px] font-semibold text-text-secondary">Icon</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PICK_ICONS.map((k) => (
                      <button
                        key={k}
                        onClick={() => setIcon(k)}
                        className={cn("flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                          icon === k ? "border-transparent text-accent-ink" : "border-border text-text-secondary hover:text-text")}
                        style={icon === k ? { background: colorVal } : undefined}
                      >
                        <HabitIcon name={k} size={17} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color row */}
                <div className="mt-5">
                  <p className="mb-2 text-[12.5px] font-semibold text-text-secondary">Color</p>
                  <div className="flex flex-wrap gap-2">
                    {HABIT_COLORS.map((c) => (
                      <button
                        key={c.key}
                        onClick={() => setColor(c.key as HabitColor)}
                        className={cn("h-8 w-8 rounded-full transition-transform hover:scale-110", color === c.key && "ring-2 ring-offset-2 ring-offset-bg")}
                        style={{ background: c.value, ...(color === c.key ? { boxShadow: `0 0 0 2px ${c.value}` } : {}) }}
                        aria-label={c.key}
                      />
                    ))}
                  </div>
                </div>

                {/* Frequency + difficulty */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-[12.5px] font-semibold text-text-secondary">How often</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Choice active={everyDay} onClick={() => setEveryDay(true)} label="Every day" />
                      <Choice active={!everyDay} onClick={() => setEveryDay(false)} label="3× a week" />
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-[12.5px] font-semibold text-text-secondary">Difficulty</p>
                    <div className="grid grid-cols-3 gap-2">
                      {DIFFICULTIES.map((d) => (
                        <Choice key={d.key} active={difficulty === d.key} onClick={() => setDifficulty(d.key)} label={d.label} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-text">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <Button size="lg" onClick={() => finish(true)} disabled={!name.trim()} className="group">
                    <Check size={18} /> Create &amp; start
                  </Button>
                </div>
              </Step>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Emblem({ icon: Icon }: { icon: typeof Sparkles }) {
  return (
    <div className="flex justify-center">
      <motion.span
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.5, 1] }}
        className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] accent-gradient text-accent-ink shadow-[var(--shadow-glow)]"
      >
        <Icon size={34} />
      </motion.span>
    </div>
  );
}

function Explain({ icon: Icon, title, desc }: { icon: typeof Flame; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-[15px] font-semibold text-text">{title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{desc}</p>
      </div>
    </div>
  );
}

function Choice({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-colors",
        active ? "border-accent bg-accent-soft text-accent" : "border-border text-text-secondary hover:text-text",
      )}
    >
      {label}
    </button>
  );
}
