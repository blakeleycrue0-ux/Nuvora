"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight, Camera, ShieldCheck, Flame, Trophy, Check, X, Lock, ChevronRight,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { HabitIcon, colorValue } from "@/lib/icons";
import { cn } from "@/lib/utils";

/* ---------------- demo data (neutral: any team, any age) ---------------- */

const HABITS = [
  { key: "sleep", label: "Descanso 8h", icon: "bed", color: "c-indigo" },
  { key: "water", label: "Hidratación", icon: "glass-water", color: "c-sky" },
  { key: "mobility", label: "Movilidad", icon: "waves", color: "c-teal" },
  { key: "extra", label: "Entreno extra", icon: "dumbbell", color: "c-rose" },
  { key: "nutrition", label: "Nutrición", icon: "salad", color: "c-emerald" },
];

interface Member {
  name: string;
  color: string;
  done: boolean[];
  streak: number;
}

const MEMBERS: Member[] = [
  { name: "Álex", color: "#45c68e", done: [true, true, true, true, true], streak: 24 },
  { name: "Marco", color: "#67b0e0", done: [true, true, true, false, true], streak: 19 },
  { name: "Nadia", color: "#a58ce0", done: [true, true, false, true, true], streak: 16 },
  { name: "Leo", color: "#e0b45c", done: [true, false, true, true, false], streak: 11 },
  { name: "Sara", color: "#e58a97", done: [true, true, false, false, true], streak: 8 },
  { name: "Iván", color: "#4fc3b8", done: [false, true, false, true, false], streak: 5 },
];

const points = (m: Member) => m.done.filter(Boolean).length * 10 + m.streak;

/* ---------------- page ---------------- */

export function TeamsLanding() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <Nav />
      <Hero />
      <Problem />
      <Audience />
      <HowItWorks />
      <Demo />
      <Value />
      <HabitCatalog />
      <Privacy />
      <Pricing />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------------- nav ---------------- */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 pt-[env(safe-area-inset-top)] sm:px-8">
        <div className="flex items-center gap-2.5">
          <Wordmark href="/teams" />
          <span className="hidden rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-text-secondary sm:inline">
            para equipos
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="#como" className="hidden text-[13.5px] text-text-secondary transition-colors hover:text-text sm:block">Cómo funciona</Link>
          <Link href="#demo" className="hidden text-[13.5px] text-text-secondary transition-colors hover:text-text sm:block">Demo</Link>
          <Link href="#precios" className="hidden text-[13.5px] text-text-secondary transition-colors hover:text-text sm:block">Precios</Link>
          <Button href="/login" size="sm">Empezar gratis</Button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- hero ---------------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28">
      <div aria-hidden className="pointer-events-none absolute -top-48 right-0 h-[520px] w-[720px] rounded-full opacity-[0.18] blur-[150px]"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 68%)" }} />
      <div className="mx-auto max-w-4xl">
        <motion.p
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="text-[13px] font-semibold uppercase tracking-[0.16em] text-accent"
        >
          La app de hábitos para tu equipo
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-4 max-w-3xl text-balance text-[40px] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[62px]"
        >
          Lo que se hace entre entrenamientos también cuenta.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-6 max-w-2xl text-[16px] leading-relaxed text-text-secondary sm:text-[19px]"
        >
          Momentum ayuda a tu equipo a construir los hábitos que marcan la diferencia —
          descanso, hidratación, nutrición, trabajo individual, mentalidad — y te da una
          forma sencilla de acompañarlos día a día. Para cualquier deporte, cualquier edad
          y cualquier nivel.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-9 flex flex-col gap-3 sm:flex-row"
        >
          <Button href="/login" size="lg" className="group w-full sm:w-auto">
            Crear un grupo gratis
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button href="#demo" variant="secondary" size="lg" className="w-full sm:w-auto">
            Ver cómo se ve
          </Button>
        </motion.div>
        <p className="mt-5 text-[13px] text-text-muted">
          Gratis para empezar · Sin descargas · Funciona en cualquier móvil
        </p>
      </div>
    </section>
  );
}

/* ---------------- problem (editorial) ---------------- */

