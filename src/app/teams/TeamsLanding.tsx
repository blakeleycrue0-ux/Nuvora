"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight, Camera, ShieldCheck, Flame, Trophy, Users, HeartPulse,
  Sparkles, Check, X, TrendingUp, Lock, Zap, ChevronRight,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { HabitIcon, colorValue } from "@/lib/icons";
import { cn } from "@/lib/utils";

/* ---------------- demo data ---------------- */

const HABITS = [
  { key: "water", label: "Hidratación", icon: "glass-water", color: "c-sky" },
  { key: "stretch", label: "Estiramientos", icon: "waves", color: "c-teal" },
  { key: "sleep", label: "Dormir 8h", icon: "bed", color: "c-indigo" },
  { key: "gym", label: "Gimnasio", icon: "dumbbell", color: "c-rose" },
  { key: "study", label: "Estudio", icon: "book-open", color: "c-amber" },
];

interface Player {
  name: string;
  color: string;
  done: boolean[]; // per HABITS
  streak: number;
}

const PLAYERS: Player[] = [
  { name: "Lucía", color: "#45c68e", done: [true, true, true, true, true], streak: 21 },
  { name: "Marta", color: "#67b0e0", done: [true, true, true, false, true], streak: 18 },
  { name: "Aitana", color: "#a58ce0", done: [true, true, false, true, true], streak: 15 },
  { name: "Sara", color: "#e0b45c", done: [true, false, true, true, false], streak: 9 },
  { name: "Noa", color: "#e58a97", done: [true, true, false, false, true], streak: 7 },
  { name: "Carla", color: "#4fc3b8", done: [false, true, false, true, false], streak: 4 },
];

const points = (p: Player) => p.done.filter(Boolean).length * 10 + p.streak;

/* ---------------- page ---------------- */

export function TeamsLanding() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <Hero />
      <Insight />
      <HowItWorks />
      <Demo />
      <Benefits />
      <Privacy />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------------- sections ---------------- */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 pt-[env(safe-area-inset-top)] sm:px-8">
        <div className="flex items-center gap-2.5">
          <Wordmark href="/teams" />
          <span className="hidden rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent sm:inline">
            para Equipos
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="#demo" className="hidden text-[13.5px] font-medium text-text-secondary transition-colors hover:text-text sm:block">
            Ver demo
          </Link>
          <Link href="#precios" className="hidden text-[13.5px] font-medium text-text-secondary transition-colors hover:text-text sm:block">
            Precios
          </Link>
          <Button href="/login" size="sm">Empezar gratis</Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-16 pt-16 sm:px-8 sm:pb-24 sm:pt-24">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-25 blur-[150px]"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 65%)" }} />
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[12.5px] font-medium text-text-secondary"
        >
          <span className="flex h-1.5 w-1.5 rounded-full bg-accent" /> Para clubes y entrenadores
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
          className="text-balance text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[60px]"
        >
          Los hábitos ganan partidos.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}
          className="mx-auto mt-5 max-w-xl text-balance text-[16px] leading-relaxed text-text-secondary sm:text-[18px]"
        >
          El talento entrena dos horas al día. Las campeonas cuidan las otras veintidós.
          Momentum convierte la disciplina fuera del campo en algo que tu equipo puede ver, medir y celebrar.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button href="/login" size="lg" className="group w-full sm:w-auto">
            Crear mi grupo gratis
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button href="#demo" variant="secondary" size="lg" className="w-full sm:w-auto">
            Ver la demo
          </Button>
        </motion.div>
        <p className="mt-4 text-[12.5px] text-text-muted">Gratis para empezar · Sin descargas · Sin tarjeta</p>
      </div>
    </section>
  );
}

