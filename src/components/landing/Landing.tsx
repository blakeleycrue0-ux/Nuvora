"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  motion, useScroll, useTransform, useReducedMotion, useInView, AnimatePresence, useSpring,
} from "motion/react";
import { ArrowRight, ArrowDown } from "lucide-react";
import { FenomMark } from "./FenomMark";

/* ------------------------------------------------------------------ palette */
const BLACK = "#050505";
const GRAPHITE = "#111214";
const OFF = "#F2F1EC";
const BLUE = "#5b6f8f"; // matte blue, very desaturated
const BLUE_DEEP = "#263247";
const LINE = "rgba(242,241,236,0.10)";
const MUTE = "rgba(242,241,236,0.52)";
const FAINT = "rgba(242,241,236,0.32)";

/* ---------------------------------------------------------------- primitives */

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="font-mono text-[11px] tracking-[0.25em]" style={{ color: BLUE }}>{n}</span>
      <span className="h-px w-8" style={{ background: LINE }} />
      <span className="text-[11px] font-medium uppercase tracking-[0.28em]" style={{ color: MUTE }}>{children}</span>
    </div>
  );
}

// Word-by-word reveal on scroll. Respects reduced motion (renders instantly).
function Reveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <span className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: delay + i * 0.06 }}
          >
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function Counter({ to, suffix = "", className, duration = 1400 }: { to: number; suffix?: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(to); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round((1 - Math.pow(1 - p, 3)) * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);
  return <span ref={ref} className={className}>{n.toLocaleString()}{suffix}</span>;
}

// Magnetic wrapper — nudges children toward the cursor (desktop only).
function Magnetic({ children, strength = 0.35, className }: { children: React.ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 200, damping: 15 });
  const y = useSpring(0, { stiffness: 200, damping: 15 });
  const reduce = useReducedMotion();
  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ x, y }} className={className}>
      {children}
    </motion.div>
  );
}

function PrimaryCta({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Magnetic>
      <Link
        href={href}
        data-cursor="explore"
        className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[14px] font-semibold tracking-wide transition-colors"
        style={{ background: OFF, color: BLACK }}
      >
        {children}
        <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1.5" />
      </Link>
    </Magnetic>
  );
}

