"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight, Camera, ShieldCheck, Flame, Trophy, Check, X, Lock, ChevronRight,
  Sparkles, BarChart3, Bell, Zap,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { HabitIcon, colorValue } from "@/lib/icons";
import { cn } from "@/lib/utils";

/* ================= i18n ================= */

type Lang = "es" | "en";

const COPY = {
  es: {
    nav: { badge: "para equipos", how: "Cómo funciona", app: "La app", pricing: "Precios", cta: "Empezar gratis" },
    hero: {
      badge: "La app de hábitos para tu equipo",
      h1a: "Lo que se hace ", h1grad: "entre entrenamientos", h1b: " también cuenta.",
      p: "Descanso, nutrición, trabajo individual, mentalidad. Fenom convierte los hábitos que deciden un partido en algo que tu equipo cumple cada día — y que tú puedes ver. Para cualquier deporte, edad y nivel.",
      cta1: "Crear un grupo gratis", cta2: "Ver la app",
      fine: "Gratis para empezar · Sin descargas · Funciona en cualquier móvil",
      chipAI: "Verificado con IA", chipStreak: "Racha de 16 días", chipRank: "2º del equipo",
    },
    stats: [
      { l: "miembros por grupo, gratis" }, { l: "al día para registrar" },
      { l: "más constancia si es compartido" }, { l: "privado: nadie ve las fotos" },
    ],
    showcase: { eyebrow: "El panel de quien entrena", title: "Todo tu equipo, de un vistazo", sub: "Quién cumple, quién necesita un empujón, las rachas y la clasificación. Sin perseguir a nadie.", window: "Fenom · Panel del equipo" },
    demo: {
      today: "Hoy · Sub-16", members: "6 miembros · hábitos del día", nophotos: "Sin fotos",
      member: "Miembro", streak: "Racha", standings: "Clasificación", week: "Esta semana",
      habits: ["Descanso 8h", "Hidratación", "Movilidad", "Entreno extra", "Nutrición"],
      hi: "Hola, Nadia", team: "Sub-16", level: "Nivel 4 · Constante", today2: "4 de 5 hoy", verify: "Verificar con foto",
      privateNote: "Las fotos son privadas. Quien entrena ve que se hizo, nunca la imagen.",
    },
    audience: {
      eyebrow: "Para quién es", title: "Un equipo es un equipo, tenga la edad que tenga",
      sub: "Niños o adultos, aficionado o competición: los buenos hábitos, juntos, llegan más lejos.",
      items: [
        { t: "Clubes deportivos", d: "Fútbol, baloncesto, balonmano, atletismo, natación… cualquier disciplina y categoría." },
        { t: "Entrenadores", d: "De un equipo o de una cantera entera. Tú eliges los hábitos que importan." },
        { t: "Escuelas y colegios", d: "Equipos escolares y de base, con hábitos adaptados a cada edad." },
        { t: "Gimnasios y academias", d: "Grupos de entrenamiento, clases y programas de preparación física." },
        { t: "Cualquier grupo", d: "Un grupo de amigos o un equipo amateur que quiere ir en serio." },
      ],
      start: "Empieza con el tuyo",
    },
    how: {
      eyebrow: "Cómo funciona", title: "Sencillo para el equipo. Potente para quien entrena.",
      steps: [
        { t: "Crea tu grupo", d: "Le pones nombre, eliges los hábitos y compartes un código de invitación. Dos minutos." },
        { t: "El equipo registra el día", d: "Cada persona marca sus hábitos. En los que quieras, una foto verificada por IA confirma que se hizo." },
        { t: "Tú acompañas", d: "Ves quién cumple y quién necesita apoyo, las rachas y la clasificación. Reconoces el esfuerzo con datos." },
      ],
    },
    bento: {
      eyebrow: "Por qué funciona", title: "Diseñada para que el equipo quiera cuidarse",
      verifTag: "Verificación con IA", verifH: "Compromiso demostrado, no palabras",
      verifP: "Una foto y la IA confirma el hábito. El que se lo curra en casa deja de pasar desapercibido — sin trampas y sin que nadie vea la imagen.",
      streakTag: "Rachas", streakUnit: "días seguidos", streakP: "Cada día suma. Nadie quiere ser quien rompe la racha del equipo.",
      standTag: "Clasificación", standP: "Una liguilla sana dentro del grupo.",
      insightTag: "A tiempo", insightH: "Detecta quién flojea", insightP: "Si alguien lleva días sin descansar, lo ves antes de que sea una lesión o un bajón.",
      remindTag: "Constancia", remindH: "Recordatorios diarios", remindP: "Un aviso amable para que el hábito no se olvide. Cero spam.",
      frictionTag: "Sin fricción", frictionH: "Sin descargas", frictionP: "Se abre en el navegador y se añade a la pantalla de inicio. En cualquier móvil.",
      miniHabit: "Entreno extra", miniStatus: "Foto enviada · analizando…", miniVerified: "Verificado — la foto no se comparte",
    },
    catalog: {
      eyebrow: "Hábitos", title: "Los hábitos que tú decidas",
      sub: "Elige de una lista lista para usar o crea los tuyos. Se adaptan al deporte, la edad y el nivel.",
      groups: [
        { cat: "Físico", items: ["Entreno individual", "Movilidad", "Fuerza en casa", "Técnica"] },
        { cat: "Recuperación", items: ["Dormir 8 h", "Hidratación", "Descanso activo", "Sin pantallas de noche"] },
        { cat: "Nutrición", items: ["Desayuno completo", "Verdura cada día", "Sin ultraprocesados", "Comida pre-partido"] },
        { cat: "Mente", items: ["Visualización", "Objetivos de la semana", "Respiración", "Diario del partido"] },
        { cat: "Vida", items: ["Estudios al día", "Puntualidad", "Cuidar el material", "Actitud en el grupo"] },
      ],
    },
    privacy: {
      badge: "Privacidad primero", titleA: "Quien entrena ve el compromiso, ", titleGrad: "nunca las fotos", titleB: ".",
      p: "Las fotos solo sirven para que la IA verifique el hábito. Son privadas: nadie del club las ve. El panel únicamente muestra hecho o no hecho y las rachas. Datos mínimos, sin anuncios y sin vender información — pensado también para menores y sus familias.",
      feats: ["Las fotos son privadas y pueden autoborrarse", "El grupo ve solo hecho / no hecho", "Sin anuncios, sin vender datos", "Pensado para el deporte de base"],
      panel: "Lo que ve quien entrena", photoHidden: "foto oculta",
    },
    pricing: {
      eyebrow: "Precios", title: "Empieza gratis. Crece cuando quieras.", sub: "Sin permanencia, sin tarjeta para empezar.",
      freeLabel: "Entrenador", freePrice: "Gratis", freeNote: "Para siempre. Un grupo.",
      freeFeats: ["Hasta 30 miembros", "Hasta 5 hábitos", "Verificación por foto con IA", "Rachas, niveles y clasificación", "Panel para quien entrena", "Sin descargas"],
      freeCta: "Crear mi grupo",
      clubLabel: "Club", clubPrice: "A medida", clubNote: "Para clubes con varios equipos.", clubBadge: "Recomendado",
      clubFeats: ["Todo lo del plan gratis, y además:", "Hábitos ilimitados", "Varios grupos y equipos", "Panel del club (todos los equipos)", "Retos entre equipos", "Soporte prioritario"],
      clubCta: "Hablar con nosotros",
      foot: "¿Un piloto para tu club? Escríbenos y lo montamos gratis para la temporada.",
    },
    testi: {
      eyebrow: "Lo que dicen", title: "Pensada con entrenadores de verdad",
      items: [
        { q: "Por fin veo quién descansa y quién no sin tener que preguntar. En la charla del lunes hablo con datos, no con sensaciones.", n: "Entrenador de fútbol base" },
        { q: "Los chavales compiten por la racha como si fuera un partido. Se cuidan porque quieren, no porque se lo mande.", n: "Preparador físico, baloncesto" },
        { q: "Lo usamos con equipos de 10 a 40 años. Se adapta a todos y las familias valoran mucho la privacidad.", n: "Director deportivo de un club" },
      ],
      foot: "Testimonios ilustrativos de los perfiles a los que va dirigido.",
    },
    faq: {
      eyebrow: "Dudas", title: "Preguntas frecuentes",
      qs: [
        { q: "¿Sirve para cualquier deporte y edad?", a: "Sí. Da igual el deporte, la categoría o el nivel — de niños a adultos, de base a competición. Tú eliges los hábitos y se adaptan a tu equipo." },
        { q: "¿Es de verdad gratis?", a: "Sí. Un entrenador puede crear un grupo con hasta 30 miembros, 5 hábitos y verificación por IA sin pagar nada. Solo si un club quiere más hábitos, más equipos o el panel de club hay un plan a medida." },
        { q: "¿Hay que descargar algo?", a: "No. Se abre desde el navegador y se puede añadir a la pantalla de inicio como si fuera una app. Funciona en cualquier móvil." },
        { q: "¿Quien entrena ve las fotos?", a: "Nunca. Las fotos solo las usa la IA para verificar el hábito. En el panel solo se ve si está hecho o no, y las rachas." },
        { q: "¿Y la privacidad de los menores?", a: "Datos mínimos, fotos privadas, sin anuncios y sin vender información. Diseñado teniendo en cuenta a los menores y a las familias." },
        { q: "¿Cuánto se tarda en ponerlo en marcha?", a: "Un par de minutos: creas el grupo, eliges los hábitos y compartes el código. El equipo entra con un enlace." },
      ],
    },
    cta: {
      title: "Dale a tu equipo la ventaja de la constancia.",
      p: "Crea tu grupo gratis en dos minutos, o escríbenos para montar un piloto con tu club esta temporada.",
      cta1: "Empezar gratis", cta2: "Escribir sobre un piloto", subject: "Piloto%20Fenom%20para%20mi%20equipo",
    },
    footer: { privacy: "Privacidad", terms: "Términos", login: "Entrar" },
  },

  en: {
    nav: { badge: "for teams", how: "How it works", app: "The app", pricing: "Pricing", cta: "Start free" },
    hero: {
      badge: "The habit app for your team",
      h1a: "What happens ", h1grad: "between training", h1b: " counts too.",
      p: "Rest, nutrition, individual work, mindset. Fenom turns the habits that decide a game into something your team does every day — and that you can see. For any sport, age and level.",
      cta1: "Create a group free", cta2: "See the app",
      fine: "Free to start · No downloads · Works on any phone",
      chipAI: "AI-verified", chipStreak: "16-day streak", chipRank: "2nd on the team",
    },
    stats: [
      { l: "members per group, free" }, { l: "a day to check in" },
      { l: "more consistency when shared" }, { l: "private: nobody sees the photos" },
    ],
    showcase: { eyebrow: "The coach's dashboard", title: "Your whole team, at a glance", sub: "Who's on track, who needs a nudge, streaks and standings. Without chasing anyone.", window: "Fenom · Team dashboard" },
    demo: {
      today: "Today · U-16", members: "6 members · today's habits", nophotos: "No photos",
      member: "Member", streak: "Streak", standings: "Standings", week: "This week",
      habits: ["Sleep 8h", "Hydration", "Mobility", "Extra training", "Nutrition"],
      hi: "Hi, Nadia", team: "U-16", level: "Level 4 · Consistent", today2: "4 of 5 today", verify: "Verify with photo",
      privateNote: "Photos are private. The coach sees that it was done, never the image.",
    },
    audience: {
      eyebrow: "Who it's for", title: "A team is a team, whatever the age",
      sub: "Kids or adults, amateur or elite: good habits, together, go further.",
      items: [
        { t: "Sports clubs", d: "Football, basketball, handball, athletics, swimming… any discipline and category." },
        { t: "Coaches", d: "From one team to a whole academy. You choose the habits that matter." },
        { t: "Schools", d: "School and youth teams, with habits suited to each age." },
        { t: "Gyms & academies", d: "Training groups, classes and conditioning programs." },
        { t: "Any group", d: "A group of friends or an amateur team that wants to get serious." },
      ],
      start: "Start with yours",
    },
    how: {
      eyebrow: "How it works", title: "Simple for the team. Powerful for the coach.",
      steps: [
        { t: "Create your group", d: "Name it, pick the habits and share an invite code. Two minutes." },
        { t: "The team checks in", d: "Everyone marks their habits. On the ones you choose, an AI-verified photo confirms it was done." },
        { t: "You coach", d: "You see who's on track and who needs support, streaks and standings. You reward effort with data." },
      ],
    },
    bento: {
      eyebrow: "Why it works", title: "Built so the team wants to take care of itself",
      verifTag: "AI verification", verifH: "Commitment proven, not just promised",
      verifP: "A photo and the AI confirms the habit. Whoever puts in the work at home stops going unnoticed — no cheating, and nobody sees the image.",
      streakTag: "Streaks", streakUnit: "days in a row", streakP: "Every day counts. Nobody wants to be the one who breaks the team's streak.",
      standTag: "Standings", standP: "A friendly league inside the group.",
      insightTag: "In time", insightH: "Spot who's slipping", insightP: "If someone hasn't rested for days, you see it before it becomes an injury or a slump.",
      remindTag: "Consistency", remindH: "Daily reminders", remindP: "A gentle nudge so the habit isn't forgotten. Zero spam.",
      frictionTag: "No friction", frictionH: "No downloads", frictionP: "Opens in the browser and adds to the home screen. On any phone.",
      miniHabit: "Extra training", miniStatus: "Photo sent · analyzing…", miniVerified: "Verified — the photo isn't shared",
    },
    catalog: {
      eyebrow: "Habits", title: "The habits you decide",
      sub: "Pick from a ready-made list or create your own. They adapt to the sport, age and level.",
      groups: [
        { cat: "Physical", items: ["Individual training", "Mobility", "Strength at home", "Technique"] },
        { cat: "Recovery", items: ["Sleep 8h", "Hydration", "Active rest", "No screens at night"] },
        { cat: "Nutrition", items: ["Full breakfast", "Veg every day", "No junk food", "Pre-game meal"] },
        { cat: "Mind", items: ["Visualization", "Weekly goals", "Breathing", "Match journal"] },
        { cat: "Life", items: ["Schoolwork on track", "Punctuality", "Care for kit", "Attitude in the group"] },
      ],
    },
    privacy: {
      badge: "Privacy first", titleA: "The coach sees the commitment, ", titleGrad: "never the photos", titleB: ".",
      p: "Photos are only used for the AI to verify the habit. They're private: nobody at the club sees them. The dashboard shows only done or not done, and streaks. Minimal data, no ads and no selling information — designed with minors and their families in mind.",
      feats: ["Photos are private and can auto-delete", "The group sees only done / not done", "No ads, no data selling", "Built for grassroots sport"],
      panel: "What the coach sees", photoHidden: "photo hidden",
    },
    pricing: {
      eyebrow: "Pricing", title: "Start free. Grow when you want.", sub: "No commitment, no card to start.",
      freeLabel: "Coach", freePrice: "Free", freeNote: "Forever. One group.",
      freeFeats: ["Up to 30 members", "Up to 5 habits", "AI photo verification", "Streaks, levels and standings", "Coach dashboard", "No downloads"],
      freeCta: "Create my group",
      clubLabel: "Club", clubPrice: "Custom", clubNote: "For clubs with several teams.", clubBadge: "Recommended",
      clubFeats: ["Everything in Free, plus:", "Unlimited habits", "Multiple groups and teams", "Club dashboard (all teams)", "Team-vs-team challenges", "Priority support"],
      clubCta: "Talk to us",
      foot: "A pilot for your club? Write to us and we'll set it up free for the season.",
    },
    testi: {
      eyebrow: "What they say", title: "Built with real coaches",
      items: [
        { q: "I finally see who rests and who doesn't without having to ask. In the Monday talk I speak with data, not gut feeling.", n: "Youth football coach" },
        { q: "The kids compete for the streak like it's a game. They take care of themselves because they want to, not because I tell them.", n: "Strength coach, basketball" },
        { q: "We use it with teams aged 10 to 40. It adapts to everyone and families really value the privacy.", n: "Club sporting director" },
      ],
      foot: "Illustrative testimonials from the intended audience.",
    },
    faq: {
      eyebrow: "FAQ", title: "Frequently asked questions",
      qs: [
        { q: "Does it work for any sport and age?", a: "Yes. Whatever the sport, category or level — from kids to adults, grassroots to elite. You choose the habits and they adapt to your team." },
        { q: "Is it really free?", a: "Yes. A coach can create a group with up to 30 members, 5 habits and AI verification at no cost. Only if a club wants more habits, more teams or the club dashboard is there a custom plan." },
        { q: "Does anyone have to download anything?", a: "No. It opens in the browser and can be added to the home screen like an app. It works on any phone." },
        { q: "Does the coach see the photos?", a: "Never. Photos are only used by the AI to verify the habit. The dashboard shows only whether it's done, and streaks." },
        { q: "What about minors' privacy?", a: "Minimal data, private photos, no ads and no selling information. Designed with minors and their families in mind." },
        { q: "How long does it take to set up?", a: "A couple of minutes: create the group, pick the habits and share the code. The team joins with a link." },
      ],
    },
    cta: {
      title: "Give your team the edge of consistency.",
      p: "Create your group free in two minutes, or write to us to set up a pilot with your club this season.",
      cta1: "Start free", cta2: "Ask about a pilot", subject: "Fenom%20pilot%20for%20my%20team",
    },
    footer: { privacy: "Privacy", terms: "Terms", login: "Log in" },
  },
};