function Insight() {
  const stats = [
    { n: "80%", l: "del rendimiento se decide fuera del entrenamiento" },
    { n: "3×", l: "más constancia cuando el hábito es visible para el equipo" },
    { n: "22h", l: "al día que un club normalmente no puede acompañar" },
  ];
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.08} className="text-center">
            <p className="text-[40px] font-semibold tracking-tight text-accent sm:text-[48px]">{s.n}</p>
            <p className="mx-auto mt-1 max-w-[220px] text-[13.5px] leading-relaxed text-text-secondary">{s.l}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Users, title: "Crea tu grupo", desc: "Eres entrenadora o club. Creas un grupo, eliges los hábitos que importan e invitas a tus jugadoras con un código. En dos minutos." },
    { icon: Camera, title: "Ellas registran y lo demuestran", desc: "Cada jugadora marca sus hábitos del día. En los que quieras, la IA verifica con una foto que de verdad lo hicieron — sin trampas." },
    { icon: TrendingUp, title: "Tú ves el compromiso", desc: "Un panel claro: quién cumple y quién no, rachas, y la liguilla del equipo. Sabes quién se lo curra en casa sin perseguir a nadie." },
  ];
  return (
    <section className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Cómo funciona" title="De la intención al hábito, en tres pasos" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.1}>
              <div className="relative h-full rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
                <span className="absolute right-5 top-5 text-[13px] font-semibold text-text-muted">0{i + 1}</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl accent-gradient text-accent-ink shadow-[var(--shadow-glow)]">
                  <s.icon size={22} />
                </span>
                <h3 className="mt-5 text-[18px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Demo() {
  const [view, setView] = useState<"player" | "coach">("coach");
  return (
    <section id="demo" className="scroll-mt-20 border-y border-border bg-surface/40 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Demo" title="Dos vistas, un mismo equipo" subtitle="Mira cómo se ve para una jugadora y para su entrenadora. Toca para cambiar." />
        {/* Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-2xl border border-border bg-bg p-1">
            {(["coach", "player"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "relative rounded-xl px-5 py-2 text-[13.5px] font-semibold transition-colors",
                  view === v ? "text-accent-ink" : "text-text-secondary hover:text-text",
                )}
              >
                {view === v && (
                  <motion.span layoutId="demo-toggle" className="absolute inset-0 rounded-xl accent-gradient" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <span className="relative z-10">{v === "coach" ? "Entrenadora" : "Jugadora"}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {view === "coach" ? <CoachView /> : <PlayerView />}
        </div>
      </div>
    </section>
  );
}

function CoachView() {
  const ranked = [...PLAYERS].sort((a, b) => points(b) - points(a));
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="grid gap-5 lg:grid-cols-[1.6fr_1fr]"
    >
      {/* Compliance grid */}
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <p className="text-[15px] font-semibold">Hoy · Alevín A</p>
            <p className="text-[12.5px] text-text-muted">6 jugadoras · hábitos del día</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-semibold text-accent">
            <ShieldCheck size={12} /> Sin fotos visibles
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] text-left">
            <thead>
              <tr className="text-text-muted">
                <th className="p-3 text-[12px] font-medium">Jugadora</th>
                {HABITS.map((h) => (
                  <th key={h.key} className="p-2 text-center">
                    <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${colorValue(h.color)} 16%, transparent)`, color: colorValue(h.color) }} title={h.label}>
                      <HabitIcon name={h.icon} size={14} />
                    </span>
                  </th>
                ))}
                <th className="p-3 text-center text-[12px] font-medium">Racha</th>
              </tr>
            </thead>
            <tbody>
              {PLAYERS.map((p) => (
                <tr key={p.name} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: p.color }}>
                        {p.name[0]}
                      </span>
                      <span className="text-[13.5px] font-medium">{p.name}</span>
                    </div>
                  </td>
                  {p.done.map((d, i) => (
                    <td key={i} className="p-2 text-center">
                      <span className={cn("mx-auto flex h-6 w-6 items-center justify-center rounded-full", d ? "bg-accent-soft text-accent" : "bg-danger-soft text-danger")}>
                        {d ? <Check size={13} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </span>
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-text">
                      <Flame size={13} className="text-accent" />{p.streak}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-accent" />
          <p className="text-[15px] font-semibold">Liguilla del equipo</p>
        </div>
        <p className="mt-0.5 text-[12.5px] text-text-muted">Esta semana</p>
        <div className="mt-4 space-y-2">
          {ranked.map((p, i) => (
            <div key={p.name} className={cn("flex items-center gap-3 rounded-2xl border p-2.5", i === 0 ? "border-accent/40 bg-accent-soft" : "border-border")}>
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold", i === 0 ? "accent-gradient text-accent-ink" : "bg-surface-2 text-text-secondary")}>
                {i + 1}
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: p.color }}>{p.name[0]}</span>
              <span className="flex-1 text-[13.5px] font-medium">{p.name}</span>
              <span className="text-[13px] font-semibold text-text">{points(p)} pts</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PlayerView() {
  const streak = 15;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="mx-auto max-w-sm"
    >
      <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[var(--shadow-lg)]">
        <div className="accent-gradient p-5 text-accent-ink">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium opacity-80">Hola, Aitana</p>
              <p className="text-[20px] font-semibold">Alevín A</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1.5 text-[14px] font-bold">
              <Flame size={16} /> {streak}
            </div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <p className="text-[12px] font-medium opacity-80">Nivel 4 · Constante</p>
              <p className="text-[13px] font-semibold">240 XP</p>
            </div>
            <p className="text-[12px] font-medium opacity-80">4 de 5 hoy</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/15">
            <div className="h-full rounded-full bg-accent-ink/80" style={{ width: "80%" }} />
          </div>
        </div>
        <div className="space-y-2.5 p-4">
          {HABITS.map((h, i) => {
            const done = i < 4;
            const val = colorValue(h.color);
            return (
              <div key={h.key} className={cn("flex items-center gap-3 rounded-2xl border p-3", done ? "border-border bg-surface-2" : "border-accent/40")}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${val} 16%, transparent)`, color: val }}>
                  <HabitIcon name={h.icon} size={18} />
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold">{h.label}</p>
                  {h.key === "gym" && <p className="flex items-center gap-1 text-[11.5px] text-accent"><Camera size={11} /> Verificar con foto</p>}
                </div>
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", done ? "accent-gradient text-accent-ink" : "border-2 border-border-strong")}>
                  {done && <Check size={16} strokeWidth={3} />}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-center text-[12.5px] text-text-muted">
        Tus fotos son solo tuyas. Tu entrenadora ve que lo hiciste, nunca la imagen.
      </p>
    </motion.div>
  );
}

