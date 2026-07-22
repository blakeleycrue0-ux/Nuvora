"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight, Check, Flame, Trophy, Target, TrendingUp, Sparkles, Star,
  BarChart3, Calendar, Bell, Zap, ChevronDown, Globe, AtSign, Heart,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { Ring } from "@/components/ui/Ring";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

function Reveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-bg">
      <Header />
      <Hero />
      <LogoStrip />
      <Features />
      <StatsPreview />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 border-b border-border/60 bg-bg/70 backdrop-blur-xl"
    >
      <div className="container-page flex h-16 items-center justify-between">
        <Wordmark />
        <nav className="hidden items-center gap-8 text-[14px] font-medium text-text-secondary md:flex">
          <a href="#features" className="transition-colors hover:text-text">Features</a>
          <a href="#pricing" className="transition-colors hover:text-text">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-text">FAQ</a>
        </nav>
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <Button href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">Sign in</Button>
          <Button href="/signup" size="sm">Get started</Button>
        </div>
      </div>
    </motion.header>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 80]);
  const y2 = useTransform(scrollY, [0, 500], [0, -60]);

  return (
    <section className="relative isolate overflow-hidden">
      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
          style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 40%, transparent), transparent)" }} />
        <div className="absolute right-[8%] top-[30%] h-[320px] w-[320px] rounded-full opacity-40 blur-[100px]"
          style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--accent-3) 45%, transparent), transparent)" }} />
      </div>

      <div className="container-page grid gap-14 pb-10 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-24 lg:pt-24">
        <div className="text-center lg:text-left">
          <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-text-secondary shadow-[var(--shadow-sm)]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Build habits that actually stick
          </motion.div>

          <motion.h1 variants={fadeUp} custom={1} initial="hidden" animate="show" className="text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-text sm:text-[56px] lg:text-[64px]">
            Small steps,{" "}
            <span className="accent-text">massive</span>{" "}
            momentum.
          </motion.h1>

          <motion.p variants={fadeUp} custom={2} initial="hidden" animate="show" className="mx-auto mt-6 max-w-xl text-balance text-[16px] leading-relaxed text-text-secondary sm:text-[18px] lg:mx-0">
            The beautifully designed habit tracker that turns everyday routines into
            unstoppable streaks. Track progress, earn XP, and watch your consistency compound.
          </motion.p>

          <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show" className="mt-9 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
            <Button href="/signup" size="lg" className="group w-full sm:w-auto">
              Start for free
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button href="/login" variant="secondary" size="lg" className="w-full sm:w-auto">
              Live demo
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" className="mt-8 flex items-center justify-center gap-5 text-[13px] text-text-muted lg:justify-start">
            <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-success" /> No credit card</span>
            <span className="inline-flex items-center gap-1.5"><Check size={15} className="text-success" /> Free forever plan</span>
          </motion.div>
        </div>

        {/* Animated hero illustration: floating dashboard cards */}
        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <motion.div style={{ y: y1 }} className="relative z-10">
            <HeroCard />
          </motion.div>

          <motion.div
            style={{ y: y2 }}
            initial={{ opacity: 0, scale: 0.9, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -left-4 top-8 z-20 hidden rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-lg)] sm:block"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-soft text-warning"><Flame size={20} /></span>
              <div>
                <p className="text-[20px] font-bold leading-none text-text">128</p>
                <p className="mt-1 text-[11px] text-text-muted">day streak</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -bottom-5 right-2 z-20 hidden rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-lg)] sm:flex sm:items-center sm:gap-3"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl accent-gradient text-white"><Trophy size={19} /></span>
            <div>
              <p className="text-[13px] font-bold leading-none text-text">Level 8</p>
              <p className="mt-1 text-[11px] text-text-muted">Master unlocked</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HeroCard() {
  const bars = [40, 65, 52, 80, 72, 95, 88];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-lg)]"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] text-text-muted">Today&apos;s progress</p>
          <p className="mt-0.5 text-[22px] font-bold tracking-tight text-text">Great pace 🚀</p>
        </div>
        <Ring value={78} size={72} stroke={9}>
          <span className="text-[16px] font-bold text-text">78%</span>
        </Ring>
      </div>

      <div className="mt-5 flex items-end justify-between gap-2">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 6 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.8, delay: 0.5 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="w-full rounded-lg accent-gradient"
            style={{ minHeight: 6, maxHeight: 72 }}
          />
        ))}
      </div>

      <div className="mt-5 space-y-2.5">
        {[
          { name: "Morning meditation", icon: Sparkles, done: true },
          { name: "Drink water", icon: Zap, done: true },
          { name: "Read 20 minutes", icon: Target, done: false },
        ].map((t) => (
          <div key={t.name} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 px-3.5 py-2.5">
            <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", t.done ? "accent-gradient text-white" : "bg-bg-subtle text-text-muted")}>
              <t.icon size={15} />
            </span>
            <span className={cn("flex-1 text-[13.5px] font-medium", t.done ? "text-text-muted line-through" : "text-text")}>{t.name}</span>
            <span className={cn("flex h-6 w-6 items-center justify-center rounded-full border-2", t.done ? "border-transparent accent-gradient text-white" : "border-border-strong text-transparent")}>
              <Check size={13} strokeWidth={3} />
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function LogoStrip() {
  const items = ["Consistency", "Focus", "Discipline", "Growth", "Clarity", "Balance"];
  return (
    <div className="border-y border-border/60 bg-surface/40 py-6">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-[13px] font-semibold uppercase tracking-[0.18em] text-text-muted">
        {items.map((i) => <span key={i}>{i}</span>)}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: Target, title: "Flexible habits", desc: "Daily, weekly, monthly or custom schedules. Multiple check-ins per day, difficulty levels, reminders and notes.", color: "var(--c-indigo)" },
  { icon: Flame, title: "Streaks that motivate", desc: "Track current and longest streaks per habit. Never break the chain — momentum builds automatically.", color: "var(--c-amber)" },
  { icon: BarChart3, title: "Beautiful analytics", desc: "Interactive charts, success rates, and a GitHub-style heatmap of your entire year at a glance.", color: "var(--c-sky)" },
  { icon: Trophy, title: "XP & achievements", desc: "Earn experience, level up, and unlock tiered badges. Gamification that keeps you coming back.", color: "var(--c-fuchsia)" },
  { icon: Calendar, title: "Full history", desc: "Every completion is remembered. Revisit any day and see exactly how far you've come.", color: "var(--c-emerald)" },
  { icon: Bell, title: "Smart reminders", desc: "Set the perfect time for each habit and let Momentum keep you gently on track.", color: "var(--c-rose)" },
];

function Features() {
  return (
    <section id="features" className="container-page py-20 lg:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] accent-text">Everything you need</p>
        <h2 className="mt-3 text-balance text-[32px] font-semibold leading-tight tracking-[-0.02em] text-text sm:text-[42px]">
          Designed for the way you build habits
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-text-secondary">
          Every detail is crafted to make consistency feel effortless — and even a little addictive.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={i % 3}>
            <div className="group h-full rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-md)]">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
                style={{ background: `color-mix(in oklab, ${f.color} 14%, transparent)`, color: f.color }}
              >
                <f.icon size={22} />
              </span>
              <h3 className="mt-5 text-[17px] font-semibold text-text">{f.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const STATS = [
  { value: "2.4M+", label: "Habits completed" },
  { value: "94%", label: "Stick past 30 days" },
  { value: "128", label: "Avg. best streak" },
  { value: "4.9★", label: "User rating" },
];

function StatsPreview() {
  return (
    <section className="container-page py-8">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-border p-10 shadow-[var(--shadow-md)] lg:p-14">
          <div aria-hidden className="absolute inset-0 -z-10 accent-gradient opacity-[0.06]" />
          <div aria-hidden className="absolute -right-16 -top-16 -z-10 h-64 w-64 rounded-full accent-gradient opacity-20 blur-3xl" />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i}>
                <div className="text-center lg:text-left">
                  <p className="text-[40px] font-bold tracking-[-0.03em] text-text sm:text-[48px]">
                    <span className="accent-text">{s.value}</span>
                  </p>
                  <p className="mt-1.5 text-[14px] font-medium text-text-secondary">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

const TESTIMONIALS = [
  { name: "Sofia Chen", role: "Product designer", quote: "I've tried every habit app out there. Momentum is the first one I actually kept using past week two. The design alone makes me want to check in.", color: "#6366f1" },
  { name: "Marcus Bell", role: "Software engineer", quote: "The XP system is dangerously motivating. I hit a 90-day meditation streak because I refused to lose my level progress.", color: "#d946ef" },
  { name: "Aisha Patel", role: "Founder", quote: "The heatmap is my favorite thing. Seeing a full year of green squares light up is the most satisfying feeling.", color: "#10b981" },
  { name: "Leo Nakamura", role: "Writer", quote: "Clean, fast, and beautiful. It feels like a native app from a company ten times its size.", color: "#f59e0b" },
  { name: "Emma Rossi", role: "Med student", quote: "Custom schedules and multiple check-ins per day fit my chaotic routine perfectly. Nothing else was this flexible.", color: "#0ea5e9" },
  { name: "Daniel Kim", role: "Marketer", quote: "Switched my whole team onto it. The analytics turn self-improvement into something you can actually measure.", color: "#f43f5e" },
];

function Testimonials() {
  return (
    <section className="container-page py-20 lg:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] accent-text">Loved by builders</p>
        <h2 className="mt-3 text-balance text-[32px] font-semibold leading-tight tracking-[-0.02em] text-text sm:text-[42px]">
          People don&apos;t just use Momentum. They stick with it.
        </h2>
      </Reveal>

      <div className="mt-14 columns-1 gap-5 sm:columns-2 lg:columns-3">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.name} delay={i % 3} className="mb-5 break-inside-avoid">
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
              <div className="flex gap-0.5 text-warning">
                {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={15} className="fill-current" />)}
              </div>
              <p className="mt-4 text-[14.5px] leading-relaxed text-text">{t.quote}</p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-semibold text-white" style={{ background: t.color }}>
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-[13.5px] font-semibold text-text">{t.name}</p>
                  <p className="text-[12px] text-text-muted">{t.role}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const PLANS = [
  {
    name: "Free", price: "$0", period: "forever", highlight: false,
    desc: "Everything you need to get started.",
    features: ["Up to 5 habits", "Streaks & daily tracking", "Basic analytics", "Light & dark themes", "Local, private data"],
  },
  {
    name: "Pro", price: "$6", period: "/month", highlight: true,
    desc: "For serious habit builders.",
    features: ["Unlimited habits", "Advanced analytics & heatmap", "XP, levels & achievements", "Custom schedules & reminders", "Data export & import", "Priority support"],
  },
  {
    name: "Lifetime", price: "$99", period: "once", highlight: false,
    desc: "Pay once, own it forever.",
    features: ["Everything in Pro", "One-time payment", "All future updates", "Early access to features", "Founder badge"],
  },
];

function Pricing() {
  return (
    <section id="pricing" className="container-page py-20 lg:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] accent-text">Simple pricing</p>
        <h2 className="mt-3 text-balance text-[32px] font-semibold leading-tight tracking-[-0.02em] text-text sm:text-[42px]">
          Start free. Upgrade when you&apos;re ready.
        </h2>
      </Reveal>

      <div className="mt-14 grid items-start gap-5 lg:grid-cols-3">
        {PLANS.map((p, i) => (
          <Reveal key={p.name} delay={i}>
            <div className={cn(
              "relative isolate h-full rounded-3xl border p-7 shadow-[var(--shadow-sm)] transition-all duration-300",
              p.highlight ? "border-transparent bg-surface shadow-[var(--shadow-lg)] lg:-translate-y-3" : "border-border bg-surface hover:-translate-y-1 hover:shadow-[var(--shadow-md)]",
            )}>
              {p.highlight && (
                <>
                  <div aria-hidden className="absolute inset-0 -z-10 rounded-3xl accent-gradient opacity-[0.07]" />
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full accent-gradient px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white shadow-[var(--shadow-glow)]">
                    Most popular
                  </span>
                </>
              )}
              <h3 className="text-[16px] font-semibold text-text">{p.name}</h3>
              <p className="mt-1 text-[13.5px] text-text-secondary">{p.desc}</p>
              <div className="mt-5 flex items-baseline gap-1.5">
                <span className="text-[42px] font-bold tracking-[-0.03em] text-text">{p.price}</span>
                <span className="text-[14px] text-text-muted">{p.period}</span>
              </div>
              <Button href="/signup" variant={p.highlight ? "primary" : "secondary"} className="mt-6 w-full">
                {p.name === "Free" ? "Get started" : `Choose ${p.name}`}
              </Button>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-text-secondary">
                    <Check size={17} className="mt-0.5 shrink-0 text-accent" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

const FAQS = [
  { q: "Is Momentum really free?", a: "Yes. The Free plan lets you track up to 5 habits with streaks, daily tracking, and both themes — no credit card required, forever." },
  { q: "Where is my data stored?", a: "Your data lives privately in your browser. Nothing is sent to a server, so your habits stay completely yours. Pro users can export and import at any time." },
  { q: "Can I track habits multiple times a day?", a: "Absolutely. Set a target of any number of check-ins per day, and Momentum tracks each one toward your daily goal." },
  { q: "How does the XP and level system work?", a: "Every completed habit earns XP based on its difficulty. XP fills your level bar, and hitting milestones unlocks tiered achievement badges from bronze to diamond." },
  { q: "Does it work on mobile?", a: "Momentum is fully responsive and works beautifully on any device — phone, tablet, or desktop. Add it to your home screen for an app-like experience." },
  { q: "Can I switch between light and dark mode?", a: "Yes, with a smooth animated transition. Momentum remembers your preference and even respects your system theme." },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="container-page py-20 lg:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-[13px] font-semibold uppercase tracking-[0.18em] accent-text">Questions</p>
        <h2 className="mt-3 text-balance text-[32px] font-semibold leading-tight tracking-[-0.02em] text-text sm:text-[42px]">
          Everything you might ask
        </h2>
      </Reveal>

      <div className="mx-auto mt-12 max-w-2xl space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={i % 3}>
              <div className="overflow-hidden rounded-2xl border border-border bg-surface">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-[15px] font-semibold text-text">{f.q}</span>
                  <ChevronDown size={19} className={cn("shrink-0 text-text-muted transition-transform duration-300", isOpen && "rotate-180")} />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-[14px] leading-relaxed text-text-secondary">{f.a}</p>
                </motion.div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="container-page pb-24 pt-8">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] border border-transparent px-8 py-16 text-center shadow-[var(--shadow-lg)] sm:px-14 sm:py-20">
          <div aria-hidden className="absolute inset-0 -z-10 accent-gradient" />
          <div aria-hidden className="absolute inset-0 -z-10 opacity-30"
            style={{ background: "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 40%)" }} />
          <TrendingUp size={40} className="mx-auto text-white/90" />
          <h2 className="mt-6 text-balance text-[32px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[46px]">
            Your best streak starts today.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-balance text-[16px] leading-relaxed text-white/85 sm:text-[18px]">
            Join thousands building better habits, one day at a time. It&apos;s free to start.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/signup" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-white px-7 text-[15px] font-semibold text-accent shadow-lg transition-transform hover:scale-[1.03] active:scale-[0.98]">
              Create free account
              <ArrowRight size={18} />
            </Link>
            <Link href="/login" className="inline-flex h-13 items-center justify-center rounded-2xl border border-white/40 px-7 text-[15px] font-semibold text-white transition-colors hover:bg-white/10">
              Sign in
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container-page flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Wordmark />
          <p className="text-[13px] text-text-muted">Small steps, massive momentum.</p>
        </div>
        <div className="flex items-center gap-5 text-text-muted">
          <a href="#features" className="text-[13.5px] transition-colors hover:text-text">Features</a>
          <a href="#pricing" className="text-[13.5px] transition-colors hover:text-text">Pricing</a>
          <a href="#faq" className="text-[13.5px] transition-colors hover:text-text">FAQ</a>
          <span className="h-4 w-px bg-border" />
          <a href="#" aria-label="Social" className="transition-colors hover:text-text"><AtSign size={18} /></a>
          <a href="#" aria-label="Website" className="transition-colors hover:text-text"><Globe size={18} /></a>
        </div>
      </div>
      <div className="container-page flex items-center justify-center gap-1.5 border-t border-border py-5 text-[12.5px] text-text-muted">
        <span>© {new Date().getFullYear()} Momentum. Made with</span>
        <Heart size={13} className="fill-current text-danger" />
        <span>for people who show up.</span>
      </div>
    </footer>
  );
}
