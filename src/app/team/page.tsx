"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Flame, Check, Camera, LogOut, Users, ArrowRight } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { VerifyModal } from "@/components/verify/VerifyModal";
import { useAuth } from "@/lib/auth";
import { HabitIcon, colorValue } from "@/lib/icons";
import { todayISO, lastNDays } from "@/lib/momentum/date";
import {
  myMemberGroups, groupHabits, myGroupCompletions, setGroupCompletion, streakFor,
  type TeamGroup, type TeamHabit,
} from "@/lib/teams";
import type { Habit, HabitColor, Difficulty } from "@/lib/momentum/types";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  const router = useRouter();
  const { user, ready, signOut } = useAuth();
  const [groups, setGroups] = useState<TeamGroup[] | null>(null);
  const [gid, setGid] = useState<string | null>(null);
  const [habits, setHabits] = useState<TeamHabit[]>([]);
  const [doneToday, setDoneToday] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verify, setVerify] = useState<TeamHabit | null>(null);

  useEffect(() => { if (ready && !user) router.replace("/login"); }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user) return;
    (async () => {
      const gs = await myMemberGroups();
      setGroups(gs); // eslint-disable-line react-hooks/set-state-in-effect
      const wanted = new URLSearchParams(window.location.search).get("g");
      setGid((gs.find((g) => g.id === wanted)?.id ?? gs[0]?.id) ?? null); // eslint-disable-line react-hooks/set-state-in-effect
    })();
  }, [ready, user]);

  const load = useCallback(async () => {
    if (!gid) return;
    setLoading(true);
    const since = lastNDays(21)[0];
    const [h, c] = await Promise.all([groupHabits(gid), myGroupCompletions(gid, since)]);
    setHabits(h);
    const today = todayISO();
    setDoneToday(new Set(c.filter((x) => x.date === today).map((x) => x.habitId)));
    setStreak(streakFor(new Set(c.map((x) => x.date))));
    setLoading(false);
  }, [gid]);
  useEffect(() => { if (gid) void load(); }, [gid, load]);

  const complete = async (h: TeamHabit) => {
    if (!gid) return;
    const done = doneToday.has(h.id);
    if (!done && h.verify) { setVerify(h); return; }
    // optimistic toggle
    setDoneToday((s) => { const n = new Set(s); if (done) n.delete(h.id); else n.add(h.id); return n; });
    await setGroupCompletion(gid, h.id, !done);
    void load();
  };

  const onApproved = async () => {
    if (!gid || !verify) return;
    setDoneToday((s) => new Set(s).add(verify.id));
    await setGroupCompletion(gid, verify.id, true);
    void load();
  };

  if (!ready || !user) return <div className="flex min-h-screen items-center justify-center bg-bg"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" /></div>;

  const group = groups?.find((g) => g.id === gid) ?? null;
  const doneCount = habits.filter((h) => doneToday.has(h.id)).length;
  const pct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-bg/80 px-5 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:px-8">
        <Wordmark href={null} />
        <button onClick={signOut} aria-label="Cerrar sesión" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-danger"><LogOut size={17} /></button>
      </header>

      <main className="mx-auto max-w-md px-5 py-7">
        {groups === null || loading ? (
          <div className="space-y-3"><div className="h-28 animate-pulse rounded-3xl bg-surface-2" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-2" />)}</div>
        ) : !group ? (
          <div className="flex flex-col items-center gap-4 pt-10 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent-soft text-accent"><Users size={30} /></span>
            <div><p className="text-[17px] font-semibold">No estás en ningún equipo</p><p className="mt-1 text-[13.5px] text-text-muted">Pide el código a tu entrenador para unirte.</p></div>
            <Button href="/join" size="lg" className="group">Introducir código <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" /></Button>
          </div>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl accent-gradient p-5 text-accent-ink">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12.5px] font-medium opacity-80">Hola, {user.name.split(" ")[0]}</p>
                  <p className="text-[22px] font-semibold">{group.name}</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1.5 text-[15px] font-bold"><Flame size={16} /> {streak}</div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[12.5px] font-medium opacity-90"><span>Hoy</span><span>{doneCount} de {habits.length}</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/15"><motion.div className="h-full rounded-full bg-accent-ink/80" initial={false} animate={{ width: `${pct}%` }} /></div>
            </motion.div>

            <div className="mt-5 space-y-2.5">
              {habits.map((h) => {
                const done = doneToday.has(h.id); const val = colorValue(h.color);
                return (
                  <button key={h.id} onClick={() => complete(h)}
                    className={cn("flex w-full items-center gap-3 rounded-2xl border p-3.5 text-left transition-all", done ? "border-border bg-surface" : "border-border bg-surface hover:border-border-strong")}>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${val} 15%, transparent)`, color: val }}><HabitIcon name={h.icon} size={19} /></span>
                    <div className="flex-1">
                      <p className="text-[14.5px] font-semibold">{h.name}</p>
                      {h.verify && !done && <p className="flex items-center gap-1 text-[11.5px] text-accent"><Camera size={11} /> Verificar con foto</p>}
                    </div>
                    <span className={cn("flex h-8 w-8 items-center justify-center rounded-full transition-colors", done ? "accent-gradient text-accent-ink" : "border-2 border-border-strong")}>{done && <Check size={16} strokeWidth={3} />}</span>
                  </button>
                );
              })}
            </div>

            {groups && groups.length > 1 && (
              <div className="mt-6">
                <p className="mb-2 text-[12px] font-semibold text-text-muted">Otros equipos</p>
                <div className="flex flex-wrap gap-2">
                  {groups.filter((g) => g.id !== gid).map((g) => (
                    <button key={g.id} onClick={() => setGid(g.id)} className="rounded-full border border-border bg-surface px-3 py-1.5 text-[13px] text-text-secondary hover:text-text">{g.name}</button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <VerifyModal
        open={!!verify}
        habit={verify ? teamHabitToHabit(verify) : null}
        date={todayISO()}
        onClose={() => setVerify(null)}
        onApproved={onApproved}
      />
    </div>
  );
}

function teamHabitToHabit(h: TeamHabit): Habit {
  return {
    id: h.id, name: h.name, icon: h.icon, color: h.color as HabitColor, category: "Equipo",
    frequency: { type: "daily" }, targetPerDay: 1, difficulty: (h.difficulty as Difficulty) || "medium",
    tags: [], createdAt: todayISO(), archived: false, order: 0, verify: true,
  };
}
