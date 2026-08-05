"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Users, ArrowRight, Loader2, LogIn } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { FEATURE_TEAMS } from "@/lib/features";
import { groupByCode, joinGroup } from "@/lib/teams";

const PENDING_KEY = "momentum-pending-join";

export default function JoinPage() {
  const router = useRouter();
  const { user, ready, setAccountType, markOnboarded } = useAuth();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [group, setGroup] = useState<{ id: string; name: string; memberCount: number } | null>(null);
  const [checking, setChecking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Teams disabled in personal-only mode: guard direct URL access.
  useEffect(() => { if (!FEATURE_TEAMS) router.replace("/dashboard"); }, [router]);

  // Read ?code= from the URL on the client (avoids useSearchParams suspense).
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("code") || "";
    if (c) setCode(c.toUpperCase()); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  // If not signed in, stash the code and send them to log in / sign up first.
  useEffect(() => {
    if (!ready || user) return;
    const c = new URLSearchParams(window.location.search).get("code");
    try { if (c) localStorage.setItem(PENDING_KEY, c.toUpperCase()); } catch {}
    router.replace("/login");
  }, [ready, user, router]);

  useEffect(() => { if (user && !name) setName(user.name); }, [user, name]); // eslint-disable-line react-hooks/set-state-in-effect

  // Preview the group whenever the code looks complete.
  useEffect(() => {
    let active = true;
    if (code.trim().length < 4) { setGroup(null); return; }
    setChecking(true);
    groupByCode(code.trim()).then((g) => { if (active) { setGroup(g); setChecking(false); } });
    return () => { active = false; };
  }, [code]);

  const join = async () => {
    setErr(""); setBusy(true);
    try {
      const gid = await joinGroup(code.trim(), name);
      if (user && !user.accountType) await setAccountType("personal");
      if (user && !user.onboarded) await markOnboarded(); // let team members into the app without the personal onboarding
      try { localStorage.removeItem(PENDING_KEY); } catch {}
      router.replace(`/team?g=${gid}`);
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  };

  if (!FEATURE_TEAMS || !ready || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-5 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
        <p className="text-[13px] text-text-muted">Inicia sesión para unirte a tu equipo…</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg">
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[760px] -translate-x-1/2 rounded-full opacity-25 blur-[140px]" style={{ background: "radial-gradient(circle, var(--accent), transparent 65%)" }} />
      <header className="relative z-10 px-5 pt-[calc(env(safe-area-inset-top)+1.25rem)] sm:px-8"><Wordmark href={null} /></header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-5 pb-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="flex justify-center"><span className="flex h-16 w-16 items-center justify-center rounded-3xl accent-gradient text-accent-ink shadow-[var(--shadow-glow)]"><Users size={30} /></span></div>
          <h1 className="mt-6 text-center text-[26px] font-semibold tracking-[-0.02em]">Únete a tu equipo</h1>
          <p className="mx-auto mt-2 max-w-xs text-center text-[14px] leading-relaxed text-text-secondary">Introduce el código que te ha dado tu entrenador.</p>

          <div className="mt-7 rounded-3xl border border-border bg-surface p-6">
            <label className="text-[12.5px] font-semibold text-text-secondary">Código del equipo</label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="ABC123" maxLength={8}
              className="mt-2 text-center font-mono text-[22px] font-bold tracking-[0.3em]" autoFocus />

            <div className="mt-3 min-h-[24px] text-center text-[13px]">
              {checking ? <span className="inline-flex items-center gap-1.5 text-text-muted"><Loader2 size={13} className="animate-spin" /> Buscando…</span>
                : group ? <span className="font-medium text-accent">✓ {group.name} · {group.memberCount} {group.memberCount === 1 ? "miembro" : "miembros"}</span>
                : code.trim().length >= 4 ? <span className="text-danger">No encontramos ese equipo</span> : null}
            </div>

            <label className="mt-3 block text-[12.5px] font-semibold text-text-secondary">Tu nombre en el equipo</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="mt-2" />

            {err && <p className="mt-3 text-[13px] text-danger">{err}</p>}
            <Button size="lg" onClick={join} disabled={!group || busy || !name.trim()} className="mt-5 w-full group">
              {busy ? <Loader2 size={17} className="animate-spin" /> : <>Unirme al equipo <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" /></>}
            </Button>
          </div>

          <p className="mt-4 text-center text-[12.5px] text-text-muted">
            <LogIn size={12} className="mr-1 inline" /> ¿Solo quieres uso personal? <a href="/dashboard" className="font-medium text-accent">Ir a mi app</a>
          </p>
        </motion.div>
      </main>
    </div>
  );
}