function GhostCta({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) {
  const cls = "group inline-flex items-center gap-3 rounded-full border px-7 py-4 text-[14px] font-semibold tracking-wide transition-colors hover:bg-[rgba(242,241,236,0.05)]";
  const style = { borderColor: LINE, color: OFF } as const;
  if (onClick) return <button onClick={onClick} className={cls} style={style} data-cursor="explore">{children}</button>;
  return <Link href={href!} className={cls} style={style} data-cursor="explore">{children}</Link>;
}

/* -------------------------------------------------------------- custom cursor */

function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState("");
  const x = useSpring(-100, { stiffness: 500, damping: 40, mass: 0.4 });
  const y = useSpring(-100, { stiffness: 500, damping: 40, mass: 0.4 });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    setEnabled(true);
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
      if (t) { setHover(true); setLabel(t.dataset.cursor === "view" ? "VIEW" : t.dataset.cursor === "explore" ? "" : ""); }
      else { setHover(false); setLabel(""); }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  if (!enabled) return null;
  return (
    <motion.div className="pointer-events-none fixed left-0 top-0 z-[100] hidden lg:block" style={{ x, y }} aria-hidden>
      <motion.div
        className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
        animate={{ width: hover ? 64 : 12, height: hover ? 64 : 12, backgroundColor: hover ? "rgba(91,111,143,0.18)" : BLUE, borderColor: hover ? BLUE : "transparent" }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        style={{ border: "1px solid" }}
      >
        {label && <span className="text-[9px] font-semibold tracking-[0.2em]" style={{ color: OFF }}>{label}</span>}
      </motion.div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------- navbar */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(5,5,5,0.6)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: `1px solid ${scrolled ? LINE : "transparent"}`,
      }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8">
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5" data-cursor="explore">
          <FenomMark size={26} accent={BLUE} bar={OFF} />
          <span className="font-display text-[17px] font-semibold tracking-tight" style={{ color: OFF }}>Fenom</span>
        </button>
        <nav className="hidden items-center gap-9 md:flex">
          {[["Product", "product"], ["Philosophy", "philosophy"], ["Progress", "progress"]].map(([l, id]) => (
            <button key={id} onClick={() => go(id)} data-cursor="explore" className="text-[12px] font-medium uppercase tracking-[0.18em] transition-colors" style={{ color: MUTE }}
              onMouseEnter={(e) => (e.currentTarget.style.color = OFF)} onMouseLeave={(e) => (e.currentTarget.style.color = MUTE)}>
              {l}
            </button>
          ))}
        </nav>
        <Magnetic>
          <Link href="/signup" data-cursor="explore" className="group inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.14em]" style={{ background: OFF, color: BLACK }}>
            Get Fenom <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Magnetic>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------------- hero */

function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yText = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const particles = useMemo(
    () => Array.from({ length: 14 }, (_, i) => ({ id: i, left: (i * 37) % 100, top: (i * 53) % 100, d: 8 + (i % 5) * 3, delay: (i % 7) * 0.6 })),
    [],
  );

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 text-center">
      {/* radial light */}
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(60% 50% at 50% 38%, rgba(91,111,143,0.10), transparent 70%)` }} />
      {/* subtle geometric baseline */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px" style={{ background: `linear-gradient(90deg, transparent, ${LINE}, transparent)` }} />
      {/* particles */}
      {!reduce && particles.map((p) => (
        <motion.span key={p.id} className="pointer-events-none absolute rounded-full" style={{ left: `${p.left}%`, top: `${p.top}%`, width: 2, height: 2, background: FAINT }}
          animate={{ y: [0, -14, 0], opacity: [0.15, 0.4, 0.15] }} transition={{ duration: p.d, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      <motion.div style={{ y: yText, opacity }} className="relative z-10 flex flex-col items-center">
        <motion.div initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
          <FenomMark size={64} accent={BLUE} bar={OFF} />
        </motion.div>

        <h1 className="font-display mt-10 text-[clamp(52px,12vw,150px)] font-semibold leading-[0.92] tracking-[-0.04em]" style={{ color: OFF }}>
          <Reveal text="SHOW UP." delay={0.15} className="block" />
          <span className="block" style={{ color: MUTE }}><Reveal text="SEE WHAT YOU" delay={0.35} /></span>
          <Reveal text="BECOME." delay={0.6} className="block" />
        </h1>

        <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1, duration: 0.8 }}
          className="mt-8 max-w-xl text-[16px] leading-relaxed sm:text-[18px]" style={{ color: MUTE }}>
          Your habits, focus and goals — turned into a visual record of the work you actually put in.
        </motion.p>

        <motion.div initial={reduce ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.3, duration: 0.7 }}
          className="mt-11 flex flex-col items-center gap-4 sm:flex-row">
          <PrimaryCta href="/signup">START SHOWING UP</PrimaryCta>
          <GhostCta onClick={() => document.getElementById("product")?.scrollIntoView({ behavior: "smooth" })}>EXPLORE FENOM</GhostCta>
        </motion.div>
      </motion.div>

      <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 text-[10px] font-medium uppercase tracking-[0.28em]" style={{ color: FAINT }}>
        Scroll to explore
        <motion.span animate={{ y: [0, 5, 0] }} transition={{ duration: 1.6, repeat: Infinity }}><ArrowDown size={13} /></motion.span>
      </motion.div>
    </section>
  );
}

/* ------------------------------------------------------------- app preview UI */
// Real Fenom UI, rendered from code with the brand blue as the accent.
function AppBoard() {
  const heat = useMemo(() => Array.from({ length: 7 * 20 }, (_, i) => {
    const v = (Math.sin(i * 1.7) + Math.cos(i * 0.6) + 2) / 4; // deterministic 0..1
    return i % 7 === 6 && i % 3 === 0 ? 0 : v;
  }), []);
  return (
    <div className="w-full rounded-[26px] border p-5 sm:p-7" style={{ background: GRAPHITE, borderColor: LINE }}>
      {/* header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: FAINT }}>Tuesday</p>
          <p className="font-display mt-1 text-[26px] font-semibold sm:text-[32px]" style={{ color: OFF }}>Good morning, Alex</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <span className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: "rgba(91,111,143,0.15)", color: BLUE }}>Lvl 12</span>
          <span className="rounded-full px-3 py-1.5 text-[12px] font-semibold" style={{ background: "rgba(242,241,236,0.06)", color: OFF }}>24 🔥</span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-6">
        {/* lifetime */}
        <div className="col-span-2 rounded-2xl p-5 sm:col-span-4" style={{ background: BLUE, color: "#0b1220" }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-70">Lifetime</p>
          <p className="font-display mt-1 text-[46px] font-semibold leading-none sm:text-[58px]">1,240</p>
          <div className="mt-4 flex items-end gap-1.5">
            {[10, 16, 12, 22, 18, 28, 20, 30, 24, 34, 26, 38].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-[3px]" style={{ height: h, background: "rgba(11,18,32,0.35)" }} />
            ))}
          </div>
        </div>
        {/* level ring */}
        <div className="col-span-2 flex flex-col items-center justify-center rounded-2xl p-5" style={{ background: "rgba(242,241,236,0.03)", border: `1px solid ${LINE}` }}>
          <Ring pct={72} size={92} />
          <p className="mt-3 text-[12px] font-semibold" style={{ color: OFF }}>Level 12</p>
          <p className="text-[11px]" style={{ color: FAINT }}>Focused</p>
        </div>
        {/* consistency */}
        <div className="col-span-2 rounded-2xl p-5 sm:col-span-3" style={{ background: "rgba(242,241,236,0.03)", border: `1px solid ${LINE}` }}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[12px] font-semibold" style={{ color: OFF }}>Consistency</span>
            <span className="text-[11px] font-semibold" style={{ color: BLUE }}>7/7</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-[9px]" style={{ color: FAINT }}>{d}</span>
                <span className="flex aspect-square w-full items-center justify-center rounded-lg text-[10px] font-bold" style={{ background: BLUE, color: "#0b1220" }}>✓</span>
              </div>
            ))}
          </div>
        </div>
        {/* heatmap */}
        <div className="col-span-2 rounded-2xl p-5 sm:col-span-3" style={{ background: "rgba(242,241,236,0.03)", border: `1px solid ${LINE}` }}>
          <span className="text-[12px] font-semibold" style={{ color: OFF }}>Activity</span>
          <div className="mt-3 grid grid-flow-col grid-rows-7 gap-1">
            {heat.map((v, i) => (
              <span key={i} className="aspect-square rounded-[2px]" style={{ background: v <= 0 ? "rgba(242,241,236,0.05)" : `rgba(91,111,143,${0.25 + v * 0.75})` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Ring({ pct, size = 100, stroke = 9, color = BLUE }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(242,241,236,0.08)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} initial={{ strokeDashoffset: c }} whileInView={{ strokeDashoffset: c * (1 - pct / 100) }}
        viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize={size * 0.24} fontWeight="700" fill={OFF}>{pct}%</text>
    </svg>
  );
}

function ProductPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 0.4, 1], reduce ? [1, 1, 1] : [0.9, 1, 1.02]);
  const blur = useTransform(scrollYProgress, [0, 0.35], reduce ? ["blur(0px)", "blur(0px)"] : ["blur(12px)", "blur(0px)"]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], reduce ? [1, 1] : [0.3, 1]);

  return (
    <section id="product" ref={ref} className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="01">The Product</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(30px,5vw,58px)] font-semibold leading-[1.02] tracking-[-0.03em]" style={{ color: OFF }}>
          <Reveal text="This is what showing up looks like." />
        </h2>
        <motion.div style={{ scale, filter: blur, opacity }} className="mx-auto mt-14 max-w-5xl will-change-transform">
          <div data-cursor="view">
            <AppBoard />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- statement */

function Statement() {
  const reduce = useReducedMotion();
  return (
    <section className="relative flex min-h-[80svh] items-center px-5 py-24" style={{ background: BLACK }}>
      <div className="mx-auto w-full max-w-[1400px]">
        <h2 className="font-display text-[clamp(48px,11vw,150px)] font-semibold leading-[0.95] tracking-[-0.04em]" style={{ color: OFF }}>
          <Reveal text="YOUR DAYS" className="block" />
          <Reveal text="BECOME" className="block" delay={0.1} />
          <span className="block">
            <span className="inline-block overflow-hidden align-bottom">
              <motion.span className="inline-block" style={{ color: BLUE }} initial={reduce ? false : { y: "110%" }} whileInView={{ y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}>
                A&nbsp;RECORD.
              </motion.span>
            </span>
          </span>
        </h2>
        <motion.p initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 max-w-md text-[17px] leading-relaxed sm:text-[19px]" style={{ color: MUTE }}>
          Most days disappear. Fenom keeps the work visible.
        </motion.p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- the system */

const SYSTEM = [
  { k: "SHOW UP", d: "Open the day. Commit to the work, however small." },
  { k: "RECORD", d: "Tick it, time it, or log the amount. It's captured." },
  { k: "BUILD", d: "Days stack into streaks. Streaks into momentum." },
  { k: "SEE", d: "Your effort becomes a visual record you can read." },
  { k: "BECOME", d: "The record is the proof of who you're turning into." },
];

function TheSystem() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  return (
    <section id="system" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="02">The System</SectionLabel>
        <div className="mt-12">
          {SYSTEM.map((s, i) => (
            <motion.button
              key={s.k}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              data-cursor="explore"
              className="group flex w-full items-baseline gap-6 border-t py-6 text-left sm:gap-10 sm:py-8"
              style={{ borderColor: LINE }}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.6, delay: i * 0.05 }}
            >
              <span className="font-mono text-[12px] tabular-nums" style={{ color: active === i ? BLUE : FAINT }}>0{i + 1}</span>
              <span
                className="font-display text-[clamp(34px,7vw,84px)] font-semibold leading-none tracking-[-0.03em] transition-all duration-500"
                style={{ color: active === i ? OFF : "rgba(242,241,236,0.28)", transform: active === i ? "translateX(8px)" : "none" }}
              >
                {s.k}
              </span>
              <AnimatePresence>
                {active === i && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    className="ml-auto hidden max-w-xs pb-2 text-right text-[14px] leading-relaxed md:block" style={{ color: MUTE }}
                  >
                    {s.d}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
          <div className="border-t" style={{ borderColor: LINE }} />
          <p className="mt-6 max-w-sm text-[14px] leading-relaxed md:hidden" style={{ color: MUTE }}>{SYSTEM[active].d}</p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ features */

function Features() {
  return (
    <section className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="03">The Product, in full</SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(30px,5vw,58px)] font-semibold leading-[1.02] tracking-[-0.03em]" style={{ color: OFF }}>
          <Reveal text="One system. Everything that builds you." />
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-6">
          {/* HABITS */}
          <FeatureCard className="md:col-span-4" label="Habits">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex-1">
                <h3 className="font-display text-[26px] font-semibold" style={{ color: OFF }}>Every kind of habit</h3>
                <p className="mt-2 max-w-sm text-[14px] leading-relaxed" style={{ color: MUTE }}>Check, count, time, or accumulate toward a goal. One tap, one play, one plus.</p>
              </div>
              <div className="flex-1 space-y-2.5">
                {[["Morning run", "check"], ["Read", "12 / 20 pages"], ["Deep work", "50m focus"], ["Ride", "2,048 / 5,000 km"]].map(([n, s], i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border p-3" style={{ borderColor: LINE, background: "rgba(242,241,236,0.02)" }}>
                    <span className="h-8 w-8 shrink-0 rounded-lg" style={{ background: `rgba(91,111,143,${0.5 - i * 0.08})` }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold" style={{ color: OFF }}>{n}</p>
                      <p className="text-[11px]" style={{ color: FAINT }}>{s}</p>
                    </div>
                    <span className="h-7 w-7 rounded-full" style={{ background: BLUE }} />
                  </div>
                ))}
              </div>
            </div>
          </FeatureCard>

          {/* STREAKS */}
          <FeatureCard className="md:col-span-2" label="Streaks">
            <h3 className="font-display text-[26px] font-semibold" style={{ color: OFF }}>Keep the chain</h3>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTE }}>Show up again. Watch the number climb.</p>
            <div className="mt-6 flex items-baseline gap-2">
              <Counter to={24} className="font-display text-[64px] font-semibold leading-none" />
              <span className="text-[16px]" style={{ color: BLUE }}>days</span>
            </div>
          </FeatureCard>

          {/* GOALS */}
          <FeatureCard className="md:col-span-2" label="Goals">
            <h3 className="font-display text-[26px] font-semibold" style={{ color: OFF }}>Long games</h3>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTE }}>Add a little, often. The total does the rest.</p>
            <div className="mt-6">
              <div className="flex justify-between text-[12px]"><span style={{ color: OFF }}>Ride 5,000 km</span><span style={{ color: BLUE }}>41%</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full" style={{ background: "rgba(242,241,236,0.06)" }}>
                <motion.div className="h-full rounded-full" style={{ background: BLUE }} initial={{ width: 0 }} whileInView={{ width: "41%" }} viewport={{ once: true }} transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
              </div>
            </div>
          </FeatureCard>

          {/* XP */}
          <FeatureCard className="md:col-span-2" label="XP & Levels">
            <h3 className="font-display text-[26px] font-semibold" style={{ color: OFF }}>Level up</h3>
            <p className="mt-2 text-[14px] leading-relaxed" style={{ color: MUTE }}>Effort turns into experience. Experience into levels.</p>
            <div className="mt-6 flex items-center gap-4">
              <Ring pct={72} size={70} stroke={7} />
              <div>
                <Counter to={12} className="font-display text-[34px] font-semibold leading-none" />
                <p className="text-[11px]" style={{ color: FAINT }}>current level</p>
              </div>
            </div>
          </FeatureCard>

          {/* PROGRESS */}
          <FeatureCard className="md:col-span-6" label="Progress">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-display text-[26px] font-semibold" style={{ color: OFF }}>Every completion, visible</h3>
                <p className="mt-2 max-w-md text-[14px] leading-relaxed" style={{ color: MUTE }}>Heatmaps, rings, an activity clock and a focus landscape — your months of work, at a glance.</p>
              </div>
              <div className="grid grid-flow-col grid-rows-7 gap-1">
                {Array.from({ length: 7 * 30 }, (_, i) => {
                  const v = (Math.sin(i * 1.3) + Math.cos(i * 0.5) + 2) / 4;
                  return <span key={i} className="h-2.5 w-2.5 rounded-[2px]" style={{ background: v < 0.25 ? "rgba(242,241,236,0.05)" : `rgba(91,111,143,${0.2 + v * 0.8})` }} />;
                })}
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ children, className, label }: { children: React.ReactNode; className?: string; label: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-8% 0px" }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-[24px] border p-6 sm:p-8 ${className ?? ""}`} style={{ borderColor: LINE, background: GRAPHITE }} data-cursor="view"
    >
      <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: BLUE }}>{label}</p>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------ focus section */