function Problem() {
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="text-balance text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">
            Ves a tu equipo unas horas por semana. Los hábitos que deciden un partido pasan el resto del tiempo.
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-text-secondary">
            Dormir bien, comer bien, recuperar, hacer el trabajo individual, llegar con la
            cabeza puesta. Todo eso ocurre lejos del entrenamiento, donde hasta ahora no
            tenías forma de ver quién se lo toma en serio y quién necesita un empujón.
            Momentum lo hace visible — sin perseguir a nadie y sin papeleo.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { n: "3 h", l: "de contacto directo por semana, de media" },
            { n: "165 h", l: "en las que el hábito lo construye cada persona" },
            { n: "×3", l: "más constancia cuando el hábito es compartido y visible" },
            { n: "1 min", l: "al día es lo que cuesta registrar" },
          ].map((s) => (
            <div key={s.n} className="rounded-2xl border border-border bg-surface p-5">
              <p className="text-[30px] font-semibold tracking-tight">{s.n}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-text-secondary">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- audience ---------------- */

function Audience() {
  const who = [
    { t: "Clubes deportivos", d: "De fútbol, baloncesto, balonmano, atletismo, natación… cualquier disciplina y categoría." },
    { t: "Entrenadores", d: "De un solo equipo o de una cantera entera. Tú decides los hábitos que importan." },
    { t: "Escuelas y colegios", d: "Equipos escolares y de base, con hábitos adaptados a cada edad." },
    { t: "Gimnasios y academias", d: "Grupos de entrenamiento, clases y programas de preparación física." },
    { t: "Cualquier grupo", d: "Un grupo de amigos, una peña o un equipo amateur que quiere ir en serio." },
  ];
  return (
    <section className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Para quién es" title="Un equipo es un equipo, tenga la edad que tenga" subtitle="Niños o adultos, aficionado o competición, el mismo principio: los buenos hábitos, juntos, llegan más lejos." />
        <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {who.map((w) => (
            <div key={w.t} className="bg-surface p-6">
              <h3 className="text-[16px] font-semibold tracking-tight">{w.t}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">{w.d}</p>
            </div>
          ))}
          <div className="flex items-center bg-surface p-6">
            <Link href="/login" className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-accent">
              Empieza con el tuyo <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- how it works ---------------- */

function HowItWorks() {
  const steps = [
    { n: "01", title: "Crea tu grupo", desc: "En dos minutos: le pones nombre, eliges los hábitos que quieres seguir y compartes un código de invitación con tu equipo." },
    { n: "02", title: "El equipo registra el día", desc: "Cada persona marca sus hábitos desde el móvil. En los que quieras, una foto verificada por IA confirma que de verdad se hizo." },
    { n: "03", title: "Tú acompañas", desc: "Ves de un vistazo quién cumple y quién necesita apoyo, las rachas y la clasificación del grupo. Reconoces el esfuerzo y hablas con datos." },
  ];
  return (
    <section id="como" className="scroll-mt-20 border-y border-border bg-surface/40 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Cómo funciona" title="Sencillo para el equipo. Potente para quien entrena." />
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <p className="text-[15px] font-semibold text-accent">{s.n}</p>
              <div className="mt-3 h-px w-full bg-border" />
              <h3 className="mt-4 text-[19px] font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">{s.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- demo ---------------- */

function Demo() {
  const [view, setView] = useState<"coach" | "player">("coach");
  return (
    <section id="demo" className="scroll-mt-20 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Demo" title="Míralo por dentro" subtitle="La misma app, dos caras: la de quien entrena y la de cada miembro del equipo." />
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-2xl border border-border bg-surface p-1">
            {(["coach", "player"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn("relative rounded-xl px-5 py-2 text-[13.5px] font-semibold transition-colors", view === v ? "text-accent-ink" : "text-text-secondary hover:text-text")}
              >
                {view === v && <motion.span layoutId="demo-toggle" className="absolute inset-0 rounded-xl accent-gradient" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
                <span className="relative z-10">{v === "coach" ? "Quien entrena" : "Cada miembro"}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mt-8">{view === "coach" ? <CoachView /> : <PlayerView />}</div>
      </div>
    </section>
  );
}

function CoachView() {
  const ranked = [...MEMBERS].sort((a, b) => points(b) - points(a));
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-lg)]">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <p className="text-[15px] font-semibold">Hoy · Sub-16</p>
            <p className="text-[12.5px] text-text-muted">6 miembros · hábitos del día</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11.5px] font-medium text-text-secondary">
            <ShieldCheck size={12} className="text-accent" /> Sin fotos visibles
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[440px] text-left">
            <thead>
              <tr className="text-text-muted">
                <th className="p-3 text-[12px] font-medium">Miembro</th>
                {HABITS.map((h) => (
                  <th key={h.key} className="p-2 text-center">
                    <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${colorValue(h.color)} 15%, transparent)`, color: colorValue(h.color) }} title={h.label}>
                      <HabitIcon name={h.icon} size={14} />
                    </span>
                  </th>
                ))}
                <th className="p-3 text-center text-[12px] font-medium">Racha</th>
              </tr>
            </thead>
            <tbody>
              {MEMBERS.map((m) => (
                <tr key={m.name} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: m.color }}>{m.name[0]}</span>
                      <span className="text-[13.5px] font-medium">{m.name}</span>
                    </div>
                  </td>
                  {m.done.map((d, i) => (
                    <td key={i} className="p-2 text-center">
                      <span className={cn("mx-auto flex h-6 w-6 items-center justify-center rounded-full", d ? "bg-accent-soft text-accent" : "bg-danger-soft text-danger")}>
                        {d ? <Check size={13} strokeWidth={3} /> : <X size={12} strokeWidth={3} />}
                      </span>
                    </td>
                  ))}
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold"><Flame size={13} className="text-accent" />{m.streak}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-2"><Trophy size={18} className="text-accent" /><p className="text-[15px] font-semibold">Clasificación del grupo</p></div>
        <p className="mt-0.5 text-[12.5px] text-text-muted">Esta semana</p>
        <div className="mt-4 space-y-2">
          {ranked.map((m, i) => (
            <div key={m.name} className={cn("flex items-center gap-3 rounded-2xl border p-2.5", i === 0 ? "border-accent/40 bg-accent-soft" : "border-border")}>
              <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold", i === 0 ? "accent-gradient text-accent-ink" : "bg-surface-2 text-text-secondary")}>{i + 1}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: m.color }}>{m.name[0]}</span>
              <span className="flex-1 text-[13.5px] font-medium">{m.name}</span>
              <span className="text-[13px] font-semibold">{points(m)} pts</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function PlayerView() {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mx-auto max-w-sm">
      <div className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[var(--shadow-lg)]">
        <div className="accent-gradient p-5 text-accent-ink">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium opacity-80">Hola, Nadia</p>
              <p className="text-[20px] font-semibold">Sub-16</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1.5 text-[14px] font-bold"><Flame size={16} /> 16</div>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div><p className="text-[12px] font-medium opacity-80">Nivel 4 · Constante</p><p className="text-[13px] font-semibold">240 XP</p></div>
            <p className="text-[12px] font-medium opacity-80">4 de 5 hoy</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/15"><div className="h-full rounded-full bg-accent-ink/80" style={{ width: "80%" }} /></div>
        </div>
        <div className="space-y-2.5 p-4">
          {HABITS.map((h, i) => {
            const done = i < 4;
            const val = colorValue(h.color);
            return (
              <div key={h.key} className={cn("flex items-center gap-3 rounded-2xl border p-3", done ? "border-border bg-surface-2" : "border-accent/40")}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${val} 15%, transparent)`, color: val }}><HabitIcon name={h.icon} size={18} /></span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold">{h.label}</p>
                  {h.key === "extra" && <p className="flex items-center gap-1 text-[11.5px] text-accent"><Camera size={11} /> Verificar con foto</p>}
                </div>
                <span className={cn("flex h-8 w-8 items-center justify-center rounded-full", done ? "accent-gradient text-accent-ink" : "border-2 border-border-strong")}>{done && <Check size={16} strokeWidth={3} />}</span>
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-4 text-center text-[12.5px] text-text-muted">Las fotos son privadas. Quien entrena ve que se hizo, nunca la imagen.</p>
    </motion.div>
  );
}

/* ---------------- value (editorial list, less "AI card grid") ---------------- */

function Value() {
  const rows = [
    { t: "Detecta quién necesita apoyo, a tiempo", d: "Si alguien lleva días saltándose el descanso o el trabajo individual, lo ves antes de que se convierta en una lesión o un bajón de forma." },
    { t: "Reconoce el esfuerzo real", d: "El que se lo curra en casa deja de pasar desapercibido. Las rachas y la clasificación premian la constancia, no solo el talento." },
    { t: "Crea una rutina compartida", d: "Cuando todo el grupo persigue los mismos hábitos, se genera una cultura de equipo dentro y fuera del campo." },
    { t: "Menos lesiones, mejor recuperación", d: "El descanso, la hidratación y la movilidad dejan de ser un consejo que se olvida y pasan a ser un hábito que se cumple." },
    { t: "Habla con datos, no con sensaciones", d: "En la charla individual o con las familias, tienes una foto clara de la implicación de cada persona." },
    { t: "Motivación que engancha", d: "Rachas, niveles y una liguilla sana convierten cuidarse en algo que apetece hacer cada día." },
  ];
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="En qué ayuda de verdad" title="No es una app más. Es una ventaja para el equipo." />
        <div className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {rows.map((r, i) => (
            <Reveal key={r.t} delay={(i % 2) * 0.08}>
              <div className="flex gap-4">
                <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"><Check size={13} strokeWidth={3} /></span>
                <div>
                  <h3 className="text-[16.5px] font-semibold tracking-tight">{r.t}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-text-secondary">{r.d}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- habit catalog (shows breadth, any sport) ---------------- */

function HabitCatalog() {
  const groups = [
    { cat: "Físico", items: ["Entreno individual", "Movilidad y estiramientos", "Fuerza en casa", "Técnica"] },
    { cat: "Recuperación", items: ["Dormir 8 h", "Hidratación", "Descanso activo", "Sin pantallas antes de dormir"] },
    { cat: "Nutrición", items: ["Desayuno completo", "Comer verdura", "Sin ultraprocesados", "Comida pre-partido"] },
    { cat: "Mente", items: ["Visualización", "Objetivos de la semana", "Respiración", "Diario del partido"] },
    { cat: "Vida", items: ["Estudios al día", "Puntualidad", "Cuidar el material", "Actitud en el grupo"] },
  ];
  return (
    <section className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Hábitos" title="Los hábitos que tú decidas" subtitle="Elige de una lista lista para usar o crea los tuyos. Se adaptan al deporte, la edad y el nivel de tu equipo." />
        <div className="mt-10 space-y-6">
          {groups.map((g) => (
            <Reveal key={g.cat}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline">
                <p className="w-32 shrink-0 text-[13px] font-semibold uppercase tracking-[0.1em] text-text-muted">{g.cat}</p>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((it) => (
                    <span key={it} className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-text-secondary">{it}</span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- privacy ---------------- */

function Privacy() {
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-20 sm:px-8">
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-accent"><Lock size={15} /> Privacidad primero</span>
          <h2 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.02em] sm:text-[36px]">Quien entrena ve el compromiso, nunca las fotos.</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">
            Las fotos solo sirven para que la IA verifique el hábito. Son privadas: nadie del
            club las ve. El panel únicamente muestra <b className="text-text">hecho o no hecho</b> y
            las rachas. Datos mínimos, sin anuncios y sin vender información — pensado también
            para menores y sus familias.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="divide-y divide-border overflow-hidden rounded-3xl border border-border bg-surface">
            {[
              { t: "Las fotos son privadas", d: "Solo las procesa la IA y pueden borrarse automáticamente." },
              { t: "El grupo ve hecho / no hecho", d: "Cero acceso a imágenes ni a datos personales sensibles." },
              { t: "Sin anuncios, sin vender datos", d: "Nunca. La confianza de las familias es lo primero." },
              { t: "Consentimiento para menores", d: "Pensado para el deporte de base, con datos al mínimo." },
            ].map((r) => (
              <div key={r.t} className="p-5">
                <p className="text-[14.5px] font-semibold">{r.t}</p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-text-secondary">{r.d}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- pricing ---------------- */

function Pricing() {
  return (
    <section id="precios" className="scroll-mt-20 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Precios" title="Empieza gratis. Crece cuando quieras." subtitle="Sin permanencia, sin tarjeta para empezar." />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-border bg-surface p-7">
              <p className="text-[14px] font-semibold text-text-secondary">Entrenador</p>
              <p className="mt-2 text-[40px] font-semibold tracking-tight">Gratis</p>
              <p className="mt-1 text-[13px] text-text-muted">Para siempre. Un grupo.</p>
              <ul className="mt-6 flex-1 space-y-3">
                {["Hasta 30 miembros", "Hasta 5 hábitos", "Verificación por foto con IA", "Rachas, niveles y clasificación", "Panel para quien entrena", "Sin descargas"].map((f) => <Feat key={f}>{f}</Feat>)}
              </ul>
              <Button href="/login" size="lg" variant="secondary" className="mt-7 w-full">Crear mi grupo</Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-accent/40 bg-surface p-7 shadow-[var(--shadow-glow)]">
              <span className="absolute right-6 top-6 rounded-full accent-gradient px-2.5 py-1 text-[11px] font-bold text-accent-ink">Recomendado</span>
              <p className="text-[14px] font-semibold text-accent">Club</p>
              <p className="mt-2 text-[40px] font-semibold tracking-tight">A medida</p>
              <p className="mt-1 text-[13px] text-text-muted">Para clubes con varios equipos.</p>
              <ul className="mt-6 flex-1 space-y-3">
                {["Todo lo del plan gratis, y además:", "Hábitos ilimitados", "Varios grupos y equipos", "Panel del club (todos los equipos)", "Retos entre equipos", "Soporte prioritario"].map((f, i) => <Feat key={f} strong={i === 0}>{f}</Feat>)}
              </ul>
              <Button href="#contacto" size="lg" className="mt-7 w-full">Hablar con nosotros</Button>
            </div>
          </Reveal>
        </div>
        <p className="mt-6 text-center text-[12.5px] text-text-muted">¿Un piloto para tu club? Escríbenos y lo montamos gratis para la temporada.</p>
      </div>
    </section>
  );
}

/* ---------------- testimonials ---------------- */

function Testimonials() {
  const t = [
    { q: "Por fin veo quién descansa y quién no sin tener que preguntar. En la charla del lunes hablo con datos, no con sensaciones.", n: "Entrenador de fútbol base" },
    { q: "Los chavales compiten por la racha como si fuera un partido. Se cuidan porque quieren, no porque se lo mande.", n: "Preparador físico, baloncesto" },
    { q: "Lo usamos con equipos de 10 a 40 años. Se adapta a todos y las familias valoran mucho la privacidad.", n: "Director deportivo de un club" },
  ];
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Lo que dicen" title="Pensado con entrenadores de verdad" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {t.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-3xl border border-border bg-surface p-6">
                <blockquote className="flex-1 text-[15px] leading-relaxed text-text">&ldquo;{item.q}&rdquo;</blockquote>
                <figcaption className="mt-5 text-[13px] font-medium text-text-muted">{item.n}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-[12px] text-text-muted">Testimonios ilustrativos de perfiles a los que va dirigido.</p>
      </div>
    </section>
  );
}

/* ---------------- faq ---------------- */

function FAQ() {
  const qs = [
    { q: "¿Sirve para cualquier deporte y edad?", a: "Sí. Da igual el deporte, la categoría o el nivel — de niños a adultos, de base a competición. Tú eliges los hábitos y se adaptan a tu equipo." },
    { q: "¿Es de verdad gratis?", a: "Sí. Un entrenador puede crear un grupo con hasta 30 miembros, 5 hábitos y verificación por IA sin pagar nada. Solo si un club quiere más hábitos, más equipos o el panel de club hay un plan a medida." },
    { q: "¿Hay que descargar algo?", a: "No. Se abre desde el navegador y se puede añadir a la pantalla de inicio como si fuera una app. Funciona en cualquier móvil." },
    { q: "¿Quien entrena ve las fotos?", a: "Nunca. Las fotos solo las usa la IA para verificar el hábito. En el panel solo se ve si está hecho o no, y las rachas." },
    { q: "¿Y la privacidad de los menores?", a: "Datos mínimos, fotos privadas, sin anuncios y sin vender información. Diseñado teniendo en cuenta a los menores y a las familias." },
    { q: "¿Cuánto se tarda en ponerlo en marcha?", a: "Un par de minutos: creas el grupo, eliges los hábitos y compartes el código. El equipo entra con un enlace." },
  ];
  return (
    <section className="px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <SectionHead eyebrow="Dudas" title="Preguntas frecuentes" />
        <div className="mt-10 space-y-3">{qs.map((item, i) => <FAQItem key={i} {...item} />)}</div>
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

/* ---------------- final cta ---------------- */

function FinalCTA() {
  return (
    <section id="contacto" className="scroll-mt-20 px-5 py-20 sm:px-8">
      <div className="mx-auto max-w-4xl rounded-[2.5rem] border border-border bg-surface p-10 text-center shadow-[var(--shadow-lg)] sm:p-16">
        <h2 className="text-balance text-[30px] font-semibold leading-tight tracking-[-0.02em] sm:text-[42px]">Dale a tu equipo la ventaja de la constancia.</h2>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-text-secondary">Crea tu grupo gratis en dos minutos, o escríbenos para montar un piloto con tu club esta temporada.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/login" size="lg" className="group w-full sm:w-auto">Empezar gratis <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" /></Button>
          <Button href="mailto:hola@momentum.app?subject=Piloto%20Momentum%20para%20mi%20equipo" variant="secondary" size="lg" className="w-full sm:w-auto">Escribir sobre un piloto</Button>
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
    <Reveal>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      <h2 className="mt-3 max-w-2xl text-balance text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[38px]">{title}</h2>
      {subtitle && <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-text-secondary">{subtitle}</p>}
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
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}
