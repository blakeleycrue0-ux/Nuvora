"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight, Camera, ShieldCheck, Flame, Trophy, Check, X, Lock, ChevronRight,
  Sparkles, Users, BarChart3, Bell, Zap,
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

interface Member { name: string; color: string; done: boolean[]; streak: number; }

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
    <div className="min-h-screen overflow-x-hidden bg-bg text-text">
      <Nav />
      <Hero />
      <StatStrip />
      <Showcase />
      <Audience />
      <HowItWorks />
      <Bento />
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
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 pt-[env(safe-area-inset-top)] sm:px-8">
        <div className="flex items-center gap-2.5">
          <Wordmark href="/teams" />
          <span className="hidden rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-text-secondary sm:inline">para equipos</span>
        </div>
        <div className="flex items-center gap-5">
          <Link href="#como" className="hidden text-[13.5px] text-text-secondary transition-colors hover:text-text md:block">Cómo funciona</Link>
          <Link href="#showcase" className="hidden text-[13.5px] text-text-secondary transition-colors hover:text-text md:block">La app</Link>
          <Link href="#precios" className="hidden text-[13.5px] text-text-secondary transition-colors hover:text-text md:block">Precios</Link>
          <Button href="/login" size="sm">Empezar gratis</Button>
        </div>
      </div>
    </header>
  );
}

/* ---------------- hero ---------------- */

function Hero() {
  return (
    <section className="relative isolate overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
      <GridPattern />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.22] blur-[150px]" style={{ background: "radial-gradient(circle, var(--accent), transparent 68%)" }} />
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* copy */}
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-[12.5px] font-medium text-text-secondary backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent" /> La app de hábitos para tu equipo
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-5 text-balance text-[42px] font-semibold leading-[1.02] tracking-[-0.03em] sm:text-[58px]">
            Lo que se hace <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">entre entrenamientos</span> también cuenta.
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }}
            className="mt-6 max-w-xl text-[16px] leading-relaxed text-text-secondary sm:text-[18px]">
            Descanso, nutrición, trabajo individual, mentalidad. Momentum convierte los
            hábitos que deciden un partido en algo que tu equipo cumple cada día — y que tú
            puedes ver. Para cualquier deporte, edad y nivel.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/login" size="lg" className="group w-full sm:w-auto">
              Crear un grupo gratis <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button href="#showcase" variant="secondary" size="lg" className="w-full sm:w-auto">Ver la app</Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 text-[13px] text-text-muted">
            Gratis para empezar · Sin descargas · Funciona en cualquier móvil
          </motion.p>
        </div>

        {/* phone mockup */}
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          className="relative mx-auto w-full max-w-[320px]">
          <div aria-hidden className="absolute inset-0 -z-10 translate-y-8 scale-90 rounded-full opacity-40 blur-[70px]" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
          <PhoneFrame><PlayerCard /></PhoneFrame>
          {/* floating chips */}
          <Floating className="-left-6 top-14 hidden sm:flex" delay={0.6}>
            <Camera size={14} className="text-accent" /> Verificado con IA
          </Floating>
          <Floating className="-right-4 bottom-24 hidden sm:flex" delay={0.8}>
            <Flame size={14} className="text-accent" /> Racha de 16 días
          </Floating>
          <Floating className="-right-6 top-6 hidden md:flex" delay={1}>
            <Trophy size={14} className="text-accent" /> 2º del equipo
          </Floating>
        </motion.div>
      </div>
    </section>
  );
}

/* ---------------- stat strip (animated) ---------------- */