function FocusSection() {
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const total = 25 * 60;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => (l <= 1 ? (setRunning(false), 0) : l - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);
  const pct = (total - left) / total;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <section className="relative overflow-hidden px-5 py-28 sm:py-36" style={{ background: BLACK }}>
      <motion.div className="pointer-events-none absolute inset-0" animate={{ opacity: running ? 1 : 0.4 }} transition={{ duration: 1.2 }}
        style={{ background: `radial-gradient(50% 45% at 50% 45%, rgba(91,111,143,${running ? 0.16 : 0.06}), transparent 70%)` }} />
      <div className="relative mx-auto max-w-[1400px]">
        <SectionLabel n="04">Focus</SectionLabel>
        <div className="mt-10 flex flex-col items-center text-center">
          <h2 className="font-display text-[clamp(38px,8vw,110px)] font-semibold leading-none tracking-[-0.04em]" style={{ color: OFF }}>
            <Reveal text="FOCUS ON THE WORK." />
          </h2>

          <div className="relative mt-16 flex items-center justify-center">
            <motion.svg width={300} height={300} viewBox="0 0 300 300" animate={running ? { scale: [1, 1.015, 1] } : { scale: 1 }} transition={{ duration: 4, repeat: running ? Infinity : 0, ease: "easeInOut" }}>
              <circle cx={150} cy={150} r={130} fill="none" stroke="rgba(242,241,236,0.08)" strokeWidth={2} />
              <circle cx={150} cy={150} r={130} fill="none" stroke={BLUE} strokeWidth={2} strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 130} strokeDashoffset={2 * Math.PI * 130 * (1 - pct)} transform="rotate(-90 150 150)" style={{ transition: "stroke-dashoffset 1s linear" }} />
            </motion.svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-[64px] font-semibold tabular-nums leading-none" style={{ color: OFF }}>{mm}:{ss}</span>
              <span className="mt-2 text-[11px] uppercase tracking-[0.3em]" style={{ color: FAINT }}>Focus</span>
            </div>
          </div>

          <div className="mt-12 flex items-center gap-4">
            <button onClick={() => setRunning((r) => !r)} data-cursor="explore" className="inline-flex items-center gap-3 rounded-full px-7 py-4 text-[14px] font-semibold" style={{ background: OFF, color: BLACK }}>
              {running ? "PAUSE" : left === 0 ? "DONE" : "START SESSION"} {!running && left > 0 && <ArrowRight size={16} />}
            </button>
            {(left !== total) && (
              <button onClick={() => { setRunning(false); setLeft(total); }} data-cursor="explore" className="rounded-full border px-6 py-4 text-[13px] font-semibold" style={{ borderColor: LINE, color: MUTE }}>RESET</button>
            )}
          </div>
          <p className="mt-6 max-w-sm text-[13px] leading-relaxed" style={{ color: FAINT }}>Press play and Fenom counts the session for you — and marks the habit done when it ends.</p>
        </div>
      </div>
    </section>
  );
}

