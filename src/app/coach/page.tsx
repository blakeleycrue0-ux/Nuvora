"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Users, Plus, Check, X, Flame, Trophy, Copy, LogOut, Share2, ArrowRight, ShieldCheck, Loader2,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/auth";
import { HabitIcon, colorValue } from "@/lib/icons";
import { todayISO, lastNDays } from "@/lib/momentum/date";
import {
  createGroup, myOwnedGroups, groupHabits, groupMembers, groupCompletions,
  streakFor, type TeamGroup, type TeamHabit, type TeamMember, type NewHabit,
} from "@/lib/teams";
import { cn } from "@/lib/utils";

const SUGGESTED: NewHabit[] = [
  { name: "Descanso 8h", icon: "bed", color: "c-indigo" },
  { name: "Hidratación", icon: "glass-water", color: "c-sky" },
  { name: "Movilidad", icon: "waves", color: "c-teal" },
  { name: "Entreno individual", icon: "dumbbell", color: "c-rose", verify: true },
  { name: "Nutrición", icon: "salad", color: "c-emerald" },
  { name: "Estudio al día", icon: "book-open", color: "c-amber" },
];

export default function CoachPage() {
  const router = useRouter();
  const { user, ready, signOut } = useAuth();
  const [groups, setGroups] = useState<TeamGroup[] | null>(null);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/login"); return; }
    if (!user.accountType) { router.replace("/welcome"); return; }
    if (user.accountType !== "coach") { router.replace("/dashboard"); return; }
  }, [ready, user, router]);

  const load = useCallback(async () => {
    const g = await myOwnedGroups();
    setGroups(g);
    setActive((a) => a ?? g[0]?.id ?? null);
  }, []);

  useEffect(() => { if (ready && user?.accountType === "coach") void load(); }, [ready, user, load]);

  if (!ready || !user || user.accountType !== "coach") {
    return <div className="flex min-h-screen items-center justify-center bg-bg"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" /></div>;
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-bg/80 px-5 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-2.5">
          <Wordmark href={null} />
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-text-secondary">Entrenador</span>
        </div>
        <button onClick={signOut} aria-label="Cerrar sesión" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-danger">
          <LogOut size={17} />
        </button>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 lg:py-10">
        {groups === null ? (
          <div className="space-y-4"><div className="h-40 animate-pulse rounded-3xl bg-surface-2" /><div className="h-64 animate-pulse rounded-3xl bg-surface-2" /></div>
        ) : groups.length === 0 ? (
          <CreateGroup onCreated={load} coachName={user.name} />
        ) : (
          <Dashboard groups={groups} active={active!} setActive={setActive} onNewGroup={() => setActive("__new__")} reload={load} coachName={user.name} />
        )}
      </main>
    </div>
  );
}

/* ---------------- create group ---------------- */

