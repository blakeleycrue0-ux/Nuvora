"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { FEATURE_TEAMS } from "@/lib/features";
import { Flame, Check, Camera, Users, Loader2, Plus, Zap, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { VerifyModal } from "@/components/verify/VerifyModal";
import { ProgressBubble } from "@/components/progress/ProgressBubble";
import { useConfetti } from "@/components/Confetti";
import { useCelebration } from "@/components/Celebration";
import { levelFromXP } from "@/lib/momentum/stats";
import { useAuth } from "@/lib/auth";
import { HabitIcon, colorValue } from "@/lib/icons";
import { todayISO, lastNDays } from "@/lib/momentum/date";
import {
  myMemberGroups, groupHabits, myGroupCompletions, setGroupCompletion, streakFor,
  groupByCode, joinGroup, groupAnnouncements, levelForXp,
  myMembership, setMyPlayerProfile, POSITIONS,
  listSessions, sessionAttendance, setMyAttendance,
  groupMembers, mvpVotes, castMvpVote,
  type TeamGroup, type TeamHabit, type Announcement, type TeamSession, type AttendanceStatus, type GroupPreview, type TeamMember,
} from "@/lib/teams";
import type { Habit, HabitColor, Difficulty } from "@/lib/momentum/types";
import { cn } from "@/lib/utils";

export default function TeamPage() {
  const router = useRouter();
  // Teams is disabled in personal-only mode: no UI path leads here, but guard
  // direct URL access too and send the user back to their personal home.
  useEffect(() => { if (!FEATURE_TEAMS) router.replace("/dashboard"); }, [router]);
  const { user, ready } = useAuth();
  const { fire } = useConfetti();
  const { celebrateXP } = useCelebration();
  const [groups, setGroups] = useState<TeamGroup[] | null>(null);
  const [gid, setGid] = useState<string | null>(null);
  const [habits, setHabits] = useState<TeamHabit[]>([]);
  const [doneToday, setDoneToday] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [membership, setMembership] = useState<{ position?: string; number?: number } | null>(null);
  const [sessions, setSessions] = useState<TeamSession[]>([]);
  const [myAtt, setMyAtt] = useState<Record<string, AttendanceStatus>>({});
  const [teammates, setTeammates] = useState<TeamMember[]>([]);
  const [myMvp, setMyMvp] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [verify, setVerify] = useState<TeamHabit | null>(null);
  const [joining, setJoining] = useState(false);

  const loadGroups = useCallback(async () => {
    const gs = await myMemberGroups();
    setGroups(gs);
    // Honour ?g=<id> from the workspace switcher so the right club is selected.
    const wanted = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("g") : null;
    setGid((cur) => (wanted && gs.some((g) => g.id === wanted) ? wanted : cur ?? gs[0]?.id ?? null));
  }, []);
  useEffect(() => { if (ready && user) void loadGroups(); }, [ready, user, loadGroups]);

  const load = useCallback(async () => {
    if (!gid) { setLoading(false); return; }
    setLoading(true);
    const since = lastNDays(21)[0];
    const fromISO = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const [h, c, a, mine, ss, mates] = await Promise.all([groupHabits(gid), myGroupCompletions(gid, since), groupAnnouncements(gid), myMembership(gid), listSessions(gid, fromISO), groupMembers(gid)]);
    setHabits(h);
    const today = todayISO();
    setDoneToday(new Set(c.filter((x) => x.date === today).map((x) => x.habitId)));
    setStreak(streakFor(new Set(c.map((x) => x.date))));
    const xpOf = new Map(h.map((x) => [x.id, x.xp]));
    setXp(c.reduce((sum, x) => sum + (xpOf.get(x.habitId) ?? 10), 0));
    setAnnouncements(a);
    setMembership(mine);
    setSessions(ss);
    setTeammates(mates);
    const uid = user?.id;
    const [rows, votes] = await Promise.all([sessionAttendance(ss.map((s) => s.id)), mvpVotes(ss.filter((s) => s.kind === "match").map((s) => s.id))]);
    setMyAtt(Object.fromEntries(rows.filter((r) => r.userId === uid).map((r) => [r.sessionId, r.status])));
    setMyMvp(Object.fromEntries(votes.filter((v) => v.voterId === uid).map((v) => [v.sessionId, v.nomineeId])));
    setLoading(false);
  }, [gid, user?.id]);
  useEffect(() => { if (gid) void load(); else if (groups) setLoading(false); }, [gid, groups, load]);

  const complete = async (h: TeamHabit, cx?: number, cy?: number) => {
    if (!gid) return;
    const done = doneToday.has(h.id);
    if (!done && h.verify) { setVerify(h); return; }
    setDoneToday((s) => { const n = new Set(s); if (done) n.delete(h.id); else n.add(h.id); return n; });
    if (!done) { // just completed → same feel as personal: confetti + XP pop
      const x = cx ?? window.innerWidth / 2, y = cy ?? window.innerHeight / 2;
      fire(x, y); celebrateXP(h.xp, x, y);
    }
    await setGroupCompletion(gid, h.id, !done);
    void load();
  };
  const onApproved = async () => {
    if (!gid || !verify) return;
    setDoneToday((s) => new Set(s).add(verify.id));
    const x = window.innerWidth / 2, y = window.innerHeight / 2;
    fire(x, y); celebrateXP(verify.xp, x, y);
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
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 overflow-hidden rounded-3xl p-5 text-white" style={{ background: group.color || "var(--accent)" }}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/20 text-[22px] font-bold">
                      {group.crestUrl
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={group.crestUrl} alt="" className="h-full w-full object-cover" />
                        : (group.crest || group.name.charAt(0).toUpperCase())}
                    </span>
                    <div className="min-w-0"><p className="text-[12.5px] font-medium opacity-80">Tu equipo</p><p className="truncate text-[22px] font-semibold">{group.name}</p></div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-[15px] font-bold"><Zap size={15} /> {xp}</div>
                    <div className="flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-[15px] font-bold"><Flame size={16} /> {streak}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[12.5px] font-medium opacity-90"><span>Nivel {levelForXp(xp)}</span><span>Hoy · {doneCount} de {habits.length}</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/20"><motion.div className="h-full rounded-full bg-white/85" initial={false} animate={{ width: `${pct}%` }} /></div>
              </motion.div>

              {/* Team progress bubble */}
              <div className="mt-4 flex flex-col items-center rounded-3xl border border-border bg-surface px-6 py-7 shadow-[var(--shadow-sm)]">
                <ProgressBubble pct={levelFromXP(xp).pct} level={levelFromXP(xp).level} xp={xp} size={200} />
                <p className="mt-4 text-[13.5px] font-medium text-text-secondary">Hoy · {doneCount} de {habits.length} completado{habits.length === 1 ? "" : "s"}</p>
              </div>

              {membership && <PlayerCard groupId={group.id} membership={membership} onSaved={load} />}

              {/* Upcoming sessions — RSVP */}
              {sessions.filter((s) => new Date(s.startsAt) >= new Date()).length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Próximo</p>
                  <div className="space-y-2.5">
                    {sessions.filter((s) => new Date(s.startsAt) >= new Date()).slice(0, 4).map((s) => {
                      const d = new Date(s.startsAt);
                      const mine = myAtt[s.id];
                      const rsvp = async (status: AttendanceStatus) => {
                        setMyAtt((m) => ({ ...m, [s.id]: status }));
                        await setMyAttendance(s.id, group.id, status);
                      };
                      return (
                        <div key={s.id} className="rounded-2xl border border-border bg-surface p-3.5">
                          <div className="flex items-center gap-2">
                            <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase", s.kind === "match" ? "bg-accent-soft text-accent" : "bg-surface-2 text-text-secondary")}>{s.kind === "match" ? "Partido" : s.kind === "training" ? "Entreno" : "Otro"}</span>
                            <p className="truncate text-[14px] font-semibold text-text">{s.title}</p>
                          </div>
                          <p className="mt-1 text-[12px] text-text-muted">{d.toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" })} · {d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}{s.location ? ` · ${s.location}` : ""}</p>
                          <div className="mt-2.5 flex gap-2">
                            {(["going", "maybe", "out"] as AttendanceStatus[]).map((st) => (
                              <button key={st} onClick={() => rsvp(st)}
                                className={cn("flex-1 rounded-xl border py-2 text-[12.5px] font-semibold transition-colors",
                                  mine === st ? "border-accent bg-accent-soft text-accent" : "border-border text-text-secondary hover:text-text")}>
                                {st === "going" ? "Voy" : st === "maybe" ? "Quizá" : "No voy"}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recent matches — result + MVP vote */}
              {sessions.filter((s) => s.kind === "match" && new Date(s.startsAt) < new Date()).length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Partidos</p>
                  <div className="space-y-2.5">
                    {sessions.filter((s) => s.kind === "match" && new Date(s.startsAt) < new Date()).slice(0, 3).map((s) => {
                      const hasResult = s.scoreUs != null && s.scoreThem != null;
                      const vote = async (nomineeId: string) => {
                        setMyMvp((m) => ({ ...m, [s.id]: nomineeId }));
                        await castMvpVote(s.id, group.id, nomineeId);
                      };
                      return (
                        <div key={s.id} className="rounded-2xl border border-border bg-surface p-3.5">
                          <p className="truncate text-[14px] font-semibold text-text">{s.title}</p>
                          {hasResult
                            ? <p className="mt-0.5 text-[13px] text-text-secondary">Resultado: <span className="font-semibold text-accent">{s.scoreUs}–{s.scoreThem}</span>{s.opponent ? ` vs ${s.opponent}` : ""}</p>
                            : <p className="mt-0.5 text-[12px] text-text-muted">Resultado pendiente</p>}
                          <label className="mt-2.5 block text-[11.5px] font-medium text-text-muted">Vota al MVP</label>
                          <select value={myMvp[s.id] ?? ""} onChange={(e) => e.target.value && vote(e.target.value)}
                            className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-[13.5px] text-text outline-none focus:border-accent">
                            <option value="">Elegir jugador…</option>
                            {teammates.map((m) => <option key={m.userId} value={m.userId}>{m.number != null ? `#${m.number} ` : ""}{m.displayName}</option>)}
                          </select>
                          {myMvp[s.id] && <p className="mt-1.5 text-[12px] text-accent">✓ Tu voto: {teammates.find((m) => m.userId === myMvp[s.id])?.displayName}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

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
                    <button key={h.id} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); complete(h, r.left + r.width / 2, r.top + r.height / 2); }} className="flex w-full items-center gap-3 rounded-2xl border border-border bg-surface p-3.5 text-left transition-all hover:border-border-strong">
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

function PlayerCard({ groupId, membership, onSaved }: { groupId: string; membership: { position?: string; number?: number }; onSaved: () => void | Promise<void> }) {
  const [position, setPosition] = useState(membership.position ?? "—");
  const [number, setNumber] = useState<string>(membership.number != null ? String(membership.number) : "");
  const [busy, setBusy] = useState(false);
  const dirty = (position === "—" ? undefined : position) !== membership.position || (number === "" ? undefined : Number(number)) !== membership.number;

  const save = async () => {
    setBusy(true);
    try { await setMyPlayerProfile(groupId, position === "—" ? null : position, number === "" ? null : Number(number)); await onSaved(); }
    finally { setBusy(false); }
  };

  return (
    <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
      <p className="text-[13px] font-semibold text-text-secondary">Mi ficha</p>
      <div className="mt-3 flex items-end gap-2">
        <div className="flex-1">
          <label className="text-[11.5px] font-medium text-text-muted">Dorsal</label>
          <Input type="number" min={0} max={99} value={number} onChange={(e) => setNumber(e.target.value)} placeholder="#" className="mt-1" />
        </div>
        <div className="flex-1">
          <label className="text-[11.5px] font-medium text-text-muted">Posición</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)} className="mt-1 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-[13.5px] text-text outline-none focus:border-accent">
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <Button size="lg" onClick={save} disabled={busy || !dirty}>{busy ? <Loader2 size={16} className="animate-spin" /> : "Guardar"}</Button>
      </div>
    </div>
  );
}

function JoinCard({ onJoin, busy, defaultName, compact }: { onJoin: (code: string, name: string) => Promise<string | null>; busy: boolean; defaultName: string; compact?: boolean }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState(defaultName);
  const [preview, setPreview] = useState<GroupPreview | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    if (code.trim().length < 4) { setPreview(null); return; }
    groupByCode(code.trim()).then((g) => { if (active) setPreview(g); });
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
          {!preview && code.trim().length >= 4 ? <span className="text-danger">No encontramos ese equipo</span> : null}
        </div>
        {preview && (
          <div className="mx-auto mb-1 flex items-center gap-2.5 rounded-2xl p-2.5 text-left text-white" style={{ background: preview.color || "var(--accent)" }}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/20 text-[16px] font-bold">
              {preview.crestUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={preview.crestUrl} alt="" className="h-full w-full object-cover" />
                : (preview.crest || preview.name.charAt(0).toUpperCase())}
            </span>
            <div className="min-w-0"><p className="truncate text-[13.5px] font-semibold">{preview.name}</p><p className="text-[11px] opacity-90">{preview.memberCount} {preview.memberCount === 1 ? "miembro" : "miembros"}</p></div>
          </div>
        )}
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
