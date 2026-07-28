"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight, ArrowLeft, Check, Sparkles, ShieldCheck, Bell, Camera,
  Lock, Star, HeartPulse, Crown, Zap, Flame,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { useAuth } from "@/lib/auth";
import { useHabits } from "@/lib/momentum/store";
import { setOnboarded } from "@/lib/momentum/onboarding";
import { requestNotif, setReminders, notifSupported } from "@/lib/notifications";
import { subscribeToPush, pushSupported } from "@/lib/push";
import {
  FOCUS_AREAS, MOTIVATIONS, CONSISTENCY, REVIEWS, type GoalTemplate,
} from "@/lib/momentum/onboarding-content";
import { HabitIcon, colorValue } from "@/lib/icons";
import { cn } from "@/lib/utils";

const TOTAL = 13; // steps 0..12 (12 = success)
const LAST_INPUT = 11; // last interactive step before success

export default function OnboardingPage() {
  const router = useRouter();
  const { user, ready, markOnboarded } = useAuth();
  const { addHabit } = useHabits();

  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [consistency, setConsistency] = useState<string | null>(null);
  const [motivation, setMotivation] = useState<string | null>(null);
  const [remindersOn, setRemindersOn] = useState(true);
  const [reminderTime, setReminderTime] = useState("09:00");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
  }, [ready, user, router]);

  const firstName = user?.name?.split(" ")[0] ?? "there";

  // Goals visible depend on the focus areas the user chose.
  const visibleGoals = useMemo<GoalTemplate[]>(
    () => FOCUS_AREAS.filter((f) => focus.includes(f.id)).flatMap((f) => f.goals),
    [focus],
  );
  const chosenGoals = useMemo(
    () => visibleGoals.filter((g) => goals.includes(g.id)),
    [visibleGoals, goals],
  );

  const toggleFocus = (id: string) =>
    setFocus((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  const toggleGoal = (id: string) =>
    setGoals((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));

  // Prune goal selections when focus areas change so hidden goals don't linger.
  useEffect(() => {
    const allowed = new Set(visibleGoals.map((g) => g.id));
    setGoals((prev) => prev.filter((g) => allowed.has(g))); // eslint-disable-line react-hooks/set-state-in-effect
  }, [visibleGoals]);

  const canAdvance =
    (step === 1 && focus.length === 0) || (step === 2 && chosenGoals.length === 0) ? false : true;

  const next = () => setStep((s) => Math.min(s + 1, LAST_INPUT));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const skip = () => {
    setOnboarded(true); // local cache — prevents the dashboard gate from bouncing back
    void markOnboarded(); // persist per-user in Supabase (cross-device)
    router.replace("/dashboard");
  };

  const enableReminders = useCallback(async (on: boolean) => {
    setRemindersOn(on);
    if (on && notifSupported()) await requestNotif();
  }, []);

  const finish = useCallback(async () => {
    if (creating) return;
    setCreating(true);
    const toCreate = chosenGoals.length
      ? chosenGoals
      : [FOCUS_AREAS[0].goals[0]]; // never land on an empty dashboard

    for (const g of toCreate) {
      addHabit({
        name: g.name,
        icon: g.icon,
        color: g.color,
        category: g.category,
        frequency: g.frequency,
        targetPerDay: 1,
        difficulty: g.difficulty,
        tags: [],
        verify: g.verify,
        reminder: remindersOn ? reminderTime : undefined,
      });
    }

    if (remindersOn) {
      setReminders(true);
      if (user && pushSupported()) void subscribeToPush(user.id).catch(() => {});
    }

    setOnboarded(true); // local cache
    void markOnboarded(); // persist per-user in Supabase (cross-device)
    setStep(12); // success animation
    window.setTimeout(() => router.replace("/dashboard"), 2400);
  }, [creating, chosenGoals, addHabit, remindersOn, reminderTime, user, router, markOnboarded]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  const showChrome = step <= LAST_INPUT;
  const pct = Math.round((Math.min(step, LAST_INPUT) / LAST_INPUT) * 100);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      {/* Ambient accent glow */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[880px] -translate-x-1/2 rounded-full opacity-25 blur-[140px]"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 65%)" }} />

      {showChrome && (
        <header className="relative z-10 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] sm:px-8">
          <div className="flex items-center justify-between">
            <Wordmark href={null} />
            <button onClick={skip} className="text-[13px] font-medium text-text-muted transition-colors hover:text-text">
              Skip
            </button>
          </div>
          {/* Slim progress bar */}
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-border-strong/60">
            <motion.div
              className="h-full accent-gradient"
              initial={false}
              animate={{ width: `${pct}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
            />
          </div>
        </header>
      )}

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-14 pt-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait">
            {/* 0 — Welcome */}
            {step === 0 && (
              <Step key="welcome">
                <Emblem icon={Sparkles} />
                <Title className="mt-7">Welcome to Fenom, {firstName}.</Title>
                <Lead>
                  Great lives are built on small, repeated actions. In the next minute we&apos;ll
                  tailor Fenom around what you want to change.
                </Lead>
                <Nav>
                  <span />
                  <Button size="lg" onClick={next} className="group">
                    Let&apos;s begin
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
                  </Button>
                </Nav>
              </Step>
            )}

            {/* 1 — What to improve */}
            {step === 1 && (
              <Step key="focus">
                <Title>What do you want to improve?</Title>
                <Lead>Pick everything that resonates. We&apos;ll suggest habits for each.</Lead>
                <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {FOCUS_AREAS.map((f) => {
                    const active = focus.includes(f.id);
                    const val = colorValue(f.color);
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggleFocus(f.id)}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-all",
                          active ? "border-transparent ring-2" : "border-border hover:border-border-strong",
                        )}
                        style={active ? { background: `color-mix(in oklab, ${val} 12%, transparent)`, boxShadow: `0 0 0 2px ${val}` } : undefined}
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{ background: `color-mix(in oklab, ${val} 18%, transparent)`, color: val }}>
                          <HabitIcon name={f.icon} size={18} />
                        </span>
                        <span className="text-[13.5px] font-semibold text-text">{f.label}</span>
                        <span className="text-[11.5px] leading-snug text-text-muted">{f.blurb}</span>
                      </button>
                    );
                  })}
                </div>
                <NavBack onBack={back} onNext={next} disabled={!canAdvance} />
              </Step>
            )}

            {/* 2 — Choose goals */}
            {step === 2 && (
              <Step key="goals">
                <Title>Choose your goals</Title>
                <Lead>Tap the ones you want to build. You can fine-tune everything later.</Lead>
                <div className="mt-7 flex flex-wrap justify-center gap-2">
                  {visibleGoals.map((g) => {
                    const active = goals.includes(g.id);
                    const val = colorValue(g.color);
                    return (
                      <button
                        key={g.id}
                        onClick={() => toggleGoal(g.id)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-all",
                          active ? "border-transparent text-accent-ink" : "border-border text-text-secondary hover:border-border-strong hover:text-text",
                        )}
                        style={active ? { background: val } : undefined}
                      >
                        <HabitIcon name={g.icon} size={15} />
                        {g.label}
                        {active && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-5 text-center text-[12.5px] text-text-muted">
                  {chosenGoals.length > 0 ? `${chosenGoals.length} selected` : "Select at least one"}
                </p>
                <NavBack onBack={back} onNext={next} disabled={!canAdvance} />
              </Step>
            )}

            {/* 3 — Current habits / consistency */}
            {step === 3 && (
              <Step key="consistency">
                <Title>How consistent are you today?</Title>
                <Lead>No judgment — this just helps us pace your start.</Lead>
                <div className="mt-7 space-y-2.5">
                  {CONSISTENCY.map((c) => (
                    <SelectRow key={c.id} active={consistency === c.id} onClick={() => setConsistency(c.id)} title={c.label} desc={c.hint} />
                  ))}
                </div>
                <NavBack onBack={back} onNext={next} />
              </Step>
            )}

            {/* 4 — Motivation */}
            {step === 4 && (
              <Step key="motivation">
                <Title>What&apos;s driving you?</Title>
                <Lead>Your &quot;why&quot; is what carries you on the hard days.</Lead>
                <div className="mt-7 space-y-2.5">
                  {MOTIVATIONS.map((m) => {
                    const active = motivation === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setMotivation(m.id)}
                        className={cn(
                          "flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all",
                          active ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong",
                        )}
                      >
                        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          active ? "accent-gradient text-accent-ink" : "bg-surface-2 text-text-secondary")}>
                          <HabitIcon name={m.icon} size={19} />
                        </span>
                        <span className="text-[14.5px] font-medium text-text">{m.label}</span>
                        {active && <Check size={18} className="ml-auto text-accent" />}
                      </button>
                    );
                  })}
                </div>
                <NavBack onBack={back} onNext={next} />
              </Step>
            )}

            {/* 5 — Reminders */}
            {step === 5 && (
              <Step key="reminders">
                <Emblem icon={Bell} />
                <Title className="mt-7">Gentle nudges</Title>
                <Lead>A daily reminder makes you far more likely to show up. We&apos;ll never spam you.</Lead>
                <div className="mt-7 space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
                    <div>
                      <p className="text-[14.5px] font-semibold text-text">Daily reminder</p>
                      <p className="text-[12.5px] text-text-muted">A nudge to check in on your habits</p>
                    </div>
                    <Toggle checked={remindersOn} onChange={enableReminders} label="Daily reminder" />
                  </div>
                  <AnimatePresence>
                    {remindersOn && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="flex items-center justify-between overflow-hidden rounded-2xl border border-border bg-surface p-4"
                      >
                        <p className="text-[14.5px] font-medium text-text">Remind me at</p>
                        <input
                          type="time"
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          className="rounded-xl border border-border bg-surface-2 px-3 py-2 text-[14px] font-medium text-text outline-none focus:border-accent"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <NavBack onBack={back} onNext={next} />
              </Step>
            )}

            {/* 6 — AI verification */}
            {step === 6 && (
              <Step key="verify">
                <Emblem icon={Camera} />
                <Title className="mt-7">Prove it with a photo</Title>
                <Lead>
                  For habits worth verifying, snap a quick photo and our AI confirms you really did it —
                  a made bed, an open book, the gym floor. It&apos;s the accountability that makes streaks stick.
                </Lead>
                <div className="mt-7 space-y-3">
                  <Feature icon={Camera} title="One tap to verify" desc="Point, shoot, done. Works from your camera or library." />
                  <Feature icon={ShieldCheck} title="Private by design" desc="Photos are stored securely and only ever visible to you." />
                  <Feature icon={Sparkles} title="Optional per habit" desc="Turn it on only for the habits where proof helps." />
                </div>
                <NavBack onBack={back} onNext={next} />
              </Step>
            )}

            {/* 7 — Health disclaimer */}
            {step === 7 && (
              <Step key="health">
                <Emblem icon={HeartPulse} />
                <Title className="mt-7">A quick note on wellbeing</Title>
                <Lead>
                  Fenom helps you build routines — it is not medical, mental-health, or fitness advice.
                  Listen to your body, go at your own pace, and consult a professional for health decisions.
                  If you ever feel unwell, please stop and seek help.
                </Lead>
                <div className="mt-6 rounded-2xl border border-border bg-surface p-4 text-[13px] leading-relaxed text-text-secondary">
                  By continuing you acknowledge that Fenom is a habit-tracking tool for general wellbeing,
                  not a substitute for professional care.
                </div>
                <NavBack onBack={back} onNext={next} nextLabel="I understand" />
              </Step>
            )}

            {/* 8 — Privacy summary */}
            {step === 8 && (
              <Step key="privacy">
                <Emblem icon={Lock} />
                <Title className="mt-7">Your data stays yours</Title>
                <Lead>The short version — the full details are in our policies.</Lead>
                <div className="mt-7 space-y-3">
                  <Feature icon={Lock} title="Encrypted & secure" desc="Your habits and photos are stored securely in your private account." />
                  <Feature icon={ShieldCheck} title="Never sold" desc="We don't sell your data or show you ads. Ever." />
                  <Feature icon={Check} title="Yours to export or delete" desc="Export or wipe everything anytime from Settings." />
                </div>
                <p className="mt-5 text-center text-[12.5px] text-text-muted">
                  Read our{" "}
                  <Link href="/privacy" className="font-medium text-accent underline-offset-2 hover:underline">Privacy Policy</Link>
                  {" "}and{" "}
                  <Link href="/terms" className="font-medium text-accent underline-offset-2 hover:underline">Terms</Link>.
                </p>
                <NavBack onBack={back} onNext={next} nextLabel="Agree & continue" />
              </Step>
            )}

            {/* 9 — Reviews */}
            {step === 9 && (
              <Step key="reviews">
                <div className="flex justify-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={20} className="fill-[var(--accent)] text-[var(--accent)]" />
                  ))}
                </div>
                <Title className="mt-4">Loved by habit-builders</Title>
                <Lead>Join thousands turning intentions into streaks.</Lead>
                <div className="mt-7 space-y-3">
                  {REVIEWS.map((r) => (
                    <div key={r.name} className="rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
                      <div className="flex gap-0.5">
                        {Array.from({ length: r.stars }).map((_, i) => (
                          <Star key={i} size={13} className="fill-[var(--accent)] text-[var(--accent)]" />
                        ))}
                      </div>
                      <p className="mt-2 text-[13.5px] leading-relaxed text-text">&ldquo;{r.quote}&rdquo;</p>
                      <p className="mt-1.5 text-[12px] font-medium text-text-muted">{r.name}</p>
                    </div>
                  ))}
                </div>
                <NavBack onBack={back} onNext={next} />
              </Step>
            )}

            {/* 10 — Pro / free trial (visual) */}
            {step === 10 && (
              <Step key="pro">
                <Emblem icon={Crown} />
                <Title className="mt-7">Unlock Fenom Pro</Title>
                <Lead>Everything you need to make it stick. Start free — cancel anytime.</Lead>
                <div className="mt-7 rounded-3xl border border-accent/40 bg-surface p-5 shadow-[var(--shadow-glow)]">
                  <div className="flex items-center gap-2">
                    <Crown size={18} className="text-accent" />
                    <span className="text-[15px] font-semibold text-text">Pro</span>
                    <span className="ml-auto text-[13px] text-text-muted"><b className="text-text">7 days free</b>, then $4.99/mo</span>
                  </div>
                  <ul className="mt-4 space-y-2.5">
                    {["Unlimited AI photo verifications", "Advanced analytics & insights", "Unlimited habits & reminders", "All 50+ achievements"].map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-[13.5px] text-text-secondary">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-soft text-accent"><Check size={12} strokeWidth={3} /></span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 space-y-2.5">
                  <Button size="lg" onClick={next} className="group w-full">
                    <Zap size={17} /> Start 7-day free trial
                  </Button>
                  <button onClick={next} className="w-full text-center text-[13px] font-medium text-text-muted transition-colors hover:text-text">
                    Continue with the free plan
                  </button>
                </div>
                <div className="mt-4 flex justify-start">
                  <button onClick={back} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:text-text">
                    <ArrowLeft size={15} /> Back
                  </button>
                </div>
              </Step>
            )}

            {/* 11 — Build your plan */}
            {step === 11 && (
              <Step key="plan">
                <Emblem icon={Flame} />
                <Title className="mt-7">Your plan is ready</Title>
                <Lead>
                  We&apos;ll set up {chosenGoals.length || 1}{" "}
                  {chosenGoals.length === 1 ? "habit" : "habits"} to start. Add, edit, or remove any of them anytime.
                </Lead>
                <div className="mt-7 space-y-2.5">
                  {(chosenGoals.length ? chosenGoals : [FOCUS_AREAS[0].goals[0]]).map((g) => {
                    const val = colorValue(g.color);
                    return (
                      <div key={g.id} className="flex items-center gap-3.5 rounded-2xl border border-border bg-surface p-3.5">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                          style={{ background: `color-mix(in oklab, ${val} 16%, transparent)`, color: val }}>
                          <HabitIcon name={g.icon} size={19} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14.5px] font-semibold text-text">{g.name}</p>
                          <p className="text-[12px] text-text-muted capitalize">{g.difficulty} · {g.frequency.type === "daily" ? "Every day" : "3× a week"}</p>
                        </div>
                        {g.verify && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10.5px] font-semibold text-accent">
                            <Camera size={11} /> Verify
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <button onClick={back} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-text">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <Button size="lg" onClick={finish} disabled={creating} className="group">
                    {creating ? "Setting up…" : <>Start my journey <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" /></>}
                  </Button>
                </div>
              </Step>
            )}

            {/* 12 — Success */}
            {step === 12 && (
              <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
                <Success />
                <h1 className="mt-8 text-[30px] font-semibold tracking-[-0.02em] text-text sm:text-[34px]">You&apos;re all set, {firstName}.</h1>
                <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-text-secondary">
                  Your momentum starts now. Let&apos;s make today count.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

/* ---------- shared bits ---------- */

function Step({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function Title({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={cn("text-balance text-center text-[26px] font-semibold leading-tight tracking-[-0.02em] text-text sm:text-[32px]", className)}>
      {children}
    </h1>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mx-auto mt-3 max-w-md text-balance text-center text-[14.5px] leading-relaxed text-text-secondary">{children}</p>;
}

function Nav({ children }: { children: React.ReactNode }) {
  return <div className="mt-9 flex items-center justify-between">{children}</div>;
}

function NavBack({ onBack, onNext, disabled, nextLabel }: { onBack: () => void; onNext: () => void; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="mt-9 flex items-center justify-between">
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[14px] font-medium text-text-secondary transition-colors hover:text-text">
        <ArrowLeft size={16} /> Back
      </button>
      <Button size="lg" onClick={onNext} disabled={disabled} className="group">
        {nextLabel ?? "Continue"}
        <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
      </Button>
    </div>
  );
}

function Emblem({ icon: Icon }: { icon: typeof Sparkles }) {
  return (
    <div className="flex justify-center">
      <motion.span
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.5, 1] }}
        className="flex h-20 w-20 items-center justify-center rounded-[1.4rem] accent-gradient text-accent-ink shadow-[var(--shadow-glow)]"
      >
        <Icon size={34} />
      </motion.span>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: typeof Sparkles; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3.5 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-sm)]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent">
        <Icon size={19} />
      </span>
      <div>
        <p className="text-[14.5px] font-semibold text-text">{title}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{desc}</p>
      </div>
    </div>
  );
}

function SelectRow({ active, onClick, title, desc }: { active: boolean; onClick: () => void; title: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-2xl border p-4 text-left transition-all",
        active ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong",
      )}
    >
      <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        active ? "border-accent bg-accent text-accent-ink" : "border-border-strong")}>
        {active && <Check size={13} strokeWidth={3} />}
      </span>
      <div>
        <p className="text-[14.5px] font-semibold text-text">{title}</p>
        <p className="text-[12.5px] text-text-muted">{desc}</p>
      </div>
    </button>
  );
}

function Success() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Confetti burst */}
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i / 14) * Math.PI * 2;
        const dist = 90 + (i % 3) * 24;
        const colors = ["#45c68e", "#67b0e0", "#e0b45c", "#a58ce0", "#e58a97"];
        return (
          <motion.span
            key={i}
            className="absolute h-2 w-2 rounded-full"
            style={{ background: colors[i % colors.length] }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: [0, 1, 0.5] }}
            transition={{ duration: 1.1, delay: 0.15, ease: "easeOut" }}
          />
        );
      })}
      <motion.span
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 13, delay: 0.1 }}
        className="flex h-24 w-24 items-center justify-center rounded-full accent-gradient text-accent-ink shadow-[var(--shadow-glow)]"
      >
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.35, type: "spring", stiffness: 300, damping: 14 }}>
          <Check size={48} strokeWidth={3} />
        </motion.span>
      </motion.span>
    </div>
  );
}