type Copy = (typeof COPY)["es"];
const LangContext = createContext<{ lang: Lang; c: Copy; setLang: (l: Lang) => void }>({ lang: "es", c: COPY.es, setLang: () => {} });
const useT = () => useContext(LangContext);

/* ================= demo data ================= */

const HABIT_META = [
  { key: "sleep", icon: "bed", color: "c-indigo" },
  { key: "water", icon: "glass-water", color: "c-sky" },
  { key: "mobility", icon: "waves", color: "c-teal" },
  { key: "extra", icon: "dumbbell", color: "c-rose" },
  { key: "nutrition", icon: "salad", color: "c-emerald" },
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

/* ================= page ================= */

export function TeamsLanding() {
  const [lang, setLang] = useState<Lang>("es");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("momentum-teams-lang") as Lang | null;
      if (saved === "es" || saved === "en") setLang(saved); // eslint-disable-line react-hooks/set-state-in-effect
    } catch {}
  }, []);
  const choose = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem("momentum-teams-lang", l); } catch {}
  };

  return (
    <LangContext.Provider value={{ lang, c: COPY[lang], setLang: choose }}>
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
    </LangContext.Provider>
  );
}

/* ================= nav ================= */

function LangToggle() {
  const { lang, setLang } = useT();
  return (
    <div className="inline-flex rounded-full border border-border bg-surface p-0.5 text-[12px] font-semibold">
      {(["es", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={cn("relative rounded-full px-2.5 py-1 uppercase transition-colors", lang === l ? "text-accent-ink" : "text-text-muted hover:text-text")}
          aria-pressed={lang === l}
        >
          {lang === l && <motion.span layoutId="lang-pill" className="absolute inset-0 rounded-full accent-gradient" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
          <span className="relative z-10">{l}</span>
        </button>
      ))}
    </div>
  );
}

function Nav() {
  const { c } = useT();
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-5 pt-[env(safe-area-inset-top)] sm:px-8">
        <div className="flex items-center gap-2.5">
          <Wordmark href="/teams" />
          <span className="hidden rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-text-secondary sm:inline">{c.nav.badge}</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-5">
          <Link href="#como" className="hidden text-[13.5px] text-text-secondary transition-colors hover:text-text lg:block">{c.nav.how}</Link>
          <Link href="#showcase" className="hidden text-[13.5px] text-text-secondary transition-colors hover:text-text lg:block">{c.nav.app}</Link>
          <Link href="#precios" className="hidden text-[13.5px] text-text-secondary transition-colors hover:text-text lg:block">{c.nav.pricing}</Link>
          <LangToggle />
          <Button href="/login" size="sm" className="hidden sm:inline-flex">{c.nav.cta}</Button>
        </div>
      </div>
    </header>
  );
}