function StatStrip() {
  const stats = [
    { to: 30, suffix: "", l: "miembros por grupo, gratis" },
    { to: 60, suffix: "s", l: "al día para registrar" },
    { to: 3, prefix: "×", l: "más constancia si es compartido" },
    { to: 100, suffix: "%", l: "privado: nadie ve las fotos" },
  ];
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={i} delay={i * 0.06} className="text-center">
            <p className="text-[38px] font-semibold tracking-tight sm:text-[44px]">
              {s.prefix}<CountUp to={s.to} />{s.suffix}
            </p>
            <p className="mx-auto mt-1 max-w-[160px] text-[12.5px] leading-relaxed text-text-secondary">{s.l}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------------- showcase (coach dashboard in a window) ---------------- */

function Showcase() {
  return (
    <section id="showcase" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="El panel de quien entrena" title="Todo tu equipo, de un vistazo" subtitle="Quién cumple, quién necesita un empujón, las rachas y la clasificación. Sin perseguir a nadie." center />
        <Reveal className="mt-12">
          <div className="relative">
            <div aria-hidden className="pointer-events-none absolute -inset-x-10 -bottom-10 top-20 -z-10 rounded-full opacity-30 blur-[90px]" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
            <WindowFrame title="Momentum · Panel del equipo">
              <CoachView />
            </WindowFrame>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- audience ---------------- */

function Audience() {
  const who = [
    { t: "Clubes deportivos", d: "Fútbol, baloncesto, balonmano, atletismo, natación… cualquier disciplina y categoría." },
    { t: "Entrenadores", d: "De un equipo o de una cantera entera. Tú eliges los hábitos que importan." },
    { t: "Escuelas y colegios", d: "Equipos escolares y de base, con hábitos adaptados a cada edad." },
    { t: "Gimnasios y academias", d: "Grupos de entrenamiento, clases y programas de preparación física." },
    { t: "Cualquier grupo", d: "Un grupo de amigos o un equipo amateur que quiere ir en serio." },
  ];
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Para quién es" title="Un equipo es un equipo, tenga la edad que tenga" subtitle="Niños o adultos, aficionado o competición: los buenos hábitos, juntos, llegan más lejos." />
        <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {who.map((w) => (
            <div key={w.t} className="group bg-surface p-6 transition-colors hover:bg-surface-2">
              <h3 className="text-[16px] font-semibold tracking-tight">{w.t}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">{w.d}</p>
            </div>
          ))}
          <Link href="/login" className="flex items-center gap-1.5 bg-surface p-6 text-[14px] font-semibold text-accent transition-colors hover:bg-surface-2">
            Empieza con el tuyo <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- how it works ---------------- */

function HowItWorks() {
  const steps = [
    { n: "01", title: "Crea tu grupo", desc: "Le pones nombre, eliges los hábitos y compartes un código de invitación. Dos minutos." },
    { n: "02", title: "El equipo registra el día", desc: "Cada persona marca sus hábitos. En los que quieras, una foto verificada por IA confirma que se hizo." },
    { n: "03", title: "Tú acompañas", desc: "Ves quién cumple y quién necesita apoyo, las rachas y la clasificación. Reconoces el esfuerzo con datos." },
  ];
  return (
    <section id="como" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Cómo funciona" title="Sencillo para el equipo. Potente para quien entrena." center />
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="relative">
                <span className="text-[52px] font-semibold leading-none tracking-tight text-transparent" style={{ WebkitTextStroke: "1.5px var(--border-strong)" }}>{s.n}</span>
                <h3 className="mt-4 text-[19px] font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- bento features ---------------- */

function Bento() {
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Por qué funciona" title="Diseñada para que el equipo quiera cuidarse" center />
        <div className="mt-12 grid auto-rows-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* big: verification */}
          <BentoCell className="sm:col-span-2 lg:row-span-2">
            <div className="flex h-full flex-col">
              <Tag icon={Camera}>Verificación con IA</Tag>
              <h3 className="mt-4 text-[22px] font-semibold tracking-tight">Compromiso demostrado, no palabras</h3>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-text-secondary">Una foto y la IA confirma el hábito. El que se lo curra en casa deja de pasar desapercibido — sin trampas y sin que nadie vea la imagen.</p>
              <div className="mt-6 flex flex-1 items-end">
                <MiniVerify />
              </div>
            </div>
          </BentoCell>
          {/* streak */}
          <BentoCell>
            <Tag icon={Flame}>Rachas</Tag>
            <p className="mt-4 flex items-baseline gap-2"><span className="text-[44px] font-semibold tracking-tight">24</span><span className="text-[14px] text-text-secondary">días seguidos</span></p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">Cada día suma. Nadie quiere ser quien rompe la racha del equipo.</p>
          </BentoCell>
          {/* leaderboard */}
          <BentoCell>
            <Tag icon={Trophy}>Clasificación</Tag>
            <div className="mt-4 space-y-1.5">
              {MEMBERS.slice(0, 3).map((m, i) => (
                <div key={m.name} className="flex items-center gap-2 text-[13px]">
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold", i === 0 ? "accent-gradient text-accent-ink" : "bg-surface-2 text-text-secondary")}>{i + 1}</span>
                  <span className="flex-1 font-medium">{m.name}</span>
                  <span className="text-text-muted">{points(m)}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">Una liguilla sana dentro del grupo.</p>
          </BentoCell>
          {/* insights */}
          <BentoCell>
            <Tag icon={BarChart3}>A tiempo</Tag>
            <h3 className="mt-4 text-[16px] font-semibold tracking-tight">Detecta quién flojea</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">Si alguien lleva días sin descansar, lo ves antes de que sea una lesión o un bajón.</p>
          </BentoCell>
          {/* reminders */}
          <BentoCell>
            <Tag icon={Bell}>Constancia</Tag>
            <h3 className="mt-4 text-[16px] font-semibold tracking-tight">Recordatorios diarios</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">Un aviso amable para que el hábito no se olvide. Cero spam.</p>
          </BentoCell>
          {/* no downloads */}
          <BentoCell>
            <Tag icon={Sparkles}>Sin fricción</Tag>
            <h3 className="mt-4 text-[16px] font-semibold tracking-tight">Sin descargas</h3>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">Se abre en el navegador y se añade a la pantalla de inicio. En cualquier móvil.</p>
          </BentoCell>
        </div>
      </div>
    </section>
  );
}

/* ---------------- habit catalog ---------------- */

function HabitCatalog() {
  const groups = [
    { cat: "Físico", items: ["Entreno individual", "Movilidad", "Fuerza en casa", "Técnica"] },
    { cat: "Recuperación", items: ["Dormir 8 h", "Hidratación", "Descanso activo", "Sin pantallas de noche"] },
    { cat: "Nutrición", items: ["Desayuno completo", "Verdura cada día", "Sin ultraprocesados", "Comida pre-partido"] },
    { cat: "Mente", items: ["Visualización", "Objetivos de la semana", "Respiración", "Diario del partido"] },
    { cat: "Vida", items: ["Estudios al día", "Puntualidad", "Cuidar el material", "Actitud en el grupo"] },
  ];
  return (
    <section className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Hábitos" title="Los hábitos que tú decidas" subtitle="Elige de una lista lista para usar o crea los tuyos. Se adaptan al deporte, la edad y el nivel." />
        <div className="mt-10 space-y-6">
          {groups.map((g) => (
            <Reveal key={g.cat}>
              <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-baseline">
                <p className="w-36 shrink-0 text-[13px] font-semibold uppercase tracking-[0.12em] text-text-muted">{g.cat}</p>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((it) => (
                    <span key={it} className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-text-secondary transition-colors hover:border-border-strong hover:text-text">{it}</span>
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
    <section className="border-y border-border bg-surface/40 px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-accent"><Lock size={15} /> Privacidad primero</span>
          <h2 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.02em] sm:text-[38px]">Quien entrena ve el compromiso, <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">nunca las fotos</span>.</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">Las fotos solo sirven para que la IA verifique el hábito. Son privadas: nadie del club las ve. El panel únicamente muestra <b className="text-text">hecho o no hecho</b> y las rachas. Datos mínimos, sin anuncios y sin vender información — pensado también para menores y sus familias.</p>
          <ul className="mt-6 space-y-2.5">
            {["Las fotos son privadas y pueden autoborrarse", "El grupo ve solo hecho / no hecho", "Sin anuncios, sin vender datos", "Pensado para el deporte de base"].map((t) => <Feat key={t}>{t}</Feat>)}
          </ul>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-lg)]">
            <p className="text-[13px] font-medium text-text-muted">Lo que ve quien entrena</p>
            <div className="mt-4 space-y-2.5">
              {MEMBERS.slice(0, 4).map((m) => (
                <div key={m.name} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: m.color }}>{m.name[0]}</span>
                  <span className="flex-1 text-[13.5px] font-medium">{m.name}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11.5px] text-text-muted"><Camera size={12} /> foto oculta</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent"><Check size={13} strokeWidth={3} /></span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------- pricing ---------------- */

function Pricing() {
  return (
    <section id="precios" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Precios" title="Empieza gratis. Crece cuando quieras." subtitle="Sin permanencia, sin tarjeta para empezar." center />
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
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-accent/50 bg-surface p-7 shadow-[var(--shadow-glow)]">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
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
    <section className="border-y border-border bg-surface/40 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow="Lo que dicen" title="Pensada con entrenadores de verdad" center />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {t.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-3xl border border-border bg-surface p-6">
                <div className="flex gap-0.5 text-accent">{Array.from({ length: 5 }).map((_, k) => <Sparkles key={k} size={13} className="fill-current" />)}</div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-text">&ldquo;{item.q}&rdquo;</blockquote>
                <figcaption className="mt-5 text-[13px] font-medium text-text-muted">{item.n}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-[12px] text-text-muted">Testimonios ilustrativos de los perfiles a los que va dirigido.</p>
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
    <section className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <SectionHead eyebrow="Dudas" title="Preguntas frecuentes" center />
        <div className="mt-10 space-y-3">{qs.map((item, i) => <FAQItem key={i} {...item} />)}</div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-border bg-surface transition-colors hover:border-border-strong">
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
    <section id="contacto" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-border bg-surface p-10 text-center shadow-[var(--shadow-lg)] sm:p-16">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-[90px]" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
        <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl accent-gradient text-accent-ink shadow-[var(--shadow-glow)]"><Zap size={26} /></div>
        <h2 className="relative text-balance text-[30px] font-semibold leading-tight tracking-[-0.02em] sm:text-[44px]">Dale a tu equipo la ventaja de la constancia.</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-text-secondary">Crea tu grupo gratis en dos minutos, o escríbenos para montar un piloto con tu club esta temporada.</p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
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

/* ---------------- demo views (reused in showcase) ---------------- */

function CoachView() {
  const ranked = [...MEMBERS].sort((a, b) => points(b) - points(a));
  return (
    <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
      <div className="overflow-hidden rounded-2xl border border-border bg-bg">
        <div className="flex items-center justify-between border-b border-border p-3.5">
          <div>
            <p className="text-[14px] font-semibold">Hoy · Sub-16</p>
            <p className="text-[12px] text-text-muted">6 miembros · hábitos del día</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-text-secondary"><ShieldCheck size={12} className="text-accent" /> Sin fotos</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left">
            <thead>
              <tr className="text-text-muted">
                <th className="p-2.5 text-[11.5px] font-medium">Miembro</th>
                {HABITS.map((h) => (
                  <th key={h.key} className="p-1.5 text-center">
                    <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${colorValue(h.color)} 15%, transparent)`, color: colorValue(h.color) }} title={h.label}><HabitIcon name={h.icon} size={13} /></span>
                  </th>
                ))}
                <th className="p-2.5 text-center text-[11.5px] font-medium">Racha</th>
              </tr>
            </thead>
            <tbody>
              {MEMBERS.map((m) => (
                <tr key={m.name} className="border-t border-border">
                  <td className="p-2.5">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: m.color }}>{m.name[0]}</span>
                      <span className="text-[13px] font-medium">{m.name}</span>
                    </div>
                  </td>
                  {m.done.map((d, i) => (
                    <td key={i} className="p-1.5 text-center">
                      <span className={cn("mx-auto flex h-5 w-5 items-center justify-center rounded-full", d ? "bg-accent-soft text-accent" : "bg-danger-soft text-danger")}>{d ? <Check size={12} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}</span>
                    </td>
                  ))}
                  <td className="p-2.5 text-center"><span className="inline-flex items-center gap-1 text-[12.5px] font-semibold"><Flame size={12} className="text-accent" />{m.streak}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-bg p-4">
        <div className="flex items-center gap-2"><Trophy size={16} className="text-accent" /><p className="text-[14px] font-semibold">Clasificación</p></div>
        <p className="mt-0.5 text-[12px] text-text-muted">Esta semana</p>
        <div className="mt-3 space-y-1.5">
          {ranked.map((m, i) => (
            <div key={m.name} className={cn("flex items-center gap-2.5 rounded-xl border p-2", i === 0 ? "border-accent/40 bg-accent-soft" : "border-border")}>
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", i === 0 ? "accent-gradient text-accent-ink" : "bg-surface-2 text-text-secondary")}>{i + 1}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: m.color }}>{m.name[0]}</span>
              <span className="flex-1 text-[13px] font-medium">{m.name}</span>
              <span className="text-[12.5px] font-semibold">{points(m)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerCard() {
  return (
    <div className="flex h-full flex-col">
      <div className="accent-gradient p-5 text-accent-ink">
        <div className="flex items-center justify-between">
          <div><p className="text-[12.5px] font-medium opacity-80">Hola, Nadia</p><p className="text-[19px] font-semibold">Sub-16</p></div>
          <div className="flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1.5 text-[13.5px] font-bold"><Flame size={15} /> 16</div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div><p className="text-[11.5px] font-medium opacity-80">Nivel 4 · Constante</p><p className="text-[12.5px] font-semibold">240 XP</p></div>
          <p className="text-[11.5px] font-medium opacity-80">4 de 5 hoy</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/15"><div className="h-full rounded-full bg-accent-ink/80" style={{ width: "80%" }} /></div>
      </div>
      <div className="flex-1 space-y-2 bg-surface p-3.5">
        {HABITS.map((h, i) => {
          const done = i < 4;
          const val = colorValue(h.color);
          return (
            <div key={h.key} className={cn("flex items-center gap-2.5 rounded-xl border p-2.5", done ? "border-border bg-surface-2" : "border-accent/40")}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${val} 15%, transparent)`, color: val }}><HabitIcon name={h.icon} size={16} /></span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold">{h.label}</p>
                {h.key === "extra" && <p className="flex items-center gap-1 text-[10.5px] text-accent"><Camera size={10} /> Verificar con foto</p>}
              </div>
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", done ? "accent-gradient text-accent-ink" : "border-2 border-border-strong")}>{done && <Check size={14} strokeWidth={3} />}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- visual helpers ---------------- */

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[2.6rem] border border-border-strong bg-bg p-2.5 shadow-[var(--shadow-lg)]">
      <div className="absolute left-1/2 top-2.5 z-10 h-5 w-24 -translate-x-1/2 rounded-b-2xl bg-bg" />
      <div className="overflow-hidden rounded-[2rem] border border-border">{children}</div>
    </div>
  );
}

function WindowFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-lg)]">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-danger/60" />
        <span className="h-3 w-3 rounded-full bg-[var(--accent-2)]/60" />
        <span className="h-3 w-3 rounded-full bg-border-strong" />
        <p className="ml-3 text-[12.5px] text-text-muted">{title}</p>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

function Floating({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.5 }}
      className={cn("absolute z-20 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-[12px] font-semibold text-text shadow-[var(--shadow-lg)] backdrop-blur", className)}
    >
      {children}
    </motion.div>
  );
}

function BentoCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <Reveal className={className}>
      <div className="h-full rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-border-strong">{children}</div>
    </Reveal>
  );
}

function Tag({ icon: Icon, children }: { icon: typeof Camera; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-semibold text-accent"><Icon size={12} /> {children}</span>;
}

function MiniVerify() {
  return (
    <div className="w-full rounded-2xl border border-border bg-bg p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/15 text-[var(--c-rose,#e58a97)]" style={{ color: "#e58a97", background: "color-mix(in oklab, #e58a97 15%, transparent)" }}><HabitIcon name="dumbbell" size={20} /></span>
        <div className="flex-1">
          <p className="text-[13.5px] font-semibold">Entreno extra</p>
          <p className="text-[11.5px] text-text-muted">Foto enviada · analizando…</p>
        </div>
        <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 14 }}
          className="flex h-8 w-8 items-center justify-center rounded-full accent-gradient text-accent-ink"><Check size={16} strokeWidth={3} /></motion.span>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-[12px] font-medium text-accent"><ShieldCheck size={13} /> Verificado — la foto no se comparte</div>
    </div>
  );
}

function GridPattern() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]"
      style={{
        backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        maskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 40%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 40%, transparent 80%)",
      }} />
  );
}

/* ---------------- primitives ---------------- */

function SectionHead({ eyebrow, title, subtitle, center }: { eyebrow: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <Reveal className={center ? "text-center" : undefined}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>
      <h2 className={cn("mt-3 text-balance text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[38px]", center ? "mx-auto max-w-2xl" : "max-w-2xl")}>{title}</h2>
      {subtitle && <p className={cn("mt-3 text-[15px] leading-relaxed text-text-secondary", center ? "mx-auto max-w-xl" : "max-w-xl")}>{subtitle}</p>}
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

function CountUp({ to }: { to: number }) {
  const [val, setVal] = useState(0);
  const started = useRef(false);
  return (
    <motion.span
      viewport={{ once: true }}
      onViewportEnter={() => {
        if (started.current) return;
        started.current = true;
        const start = performance.now();
        const dur = 1300;
        const tick = (now: number) => {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          setVal(Math.round(to * eased));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }}
    >
      {val}
    </motion.span>
  );
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>
      {children}
    </motion.div>
  );
}
