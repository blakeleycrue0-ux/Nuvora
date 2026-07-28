"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { User, Users, ArrowRight, Check } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { isOnboarded } from "@/lib/momentum/onboarding";
import { cn } from "@/lib/utils";

type Choice = "personal" | "coach";

export default function WelcomePage() {
  const router = useRouter();
  const { user, ready, accountType, setAccountType } = useAuthSafe();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace("/login");
    else if (ready && accountType) route(accountType); // already chosen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user, accountType]);

  function route(t: Choice) {
    if (t === "coach") router.replace("/coach");
    else router.replace(isOnboarded() ? "/dashboard" : "/onboarding");
  }

  async function confirm() {
    if (!choice || saving) return;
    setSaving(true);
    await setAccountType(choice);
    route(choice);
  }

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }

  const firstName = user.name?.split(" ")[0] ?? "";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-25 blur-[140px]"
        style={{ background: "radial-gradient(circle, var(--accent), transparent 65%)" }} />
      <header className="relative z-10 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] sm:px-8">
        <Wordmark href={null} />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-16 pt-4">
        <div className="w-full max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <h1 className="text-balance text-[30px] font-semibold leading-tight tracking-[-0.02em] text-text sm:text-[38px]">
              ¿Cómo vas a usar Fenom{firstName ? `, ${firstName}` : ""}?
            </h1>
            <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-text-secondary">
              Elige tu tipo de cuenta. Podrás cambiarlo más adelante.
            </p>
          </motion.div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <ChoiceCard
              active={choice === "personal"} onClick={() => setChoice("personal")}
              icon={User} title="Para mí" desc="Construye tus propios hábitos, con rachas, niveles y verificación por foto."
              bullets={["Tus hábitos personales", "Rachas y XP", "100% privado"]}
            />
            <ChoiceCard
              active={choice === "coach"} onClick={() => setChoice("coach")}
              icon={Users} title="Para mi equipo" desc="Crea un grupo, invita a tu equipo y sigue su constancia desde un panel."
              bullets={["Panel del entrenador", "Código de invitación", "Clasificación del grupo"]}
              badge="Entrenador / Club"
            />
          </div>

          <div className="mt-8 flex justify-center">
            <Button size="lg" onClick={confirm} disabled={!choice || saving} className="group">
              {saving ? "Un momento…" : <>Continuar <ArrowRight size={18} className="transition-transform group-hover:translate-x-0.5" /></>}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function ChoiceCard({ active, onClick, icon: Icon, title, desc, bullets, badge }: {
  active: boolean; onClick: () => void; icon: typeof User; title: string; desc: string; bullets: string[]; badge?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col rounded-3xl border p-6 text-left transition-all",
        active ? "border-accent bg-accent-soft shadow-[var(--shadow-glow)]" : "border-border bg-surface hover:border-border-strong",
      )}
    >
      {badge && <span className="absolute right-5 top-5 rounded-full border border-border bg-surface px-2 py-0.5 text-[10.5px] font-semibold text-text-secondary">{badge}</span>}
      <span className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", active ? "accent-gradient text-accent-ink" : "bg-surface-2 text-text-secondary")}>
        <Icon size={24} />
      </span>
      <h2 className="mt-4 text-[19px] font-semibold tracking-tight text-text">{title}</h2>
      <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">{desc}</p>
      <ul className="mt-4 space-y-2">
        {bullets.map((b) => (
          <li key={b} className="flex items-center gap-2 text-[13px] text-text-secondary">
            <span className={cn("flex h-4.5 w-4.5 items-center justify-center rounded-full", active ? "bg-accent text-accent-ink" : "bg-surface-2 text-text-muted")} style={{ height: 18, width: 18 }}>
              <Check size={11} strokeWidth={3} />
            </span>
            {b}
          </li>
        ))}
      </ul>
    </button>
  );
}

// Small wrapper so we can read accountType off the user object cleanly.
function useAuthSafe() {
  const a = useAuth();
  return { ...a, accountType: a.user?.accountType ?? null };
}