/* --------------------------------------------------------- progress viz + philosophy */

function ProgressViz() {
  const reduce = useReducedMotion();
  return (
    <section id="progress" className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="05">Progress</SectionLabel>
        <h2 className="font-display mt-6 text-[clamp(40px,9vw,130px)] font-semibold leading-[0.95] tracking-[-0.04em]" style={{ color: OFF }}>
          <Reveal text="SMALL DAYS." className="block" />
          <span className="block" style={{ color: MUTE }}><Reveal text="BIG CHANGE." delay={0.12} /></span>
        </h2>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {[["Days recorded", 312, ""], ["Hours focused", 1806, "h"], ["Longest streak", 128, ""]].map(([l, v, s], i) => (
            <motion.div key={i} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} className="border-t pt-6" style={{ borderColor: LINE }}>
              <Counter to={v as number} suffix={s as string} className="font-display text-[clamp(48px,7vw,92px)] font-semibold leading-none" />
              <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.22em]" style={{ color: MUTE }}>{l}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mt-16 overflow-hidden rounded-[24px] border p-6 sm:p-8" style={{ borderColor: LINE, background: GRAPHITE }}>
        <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: BLUE }}>Three years of showing up</p>
          <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto">
            {Array.from({ length: 7 * 52 }, (_, i) => {
              const year = Math.floor(i / (7 * 18));
              const base = year === 0 ? 0.12 : year === 1 ? 0.4 : 0.75;
              const v = Math.max(0, Math.min(1, base + (Math.sin(i * 1.1) * 0.25)));
              const empty = i % 7 === 6 && i % 2 === 0;
              return <span key={i} className="h-2.5 w-2.5 shrink-0 rounded-[2px]" style={{ background: empty || v < 0.15 ? "rgba(242,241,236,0.05)" : `rgba(91,111,143,${0.2 + v * 0.8})` }} />;
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Philosophy() {
  const reduce = useReducedMotion();
  return (
    <section id="philosophy" className="relative flex min-h-[90svh] items-center px-5 py-24" style={{ background: BLACK }}>
      <div className="mx-auto w-full max-w-[1400px] text-center">
        <SectionLabel n="06"><>The Philosophy</></SectionLabel>
        <div className="mt-16 flex flex-col items-center">
          <span className="font-display block text-[clamp(44px,11vw,150px)] font-semibold leading-[0.9] tracking-[-0.04em]" style={{ color: OFF }}>CONSISTENCY</span>
          <motion.span initial={reduce ? false : { scale: 0.5, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display my-2 text-[clamp(44px,11vw,150px)] font-semibold leading-none" style={{ color: BLUE }}>{">"}</motion.span>
          <span className="font-display block text-[clamp(44px,11vw,150px)] font-semibold leading-[0.9] tracking-[-0.04em]" style={{ color: "rgba(242,241,236,0.35)" }}>INTENSITY</span>
        </div>
        <motion.p initial={reduce ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.5 }}
          className="mx-auto mt-14 max-w-lg text-[16px] leading-relaxed sm:text-[19px]" style={{ color: MUTE }}>
          Intensity is easy to promise. Consistency is what changes you.
        </motion.p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------- social proof */

function SocialProof() {
  const reduce = useReducedMotion();
  const groups = ["Athletes", "Students", "Builders", "Creators", "Readers", "Learners"];
  return (
    <section className="relative px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-[1400px]">
        <SectionLabel n="07"><>Who it&apos;s for</></SectionLabel>
        <h2 className="font-display mt-6 max-w-3xl text-[clamp(34px,6vw,72px)] font-semibold leading-[1.0] tracking-[-0.03em]" style={{ color: OFF }}>
          <Reveal text="Built for people who show up." />
        </h2>
        <div className="mt-14 flex flex-wrap gap-x-3 gap-y-4">
          {groups.map((g, i) => (
            <motion.span key={g} initial={reduce ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.06 }}
              className="rounded-full border px-6 py-3 font-display text-[clamp(18px,2.5vw,30px)] font-semibold transition-colors" style={{ borderColor: LINE, color: OFF }} data-cursor="explore"
              onMouseEnter={(e) => { e.currentTarget.style.background = BLUE; e.currentTarget.style.color = "#0b1220"; e.currentTarget.style.borderColor = BLUE; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = OFF; e.currentTarget.style.borderColor = LINE; }}>
              {g}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- final + foot */

function FinalCta() {
  const reduce = useReducedMotion();
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 text-center" style={{ background: BLACK }}>
      <div className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(55% 45% at 50% 50%, rgba(91,111,143,0.12), transparent 72%)` }} />
      <motion.div initial={reduce ? false : { opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 flex flex-col items-center">
        <FenomMark size={56} accent={BLUE} bar={OFF} />
        <h2 className="font-display mt-10 text-[clamp(48px,12vw,160px)] font-semibold leading-[0.92] tracking-[-0.04em]" style={{ color: OFF }}>
          <span className="block">SHOW UP.</span>
          <span className="block" style={{ color: MUTE }}>SEE WHAT YOU</span>
          <span className="block">BECOME.</span>
        </h2>
        <p className="mt-8 max-w-md text-[16px] leading-relaxed sm:text-[18px]" style={{ color: MUTE }}>
          Start building a record of the person you&apos;re becoming.
        </p>
        <div className="mt-11"><PrimaryCta href="/signup">START SHOWING UP</PrimaryCta></div>
      </motion.div>
      <footer className="absolute inset-x-0 bottom-0 z-10 border-t px-5 py-6 sm:px-8" style={{ borderColor: LINE }}>
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-2"><FenomMark size={20} accent={BLUE} bar={OFF} /><span className="font-display text-[14px] font-semibold" style={{ color: OFF }}>Fenom</span></div>
          <span className="font-mono text-[12px] tracking-[0.2em]" style={{ color: FAINT }}>FENOM.APP</span>
          <div className="flex gap-5 text-[11px] uppercase tracking-[0.18em]" style={{ color: MUTE }}>
            <Link href="/privacy" data-cursor="explore">Privacy</Link>
            <Link href="/terms" data-cursor="explore">Terms</Link>
            <Link href="/login" data-cursor="explore">Sign in</Link>
          </div>
        </div>
      </footer>
    </section>
  );
}

/* -------------------------------------------------------------------- export */

export function Landing() {
  return (
    <main className="relative overflow-x-clip" style={{ background: BLACK, color: OFF }}>
      <CustomCursor />
      <Navbar />
      <Hero />
      <ProductPreview />
      <Statement />
      <TheSystem />
      <Features />
      <FocusSection />
      <ProgressViz />
      <Philosophy />
      <SocialProof />
      <FinalCta />
    </main>
  );
}