function CreateGroup({ onCreated, coachName }: { onCreated: () => Promise<void>; coachName: string }) {
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>(SUGGESTED.slice(0, 5).map((h) => h.name));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const toggle = (n: string) => setPicked((p) => (p.includes(n) ? p.filter((x) => x !== n) : p.length >= 5 ? p : [...p, n]));

  const create = async () => {
    setErr(""); setBusy(true);
    try {
      const habits = SUGGESTED.filter((h) => picked.includes(h.name));
      await createGroup(name || `Equipo de ${coachName.split(" ")[0]}`, habits);
      await onCreated();
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl">
      <div className="flex justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl accent-gradient text-accent-ink shadow-[var(--shadow-glow)]"><Users size={30} /></span>
      </div>
      <h1 className="mt-6 text-center text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">Crea tu primer grupo</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-[14.5px] leading-relaxed text-text-secondary">Ponle nombre y elige hasta 5 hábitos. Luego invitas a tu equipo con un código.</p>

      <div className="mt-7 rounded-3xl border border-border bg-surface p-6">
        <label className="text-[12.5px] font-semibold text-text-secondary">Nombre del grupo</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Alevín A, Primer equipo…" className="mt-2" autoFocus />

        <p className="mt-6 text-[12.5px] font-semibold text-text-secondary">Hábitos ({picked.length}/5)</p>
        <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
          {SUGGESTED.map((h) => {
            const on = picked.includes(h.name); const val = colorValue(h.color);
            return (
              <button key={h.name} onClick={() => toggle(h.name)}
                className={cn("flex items-center gap-3 rounded-2xl border p-3 text-left transition-all", on ? "border-accent bg-accent-soft" : "border-border hover:border-border-strong")}>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${val} 16%, transparent)`, color: val }}><HabitIcon name={h.icon} size={17} /></span>
                <span className="flex-1 text-[13.5px] font-medium">{h.name}</span>
                {h.verify && <span className="text-[10.5px] font-semibold text-accent">IA</span>}
                {on && <Check size={16} className="text-accent" />}
              </button>
            );
          })}
        </div>
        {err && <p className="mt-4 text-[13px] text-danger">{err}</p>}
        <Button size="lg" onClick={create} disabled={busy} className="mt-6 w-full group">
          {busy ? <Loader2 size={17} className="animate-spin" /> : <>Crear grupo <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" /></>}
        </Button>
      </div>
    </motion.div>
  );
}

/* ---------------- dashboard ---------------- */

function Dashboard({ groups, active, setActive, onNewGroup, reload, coachName }: {
  groups: TeamGroup[]; active: string; setActive: (id: string) => void; onNewGroup: () => void; reload: () => Promise<void>; coachName: string;
}) {
  const creating = active === "__new__";
  const group = groups.find((g) => g.id === active) ?? groups[0];
  const [habits, setHabits] = useState<TeamHabit[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [comp, setComp] = useState<{ habitId: string; userId: string; date: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const gid = group?.id;
  const loadData = useCallback(async () => {
    if (!gid) return;
    setLoading(true);
    const since = lastNDays(30)[0];
    const [h, m, c] = await Promise.all([groupHabits(gid), groupMembers(gid), groupCompletions(gid, since)]);
    setHabits(h); setMembers(m); setComp(c); setLoading(false);
  }, [gid]);
  useEffect(() => { if (!creating) void loadData(); }, [creating, loadData]);

  if (creating) return <CreateGroup onCreated={async () => { await reload(); setActive(groups[0]?.id ?? ""); }} coachName={coachName} />;
  if (!group) return null;

  const today = todayISO();
  const doneToday = new Set(comp.filter((c) => c.date === today).map((c) => `${c.userId}|${c.habitId}`));
  const week = new Set(lastNDays(7));
  const stats = members.map((m) => {
    const dates = new Set(comp.filter((c) => c.userId === m.userId).map((c) => c.date));
    const weekPts = comp.filter((c) => c.userId === m.userId && week.has(c.date)).length;
    return { m, streak: streakFor(dates), weekPts };
  });
  const ranked = [...stats].sort((a, b) => b.weekPts - a.weekPts || b.streak - a.streak);

  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/join?code=${group.inviteCode}` : "";
  const copy = async () => { try { await navigator.clipboard.writeText(inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {} };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: "Únete a mi equipo en Fenom", text: `Código: ${group.inviteCode}`, url: inviteUrl }); } catch {} }
    else copy();
  };

  return (
    <div>
      {/* Header row: group switcher + new group */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {groups.length > 1 ? (
            <select value={group.id} onChange={(e) => setActive(e.target.value)} className="rounded-xl border border-border bg-surface px-3 py-2 text-[15px] font-semibold text-text outline-none focus:border-accent">
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          ) : (
            <h1 className="text-[22px] font-semibold tracking-[-0.02em] sm:text-[26px]">{group.name}</h1>
          )}
          <span className="text-[13px] text-text-muted">{members.length} {members.length === 1 ? "miembro" : "miembros"}</span>
        </div>
        <Button size="sm" variant="secondary" onClick={onNewGroup}><Plus size={15} /> Nuevo grupo</Button>
      </div>

      {/* Invite card */}
      <div className="mt-5 rounded-3xl border border-accent/40 bg-surface p-5 shadow-[var(--shadow-glow)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[12.5px] font-medium text-text-muted">Código de invitación</p>
            <p className="mt-0.5 font-mono text-[30px] font-bold tracking-[0.18em] text-text">{group.inviteCode}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={copy}><Copy size={15} /> {copied ? "Copiado" : "Copiar enlace"}</Button>
            <Button size="sm" onClick={share}><Share2 size={15} /> Compartir</Button>
          </div>
        </div>
        <p className="mt-3 text-[12.5px] text-text-secondary">Comparte el código o el enlace. Tu equipo entra, se une y empieza a registrar.</p>
      </div>

      {loading ? (
        <div className="mt-5 h-64 animate-pulse rounded-3xl bg-surface-2" />
      ) : members.length === 0 ? (
        <div className="mt-5 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Users size={26} /></span>
          <div>
            <p className="text-[15px] font-semibold">Aún no hay nadie en el grupo</p>
            <p className="mt-1 text-[13px] text-text-muted">Comparte el código de arriba para que tu equipo se una.</p>
          </div>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          {/* Compliance grid */}
          <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-sm)]">
            <div className="flex items-center justify-between border-b border-border p-4">
              <p className="text-[15px] font-semibold">Hoy</p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-text-secondary"><ShieldCheck size={12} className="text-accent" /> Sin fotos</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-left">
                <thead>
                  <tr className="text-text-muted">
                    <th className="p-3 text-[12px] font-medium">Miembro</th>
                    {habits.map((h) => (
                      <th key={h.id} className="p-2 text-center">
                        <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: `color-mix(in oklab, ${colorValue(h.color)} 15%, transparent)`, color: colorValue(h.color) }} title={h.name}><HabitIcon name={h.icon} size={14} /></span>
                      </th>
                    ))}
                    <th className="p-3 text-center text-[12px] font-medium">Racha</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => {
                    const st = stats.find((s) => s.m.userId === m.userId)!;
                    return (
                      <tr key={m.id} className="border-t border-border">
                        <td className="p-3"><div className="flex items-center gap-2.5"><Avatar name={m.displayName} /><span className="text-[13.5px] font-medium">{m.displayName}</span></div></td>
                        {habits.map((h) => {
                          const done = doneToday.has(`${m.userId}|${h.id}`);
                          return <td key={h.id} className="p-2 text-center"><span className={cn("mx-auto flex h-6 w-6 items-center justify-center rounded-full", done ? "bg-accent-soft text-accent" : "bg-surface-2 text-text-muted")}>{done ? <Check size={13} strokeWidth={3} /> : <X size={11} strokeWidth={2.5} />}</span></td>;
                        })}
                        <td className="p-3 text-center"><span className="inline-flex items-center gap-1 text-[13px] font-semibold"><Flame size={13} className="text-accent" />{st.streak}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
            <div className="flex items-center gap-2"><Trophy size={18} className="text-accent" /><p className="text-[15px] font-semibold">Clasificación</p></div>
            <p className="mt-0.5 text-[12.5px] text-text-muted">Esta semana</p>
            <div className="mt-4 space-y-2">
              {ranked.map((s, i) => (
                <div key={s.m.id} className={cn("flex items-center gap-3 rounded-2xl border p-2.5", i === 0 ? "border-accent/40 bg-accent-soft" : "border-border")}>
                  <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold", i === 0 ? "accent-gradient text-accent-ink" : "bg-surface-2 text-text-secondary")}>{i + 1}</span>
                  <Avatar name={s.m.displayName} />
                  <span className="flex-1 truncate text-[13.5px] font-medium">{s.m.displayName}</span>
                  <span className="text-[13px] font-semibold">{s.weekPts * 10}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Habits summary */}
      {habits.length > 0 && (
        <div className="mt-5 rounded-3xl border border-border bg-surface p-5">
          <p className="text-[13px] font-semibold text-text-secondary">Hábitos del grupo</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {habits.map((h) => (
              <span key={h.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-[13px]" style={{ color: colorValue(h.color) }}>
                <HabitIcon name={h.icon} size={14} /><span className="text-text">{h.name}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const colors = ["#45c68e", "#67b0e0", "#a58ce0", "#e0b45c", "#e58a97", "#4fc3b8"];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: colors[h % colors.length] }}>{name[0]?.toUpperCase() ?? "?"}</span>;
}