/* ================= hero ================= */

function Hero() {
  const { c } = useT();
  return (
    <section className="relative isolate overflow-hidden px-5 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24">
      <GridPattern />
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.22] blur-[150px]" style={{ background: "radial-gradient(circle, var(--accent), transparent 68%)" }} />
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-[12.5px] font-medium text-text-secondary backdrop-blur">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent" /> {c.hero.badge}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }} className="mt-5 text-balance text-[42px] font-semibold leading-[1.02] tracking-[-0.03em] sm:text-[58px]">
            {c.hero.h1a}<span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">{c.hero.h1grad}</span>{c.hero.h1b}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12 }} className="mt-6 max-w-xl text-[16px] leading-relaxed text-text-secondary sm:text-[18px]">{c.hero.p}</motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.18 }} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/login" size="lg" className="group w-full sm:w-auto">{c.hero.cta1} <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" /></Button>
            <Button href="#showcase" variant="secondary" size="lg" className="w-full sm:w-auto">{c.hero.cta2}</Button>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-5 text-[13px] text-text-muted">{c.hero.fine}</motion.p>
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }} className="relative mx-auto w-full max-w-[320px]">
          <div aria-hidden className="absolute inset-0 -z-10 translate-y-8 scale-90 rounded-full opacity-40 blur-[70px]" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
          <PhoneFrame><PlayerCard /></PhoneFrame>
          <Floating className="-left-6 top-14 hidden sm:flex" delay={0.6}><Camera size={14} className="text-accent" /> {c.hero.chipAI}</Floating>
          <Floating className="-right-4 bottom-24 hidden sm:flex" delay={0.8}><Flame size={14} className="text-accent" /> {c.hero.chipStreak}</Floating>
          <Floating className="-right-6 top-6 hidden md:flex" delay={1}><Trophy size={14} className="text-accent" /> {c.hero.chipRank}</Floating>
        </motion.div>
      </div>
    </section>
  );
}

