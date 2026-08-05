"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FEATURE_TEAMS } from "@/lib/features";
import { Flame, Check, Camera, Users, Loader2, Plus, Zap, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { VerifyModal } from "@/components/verify/VerifyModal";
import { useAuth } from "@/lib/auth";
import { HabitIcon, colorValue } from "@/lib/icons";
import { todayISO, lastNDays } from "@/lib/momentum/date";
import {
  myMemberGroups, groupHabits, myGroupCompletions, setGroupCompletion, streakFor,
  groupByCode, joinGroup, groupAnnouncements, levelForXp,
  type TeamGroup, type TeamHabit, type Announcement,
} from "@/lib/teams";
import type { Habit, HabitColor, Difficulty } from "@/lib/momentum/types";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  const router = useRouter();
  // Teams is disabled in personal-only mode: no UI path leads here, but guard
  // direct URL access too and send the user back to their personal home.
  useEffect(() => { if (!FEATURE_TEAMS) router.replace("/dashboard"); }, [router]);
  const { user, ready } = useAuth();
  const [groups, setGroups] = useState<TeamGroup[] | null>(null);
  const [gid, setGid] = useState<string | null>(null);
  const [habits, setHabits] = useState<TeamHabit[]>([]);
  const [doneToday, setDoneToday] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [verify, setVerify] = useState<TeamHabit | null>(null);
  const [joining, setJoining] = useState(false);

  const loadGroups = useCallback(async () => {
    const gs = await myMemberGroups();
    setGroups(gs);
    setGid((cur) => cur ?? gs[0]?.id ?? null);
  }, []);
  useEffect(() => { if (ready && user) void loadGroups(); }, [ready, user, loadGroups]);

  const load = useCallback(async () => {
    if (!gid) { setLoading(false); return; }
    setLoading(true);
    const since = lastNDays(21)[0];
    const [h, c, a] = await Promise.all([groupHabits(gid), myGroupCompletions(gid, since), groupAnnouncements(gid)]);
    setHabits(h);
    const today = todayISO();
    setDoneToday(new Set(c.filter((x) => x.date === today).map((x) => x.habitId)));
    setStreak(streakFor(new Set(c.map((x) => x.date))));
    const xpOf = new Map(h.map((x) => [x.id, x.xp]));
    setXp(c.reduce((sum, x) => sum + (xpOf.get(x.habitId) ?? 10), 0));
    setAnnouncements(a);
    setLoading(false);
  }, [gid]);
  useEffect(() => { if (gid) void load(); else if (groups) setLoading(false); }, [gid, groups, load]);

  const complete = async (h: TeamHabit) => {
    if (!gid) return;
    const done = doneToday.has(h.id);
    if (!done && h.verify) { setVerify(h); return; }
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

  if (!FEATURE_TEAMS || !ready || !user || groups === null) {
    return <div className="container-page max-w-2xl py-7 lg:py-10"><div className="h-40 animate-pulse rounded-3xl bg-surface-2" /></div>;
  }

  const group = groups.find((g) => g.id === gid) ?? null;
  const doneCount = habits.filter((h) => doneToday.has(h.id)).length;
  const pct = habits.length ? Math.round((doneCount / habits.length) * 100) : 0;

  return (
    <div className="container-page max-w-2xl py-7 lg:py-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Users size={19} /></span>
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text sm:text-[28px]">Team</h1>
          <p className="text-[13px] text-text-secondary">Los hábitos de tu equipo.</p>
        </div>
      </div>

      {groups.length === 0 ? (
        <JoinCard busy={joining} onJoin={async (code, name) => {
          setJoining(true);
          try { await joinGroup(code, name); await loadGroups(); return null; }
          catch (e) { return (e as Error).message; }
          finally { setJoining(false); }
        }} defaultName={user.name} />
      ) : (
        <>
          {/* Group switcher */}
          {groups.length > 1 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {groups.map((g) => (
                <button key={g.id} onClick={() => setGid(g.id)} className={cn("rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors", g.id === gid ? "border-accent bg-accent-soft text-accent" : "border-border text-text-secondary hover:text-text")}>{g.name}</button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="mt-6 space-y-3"><div className="h-28 animate-pulse rounded-3xl bg-surface-2" />{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-surface-2" />)}</div>
          ) : group && (
            <>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 overflow-hidden rounded-3xl accent-gradient p-5 text-accent-ink">
                <div className="flex items-center justify-between">
                  <div><p className="text-[12.5px] font-medium opacity-80">Tu equipo</p><p className="text-[22px] font-semibold">{group.name}</p></div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1.5 text-[15px] font-bold"><Zap size={15} /> {xp}</div>
                    <div className="flex items-center gap-1.5 rounded-full bg-black/15 px-3 py-1.5 text-[15px] font-bold"><Flame size={16} /> {streak}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[12.5px] font-medium opacity-90"><span>Nivel {levelForXp(xp)}</span><span>Hoy · {doneCount} de {habits.length}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/15"><motion.div className="h-full rounded-full bg-accent-ink/80" initial={false} animate={{ width: `${pct}%` }} /></div>
              </motion.div>

              {announcements.length > 0 && (
                <div className="mt-4 space-y-2">
                  {announcements.slice(0, 2).map((a) => (
                    <div key={a.id} className="flex gap-3 rounded-2xl border border-border bg-surface p-3.5">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><Megaphone size={16} /></span>
                      <div className="min-w-0">
                        <p className="text-[13.5px] font-semibold text-text">{a.title}</p>
                        {a.body && <p className="mt-0.5 text-[12.5px] leading-snug text-text-secondary">{a.body}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 space-y-2.5">
                {habits.map((h) => {
                  const done = doneToday.has(h.id); const val = colorValue(h.color);
                  return (
                    <button key={h.id} onClick={() => complete(h)} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 text-left transition-all hover:border-border-strong">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${val} 15%, transparent)`, color: val }}><HabitIcon name={h.icon} size={19} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14.5px] font-semibold text-text">{h.name}</p>
                        {h.description && <p className="text-[11.5px] leading-snug text-text-muted">{h.description}</p>}
                        {h.verify && !done && <p className="flex items-center gap-1 text-[11.5px] text-accent"><Camera size={11} /> Verificar con foto</p>}
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-0.5 text-[11.5px] font-semibold text-text-secondary"><Zap size={11} className="text-accent" /> {h.xp}</span>
                      <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors", done ? "accent-gradient text-accent-ink" : "border-2 border-border-strong")}>{done && <Check size={16} strokeWidth={3} />}</span>
                    </button>
                  );
                })}
              </div>

              <details className="mt-6 rounded-2xl border border-border bg-surface p-4">
                <summary className="cursor-pointer list-none text-[13.5px] font-semibold text-text-secondary">Unirme a otro equipo</summary>
                <div className="mt-4">
                  <JoinCard compact busy={joining} onJoin={async (code, name) => {
                    setJoining(true);
                    try { const id = await joinGroup(code, name); await loadGroups(); setGid(id); return null; }
                    catch (e) { return (e as Error).message; }
                    finally { setJoining(false); }
                  }} defaultName={user.name} />
                </div>
              </details>
            </>
          )}
        </>
      )}

      <VerifyModal open={!!verify} habit={verify ? teamHabitToHabit(verify) : null} date={todayISO()} onClose={() => setVerify(null)} onApproved={onApproved} />
    </div>
  );
}

function JoinCard({ onJoin, busy, defaultName, compact }: { onJoin: (code: string, name: string) => Promise<string | null>; busy: boolean; defaultName: string; compact?: boolean }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState(defaultName);
  const [preview, setPreview] = useState<{ name: string; memberCount: number } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    if (code.trim().length < 4) { setPreview(null); return; }
    groupByCode(code.trim()).then((g) => { if (active) setPreview(g ? { name: g.name, memberCount: g.memberCount } : null); });
    return () => { active = false; };
  }, [code]);

  const submit = async () => { setErr(""); const e = await onJoin(code.trim(), name); if (e) setErr(e); else setCode(""); };

  return (
    <div className={cn(!compact && "mt-8 rounded-3xl border border-dashed border-border p-6 text-center")}>
      {!compact && (
        <>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Users size={26} /></span>
          <p className="mt-4 text-[16px] font-semibold text-text">Únete a un equipo</p>
          <p className="mx-auto mt-1 max-w-xs text-[13px] text-text-muted">¿Tu entrenador te ha dado un código? Introdúcelo para unirte.</p>
        </>
      )}
      <div className={cn("mx-auto max-w-xs", !compact && "mt-5")}>
        <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Código (ej. ABC123)" maxLength={8} className="text-center font-mono text-[18px] font-bold tracking-[0.28em]" />
        <div className="min-h-[22px] py-1 text-[12.5px]">
          {preview ? <span className="font-medium text-accent">✓ {preview.name} · {preview.memberCount} {preview.memberCount === 1 ? "miembro" : "miembros"}</span>
            : code.trim().length >= 4 ? <span className="text-danger">No encontramos ese equipo</span> : null}
        </div>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre en el equipo" className="mt-1" />
        {err && <p className="mt-2 text-[12.5px] text-danger">{err}</p>}
        <Button size="lg" onClick={submit} disabled={!preview || busy || !name.trim()} className="mt-3 w-full group">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <><Plus size={16} /> Unirme al equipo</>}
        </Button>
      </div>
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