function Benefits() {
  const items = [
    { icon: Camera, title: "Verificación real por IA", desc: "Una foto y la IA confirma el hábito. Compromiso demostrado, no palabras." },
    { icon: Trophy, title: "Liguilla del equipo", desc: "Una clasificación interna por constancia. La sana competición que engancha." },
    { icon: Flame, title: "Rachas y niveles", desc: "Cada día suma. Las rachas crean el hábito de no querer fallar nunca." },
    { icon: Users, title: "Energía de grupo", desc: "Cuando el equipo entero cumple, se nota dentro y fuera del campo." },
    { icon: HeartPulse, title: "Salud y descanso", desc: "Sueño, hidratación y recuperación: la base que evita lesiones y bajones." },
    { icon: Sparkles, title: "Sin fricción", desc: "Sin descargas ni App Store. Se añade a la pantalla de inicio y listo." },
  ];
  return (
    <section className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Por qué funciona" title="Todo lo que un club necesita fuera del campo" />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={(i % 3) * 0.08}>
              <div className="h-full rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <it.icon size={20} />
                </span>
                <h3 className="mt-4 text-[16px] font-semibold tracking-tight">{it.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Privacy() {
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold text-accent">
            <Lock size={13} /> Privacidad primero
          </span>
          <h2 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">
            El entrenador ve el compromiso, nunca las fotos.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
            Las jugadoras suben fotos solo para que la IA verifique el hábito. Esas imágenes
            son privadas: nadie del club las ve. El panel del entrenador únicamente muestra
            <b className="text-text"> hecho o no hecho</b>. Diseñado con menores en mente.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="space-y-3">
            {[
              { icon: ShieldCheck, t: "Fotos privadas", d: "Solo la IA las procesa. Se pueden borrar automáticamente." },
              { icon: Check, t: "El club ve hecho / no hecho", d: "Cero acceso a imágenes o datos personales sensibles." },
              { icon: Lock, t: "Sin anuncios, sin vender datos", d: "Nunca. La confianza de las familias es lo primero." },
            ].map((r) => (
              <div key={r.t} className="flex items-start gap-3.5 rounded-2xl border border-border bg-surface p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><r.icon size={19} /></span>
                <div>
                  <p className="text-[14.5px] font-semibold">{r.t}</p>
                  <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{r.d}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="precios" className="scroll-mt-20 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Precios" title="Empieza gratis. Crece cuando quieras." subtitle="Sin permanencia. Sin sorpresas." />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          {/* Free */}
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-border bg-surface p-7 shadow-[var(--shadow-sm)]">
              <p className="text-[14px] font-semibold text-text-secondary">Entrenador</p>
              <p className="mt-2 text-[40px] font-semibold tracking-tight">Gratis</p>
              <p className="mt-1 text-[13px] text-text-muted">Para siempre. Un grupo.</p>
              <ul className="mt-6 flex-1 space-y-3">
                {["Hasta 30 jugadoras", "Hasta 5 hábitos", "Verificación por foto con IA", "Rachas, niveles y liguilla", "Panel del entrenador", "Sin descargas"].map((f) => (
                  <Feat key={f}>{f}</Feat>
                ))}
              </ul>
              <Button href="/login" size="lg" variant="secondary" className="mt-7 w-full">Crear mi grupo</Button>
            </div>
          </Reveal>
          {/* Club */}
          <Reveal delay={0.1}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-accent/40 bg-surface p-7 shadow-[var(--shadow-glow)]">
              <span className="absolute right-6 top-6 rounded-full accent-gradient px-2.5 py-1 text-[11px] font-bold text-accent-ink">Recomendado</span>
              <p className="text-[14px] font-semibold text-accent">Club</p>
              <p className="mt-2 text-[40px] font-semibold tracking-tight">A medida</p>
              <p className="mt-1 text-[13px] text-text-muted">Para clubes con varios equipos.</p>
              <ul className="mt-6 flex-1 space-y-3">
                {["Todo lo del plan gratis, y además:", "Hábitos ilimitados", "Varios grupos y equipos", "Panel del club (todos los equipos)", "Retos entre equipos", "Soporte prioritario"].map((f, i) => (
                  <Feat key={f} strong={i === 0}>{f}</Feat>
                ))}
              </ul>
              <Button href="#contacto" size="lg" className="mt-7 w-full">Hablar con nosotros</Button>
            </div>
          </Reveal>
        </div>
        <p className="mt-6 text-center text-[12.5px] text-text-muted">
          ¿Piloto para tu club? Escríbenos y lo montamos gratis para la temporada.
        </p>
      </div>
    </section>
  );
}

function FAQ() {
  const qs = [
    { q: "¿Es de verdad gratis?", a: "Sí. Un entrenador puede crear un grupo con hasta 30 jugadoras, 5 hábitos y verificación por IA sin pagar nada. Solo si un club quiere más hábitos, más equipos o el panel de club, hay un plan a medida." },
    { q: "¿Las jugadoras tienen que descargar algo?", a: "No. Se abre desde el navegador y se puede añadir a la pantalla de inicio como si fuera una app. Funciona en cualquier móvil." },
    { q: "¿El entrenador ve las fotos?", a: "Nunca. Las fotos solo las usa la IA para verificar el hábito. El entrenador ve únicamente si está hecho o no, y las rachas." },
    { q: "¿Sirve para chicos también?", a: "Claro. Está pensado para cualquier equipo o grupo deportivo — de fútbol, baloncesto, lo que sea." },
    { q: "¿Y la privacidad de las menores?", a: "Datos mínimos, fotos privadas, sin anuncios y sin vender información. Diseñado teniendo en cuenta a los menores y a las familias." },
  ];
  return (
    <section className="border-t border-border px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <SectionHead eyebrow="Dudas" title="Preguntas frecuentes" />
        <div className="mt-10 space-y-3">
          {qs.map((item, i) => <FAQItem key={i} {...item} />)}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-surface">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 p-4 text-left">
        <span className="text-[14.5px] font-semibold">{q}</span>
        <ChevronRight size={18} className={cn("shrink-0 text-text-muted transition-transform", open && "rotate-90")} />
      </button>
      {open && <p className="px-4 pb-4 text-[13.5px] leading-relaxed text-text-secondary">{a}</p>}
    </div>
  );
}

function FinalCTA() {
  return (
    <section id="contacto" className="scroll-mt-20 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-border bg-surface p-10 text-center shadow-[var(--shadow-lg)] sm:p-16">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl accent-gradient text-accent-ink shadow-[var(--shadow-glow)]">
          <Zap size={26} />
        </div>
        <h2 className="text-balance text-[30px] font-semibold leading-tight tracking-[-0.02em] sm:text-[40px]">
          Dale a tu equipo la ventaja de la constancia.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-text-secondary">
          Crea tu grupo gratis en dos minutos, o escríbenos para montar un piloto con tu club esta temporada.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/login" size="lg" className="group w-full sm:w-auto">
            Empezar gratis <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button href="mailto:hola@momentum.app?subject=Piloto%20Momentum%20para%20mi%20club" variant="secondary" size="lg" className="w-full sm:w-auto">
            Escribir sobre un piloto
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Wordmark href="/teams" size="sm" />
        <div className="flex items-center gap-5 text-[13px] text-text-secondary">
          <Link href="/privacy" className="hover:text-text">Privacidad</Link>
          <Link href="/terms" className="hover:text-text">Términos</Link>
          <Link href="/login" className="hover:text-text">Entrar</Link>
        </div>
        <p className="text-[12px] text-text-muted">© {new Date().getFullYear()} Momentum</p>
      </div>
    </footer>
  );
}

/* ---------------- helpers ---------------- */

function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <Reveal className="text-center">
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      <h2 className="mx-auto mt-3 max-w-2xl text-balance text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[38px]">{title}</h2>
      {subtitle && <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-text-secondary">{subtitle}</p>}
    </Reveal>
  );
}

function Feat({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <li className={cn("flex items-start gap-2.5 text-[14px]", strong ? "font-semibold text-text" : "text-text-secondary")}>
      {!strong && <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><Check size={12} strokeWidth={3} /></span>}
      <span>{children}</span>
    </li>
  );
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