/* ================= stat strip ================= */

function StatStrip() {
  const { c } = useT();
  const nums = [{ to: 30 }, { to: 60, suffix: "s" }, { to: 3, prefix: "×" }, { to: 100, suffix: "%" }];
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-12 sm:px-8">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 md:grid-cols-4">
        {nums.map((s, i) => (
          <Reveal key={i} delay={i * 0.06} className="text-center">
            <p className="text-[38px] font-semibold tracking-tight sm:text-[44px]">{s.prefix}<CountUp to={s.to} />{s.suffix}</p>
            <p className="mx-auto mt-1 max-w-[170px] text-[12.5px] leading-relaxed text-text-secondary">{c.stats[i].l}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ================= showcase ================= */

function Showcase() {
  const { c } = useT();
  return (
    <section id="showcase" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow={c.showcase.eyebrow} title={c.showcase.title} subtitle={c.showcase.sub} center />
        <Reveal className="mt-12">
          <div className="relative">
            <div aria-hidden className="pointer-events-none absolute -inset-x-10 -bottom-10 top-20 -z-10 rounded-full opacity-30 blur-[90px]" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
            <WindowFrame title={c.showcase.window}><CoachView /></WindowFrame>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================= audience ================= */

function Audience() {
  const { c } = useT();
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow={c.audience.eyebrow} title={c.audience.title} subtitle={c.audience.sub} />
        <div className="mt-10 grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {c.audience.items.map((w) => (
            <div key={w.t} className="group bg-surface p-6 transition-colors hover:bg-surface-2">
              <h3 className="text-[16px] font-semibold tracking-tight">{w.t}</h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">{w.d}</p>
            </div>
          ))}
          <Link href="/login" className="flex items-center gap-1.5 bg-surface p-6 text-[14px] font-semibold text-accent transition-colors hover:bg-surface-2">{c.audience.start} <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>
  );
}

/* ================= how it works ================= */

function HowItWorks() {
  const { c } = useT();
  return (
    <section id="como" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow={c.how.eyebrow} title={c.how.title} center />
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {c.how.steps.map((s, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <span className="text-[52px] font-semibold leading-none tracking-tight text-transparent" style={{ WebkitTextStroke: "1.5px var(--border-strong)" }}>0{i + 1}</span>
              <h3 className="mt-4 text-[19px] font-semibold tracking-tight">{s.t}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-text-secondary">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= bento ================= */

function Bento() {
  const { c } = useT();
  const b = c.bento;
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow={b.eyebrow} title={b.title} center />
        <div className="mt-12 grid auto-rows-[minmax(0,1fr)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BentoCell className="sm:col-span-2 lg:row-span-2">
            <div className="flex h-full flex-col">
              <Tag icon={Camera}>{b.verifTag}</Tag>
              <h3 className="mt-4 text-[22px] font-semibold tracking-tight">{b.verifH}</h3>
              <p className="mt-2 max-w-md text-[14px] leading-relaxed text-text-secondary">{b.verifP}</p>
              <div className="mt-6 flex flex-1 items-end"><MiniVerify /></div>
            </div>
          </BentoCell>
          <BentoCell>
            <Tag icon={Flame}>{b.streakTag}</Tag>
            <p className="mt-4 flex items-baseline gap-2"><span className="text-[44px] font-semibold tracking-tight">24</span><span className="text-[14px] text-text-secondary">{b.streakUnit}</span></p>
            <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">{b.streakP}</p>
          </BentoCell>
          <BentoCell>
            <Tag icon={Trophy}>{b.standTag}</Tag>
            <div className="mt-4 space-y-1.5">
              {MEMBERS.slice(0, 3).map((m, i) => (
                <div key={m.name} className="flex items-center gap-2 text-[13px]">
                  <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold", i === 0 ? "accent-gradient text-accent-ink" : "bg-surface-2 text-text-secondary")}>{i + 1}</span>
                  <span className="flex-1 font-medium">{m.name}</span><span className="text-text-muted">{points(m)}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-text-secondary">{b.standP}</p>
          </BentoCell>
          <BentoCell><Tag icon={BarChart3}>{b.insightTag}</Tag><h3 className="mt-4 text-[16px] font-semibold tracking-tight">{b.insightH}</h3><p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">{b.insightP}</p></BentoCell>
          <BentoCell><Tag icon={Bell}>{b.remindTag}</Tag><h3 className="mt-4 text-[16px] font-semibold tracking-tight">{b.remindH}</h3><p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">{b.remindP}</p></BentoCell>
          <BentoCell><Tag icon={Sparkles}>{b.frictionTag}</Tag><h3 className="mt-4 text-[16px] font-semibold tracking-tight">{b.frictionH}</h3><p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">{b.frictionP}</p></BentoCell>
        </div>
      </div>
    </section>
  );
}

/* ================= habit catalog ================= */

function HabitCatalog() {
  const { c } = useT();
  return (
    <section className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow={c.catalog.eyebrow} title={c.catalog.title} subtitle={c.catalog.sub} />
        <div className="mt-10 space-y-6">
          {c.catalog.groups.map((g) => (
            <Reveal key={g.cat}>
              <div className="flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-baseline">
                <p className="w-36 shrink-0 text-[13px] font-semibold uppercase tracking-[0.12em] text-text-muted">{g.cat}</p>
                <div className="flex flex-wrap gap-2">
                  {g.items.map((it) => <span key={it} className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] text-text-secondary transition-colors hover:border-border-strong hover:text-text">{it}</span>)}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================= privacy ================= */

function Privacy() {
  const { c } = useT();
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-24 sm:px-8">
      <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-accent"><Lock size={15} /> {c.privacy.badge}</span>
          <h2 className="mt-4 text-[30px] font-semibold leading-tight tracking-[-0.02em] sm:text-[38px]">{c.privacy.titleA}<span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)] bg-clip-text text-transparent">{c.privacy.titleGrad}</span>{c.privacy.titleB}</h2>
          <p className="mt-4 text-[15px] leading-relaxed text-text-secondary">{c.privacy.p}</p>
          <ul className="mt-6 space-y-2.5">{c.privacy.feats.map((t) => <Feat key={t}>{t}</Feat>)}</ul>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="relative rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-lg)]">
            <p className="text-[13px] font-medium text-text-muted">{c.privacy.panel}</p>
            <div className="mt-4 space-y-2.5">
              {MEMBERS.slice(0, 4).map((m) => (
                <div key={m.name} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold text-white" style={{ background: m.color }}>{m.name[0]}</span>
                  <span className="flex-1 text-[13.5px] font-medium">{m.name}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1 text-[11.5px] text-text-muted"><Camera size={12} /> {c.privacy.photoHidden}</span>
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

/* ================= pricing ================= */

function Pricing() {
  const { c } = useT();
  const p = c.pricing;
  return (
    <section id="precios" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow={p.eyebrow} title={p.title} subtitle={p.sub} center />
        <div className="mt-12 grid gap-5 lg:grid-cols-2">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-border bg-surface p-7">
              <p className="text-[14px] font-semibold text-text-secondary">{p.freeLabel}</p>
              <p className="mt-2 text-[40px] font-semibold tracking-tight">{p.freePrice}</p>
              <p className="mt-1 text-[13px] text-text-muted">{p.freeNote}</p>
              <ul className="mt-6 flex-1 space-y-3">{p.freeFeats.map((f) => <Feat key={f}>{f}</Feat>)}</ul>
              <Button href="/login" size="lg" variant="secondary" className="mt-7 w-full">{p.freeCta}</Button>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-accent/50 bg-surface p-7 shadow-[var(--shadow-glow)]">
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
              <span className="absolute right-6 top-6 rounded-full accent-gradient px-2.5 py-1 text-[11px] font-bold text-accent-ink">{p.clubBadge}</span>
              <p className="text-[14px] font-semibold text-accent">{p.clubLabel}</p>
              <p className="mt-2 text-[40px] font-semibold tracking-tight">{p.clubPrice}</p>
              <p className="mt-1 text-[13px] text-text-muted">{p.clubNote}</p>
              <ul className="mt-6 flex-1 space-y-3">{p.clubFeats.map((f, i) => <Feat key={f} strong={i === 0}>{f}</Feat>)}</ul>
              <Button href="#contacto" size="lg" className="mt-7 w-full">{p.clubCta}</Button>
            </div>
          </Reveal>
        </div>
        <p className="mt-6 text-center text-[12.5px] text-text-muted">{p.foot}</p>
      </div>
    </section>
  );
}

/* ================= testimonials ================= */

function Testimonials() {
  const { c } = useT();
  return (
    <section className="border-y border-border bg-surface/40 px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <SectionHead eyebrow={c.testi.eyebrow} title={c.testi.title} center />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {c.testi.items.map((item, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="flex h-full flex-col rounded-3xl border border-border bg-surface p-6">
                <div className="flex gap-0.5 text-accent">{Array.from({ length: 5 }).map((_, k) => <Sparkles key={k} size={13} className="fill-current" />)}</div>
                <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-text">&ldquo;{item.q}&rdquo;</blockquote>
                <figcaption className="mt-5 text-[13px] font-medium text-text-muted">{item.n}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-[12px] text-text-muted">{c.testi.foot}</p>
      </div>
    </section>
  );
}

/* ================= faq ================= */

function FAQ() {
  const { c } = useT();
  return (
    <section className="px-5 py-24 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <SectionHead eyebrow={c.faq.eyebrow} title={c.faq.title} center />
        <div className="mt-10 space-y-3">{c.faq.qs.map((item, i) => <FAQItem key={i} {...item} />)}</div>
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

/* ================= final cta ================= */

function FinalCTA() {
  const { c } = useT();
  return (
    <section id="contacto" className="scroll-mt-20 px-5 py-24 sm:px-8">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-border bg-surface p-10 text-center shadow-[var(--shadow-lg)] sm:p-16">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full opacity-30 blur-[90px]" style={{ background: "radial-gradient(circle, var(--accent), transparent 70%)" }} />
        <div className="relative mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl accent-gradient text-accent-ink shadow-[var(--shadow-glow)]"><Zap size={26} /></div>
        <h2 className="relative text-balance text-[30px] font-semibold leading-tight tracking-[-0.02em] sm:text-[44px]">{c.cta.title}</h2>
        <p className="relative mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-text-secondary">{c.cta.p}</p>
        <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href="/login" size="lg" className="group w-full sm:w-auto">{c.cta.cta1} <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" /></Button>
          <Button href={`mailto:hola@momentum.app?subject=${c.cta.subject}`} variant="secondary" size="lg" className="w-full sm:w-auto">{c.cta.cta2}</Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { c } = useT();
  return (
    <footer className="border-t border-border px-5 py-10 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
        <Wordmark href="/teams" size="sm" />
        <div className="flex items-center gap-5 text-[13px] text-text-secondary">
          <Link href="/privacy" className="hover:text-text">{c.footer.privacy}</Link>
          <Link href="/terms" className="hover:text-text">{c.footer.terms}</Link>
          <Link href="/login" className="hover:text-text">{c.footer.login}</Link>
        </div>
        <p className="text-[12px] text-text-muted">© {new Date().getFullYear()} Fenom</p>
      </div>
    </footer>
  );
}

/* ================= demo views ================= */

function CoachView() {
  const { c } = useT();
  const ranked = [...MEMBERS].sort((a, b) => points(b) - points(a));
  return (
    <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
      <div className="overflow-hidden rounded-2xl border border-border bg-bg">
        <div className="flex items-center justify-between border-b border-border p-3.5">
          <div><p className="text-[14px] font-semibold">{c.demo.today}</p><p className="text-[12px] text-text-muted">{c.demo.members}</p></div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-text-secondary"><ShieldCheck size={12} className="text-accent" /> {c.demo.nophotos}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left">
            <thead>
              <tr className="text-text-muted">
                <th className="p-2.5 text-[11.5px] font-medium">{c.demo.member}</th>
                {HABIT_META.map((h, i) => (
                  <th key={h.key} className="p-1.5 text-center">
                    <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${colorValue(h.color)} 15%, transparent)`, color: colorValue(h.color) }} title={c.demo.habits[i]}><HabitIcon name={h.icon} size={13} /></span>
                  </th>
                ))}
                <th className="p-2.5 text-center text-[11.5px] font-medium">{c.demo.streak}</th>
              </tr>
            </thead>
            <tbody>
              {MEMBERS.map((m) => (
                <tr key={m.name} className="border-t border-border">
                  <td className="p-2.5"><div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: m.color }}>{m.name[0]}</span><span className="text-[13px] font-medium">{m.name}</span></div></td>
                  {m.done.map((d, i) => (
                    <td key={i} className="p-1.5 text-center"><span className={cn("mx-auto flex h-5 w-5 items-center justify-center rounded-full", d ? "bg-accent-soft text-accent" : "bg-danger-soft text-danger")}>{d ? <Check size={12} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}</span></td>
                  ))}
                  <td className="p-2.5 text-center"><span className="inline-flex items-center gap-1 text-[12.5px] font-semibold"><Flame size={12} className="text-accent" />{m.streak}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-bg p-4">
        <div className="flex items-center gap-2"><Trophy size={16} className="text-accent" /><p className="text-[14px] font-semibold">{c.demo.standings}</p></div>
        <p className="mt-0.5 text-[12px] text-text-muted">{c.demo.week}</p>
        <div className="mt-3 space-y-1.5">
          {ranked.map((m, i) => (
            <div key={m.name} className={cn("flex items-center gap-2.5 rounded-xl border p-2", i === 0 ? "border-accent/40 bg-accent-soft" : "border-border")}>
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold", i === 0 ? "accent-gradient text-accent-ink" : "bg-surface-2 text-text-secondary")}>{i + 1}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: m.color }}>{m.name[0]}</span>
              <span className="flex-1 text-[13px] font-medium">{m.name}</span><span className="text-[12.5px] font-semibold">{points(m)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerCard() {
  const { c } = useT();
  return (
    <div className="flex h-full flex-col">
      <div className="accent-gradient p-5 text-accent-ink">
        <div className="flex items-center justify-between">
          <div><p className="text-[12.5px] font-medium opacity-80">{c.demo.hi}</p><p className="text-[19px] font-semibold">{c.demo.team}</p></div>
          <div className="flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1.5 text-[13.5px] font-bold"><Flame size={15} /> 16</div>
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div><p className="text-[11.5px] font-medium opacity-80">{c.demo.level}</p><p className="text-[12.5px] font-semibold">240 XP</p></div>
          <p className="text-[11.5px] font-medium opacity-80">{c.demo.today2}</p>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/15"><div className="h-full rounded-full bg-accent-ink/80" style={{ width: "80%" }} /></div>
      </div>
      <div className="flex-1 space-y-2 bg-surface p-3.5">
        {HABIT_META.map((h, i) => {
          const done = i < 4; const val = colorValue(h.color);
          return (
            <div key={h.key} className={cn("flex items-center gap-2.5 rounded-xl border p-2.5", done ? "border-border bg-surface-2" : "border-accent/40")}>
              <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${val} 15%, transparent)`, color: val }}><HabitIcon name={h.icon} size={16} /></span>
              <div className="flex-1"><p className="text-[13px] font-semibold">{c.demo.habits[i]}</p>{h.key === "extra" && <p className="flex items-center gap-1 text-[10.5px] text-accent"><Camera size={10} /> {c.demo.verify}</p>}</div>
              <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", done ? "accent-gradient text-accent-ink" : "border-2 border-border-strong")}>{done && <Check size={14} strokeWidth={3} />}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= visual helpers ================= */

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
        <span className="h-3 w-3 rounded-full bg-danger/60" /><span className="h-3 w-3 rounded-full bg-[var(--accent-2)]/60" /><span className="h-3 w-3 rounded-full bg-border-strong" />
        <p className="ml-3 text-[12.5px] text-text-muted">{title}</p>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  );
}

function Floating({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay, duration: 0.5 }} className={cn("absolute z-20 inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/90 px-3 py-1.5 text-[12px] font-semibold text-text shadow-[var(--shadow-lg)] backdrop-blur", className)}>
      {children}
    </motion.div>
  );
}

function BentoCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return <Reveal className={className}><div className="h-full rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-border-strong">{children}</div></Reveal>;
}

function Tag({ icon: Icon, children }: { icon: typeof Camera; children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-[11.5px] font-semibold text-accent"><Icon size={12} /> {children}</span>;
}

function MiniVerify() {
  const { c } = useT();
  return (
    <div className="w-full rounded-2xl border border-border bg-bg p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ color: "#e58a97", background: "color-mix(in oklab, #e58a97 15%, transparent)" }}><HabitIcon name="dumbbell" size={20} /></span>
        <div className="flex-1"><p className="text-[13.5px] font-semibold">{c.bento.miniHabit}</p><p className="text-[11.5px] text-text-muted">{c.bento.miniStatus}</p></div>
        <motion.span initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 14 }} className="flex h-8 w-8 items-center justify-center rounded-full accent-gradient text-accent-ink"><Check size={16} strokeWidth={3} /></motion.span>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-xl bg-accent-soft px-3 py-2 text-[12px] font-medium text-accent"><ShieldCheck size={13} /> {c.bento.miniVerified}</div>
    </div>
  );
}

function GridPattern() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.5]" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "56px 56px", maskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 40%, transparent 80%)", WebkitMaskImage: "radial-gradient(ellipse 80% 55% at 50% 0%, #000 40%, transparent 80%)" }} />
  );
}

/* ================= primitives ================= */

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
    <motion.span viewport={{ once: true }} onViewportEnter={() => {
      if (started.current) return; started.current = true;
      const start = performance.now(); const dur = 1300;
      const tick = (now: number) => { const p = Math.min((now - start) / dur, 1); setVal(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }}>{val}</motion.span>
  );
}

function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }} className={className}>{children}</motion.div>;
}
