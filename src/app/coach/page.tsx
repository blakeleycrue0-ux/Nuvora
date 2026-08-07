"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Users, Plus, Check, X, Flame, Trophy, Copy, LogOut, Share2, ArrowRight, ArrowLeft, ShieldCheck,
  Loader2, Camera, LayoutGrid, ListChecks, Megaphone, Settings as SettingsIcon, Trash2, Zap,
  ImagePlus, CalendarDays, MapPin, Clock,
} from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { useAuth } from "@/lib/auth";
import { FEATURE_TEAMS } from "@/lib/features";
import { HabitIcon, colorValue, HABIT_COLORS } from "@/lib/icons";
import { todayISO, lastNDays } from "@/lib/momentum/date";
import {
  createGroup, myOwnedGroups, groupHabits, groupMembers, groupCompletions,
  addGroupHabit, deleteGroupHabit, setMemberRole, setMemberProfile, removeMember,
  groupAnnouncements, postAnnouncement, deleteAnnouncement,
  updateGroupIdentity, uploadCrest, deleteGroup, buildLeaderboard, streakFor,
  listSessions, createSession, deleteSession, sessionAttendance,
  TASK_TYPES, SPORTS, POSITIONS, type LeaderPeriod, type TeamSession, type SessionKind, type Attendance,
  type TeamGroup, type TeamHabit, type TeamMember, type NewHabit, type Announcement, type MemberRole,
} from "@/lib/teams";
import { cn } from "@/lib/utils";

const CLUB_COLORS = ["#45c68e", "#2563eb", "#dc2626", "#f59e0b", "#7c3aed", "#0ea5e9", "#e11d48", "#0f172a"];

// Copy that also works on mobile / non-secure contexts where the async
// Clipboard API can silently fail.
async function robustCopy(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through */ }
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

// Small club crest badge (image / emoji / initial) in the club color.
function CrestBadge({ group, size = 44 }: { group: TeamGroup; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center overflow-hidden rounded-2xl font-bold text-white shadow-[var(--shadow-sm)]"
      style={{ width: size, height: size, background: group.color || "var(--accent)", fontSize: size * 0.4 }}>
      {group.crestUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={group.crestUrl} alt="" className="h-full w-full object-cover" />
        : (group.crest || group.name.charAt(0).toUpperCase())}
    </span>
  );
}

const SUGGESTED: NewHabit[] = [
  { name: "Descanso 8h", icon: "bed", color: "c-indigo", xp: 10 },
  { name: "Hidratación", icon: "glass-water", color: "c-sky", xp: 10 },
  { name: "Movilidad", icon: "waves", color: "c-teal", xp: 15 },
  { name: "Entreno individual", icon: "dumbbell", color: "c-rose", verify: true, type: "ai_photo", xp: 25 },
  { name: "Nutrición", icon: "salad", color: "c-emerald", xp: 15 },
  { name: "Ver partido", icon: "target", color: "c-amber", type: "match", xp: 20 },
];

export default function CoachPage() {
  const router = useRouter();
  const { user, ready, signOut } = useAuth();
  const [groups, setGroups] = useState<TeamGroup[] | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [wantsNew, setWantsNew] = useState(false);
  const isPersonal = user?.accountType === "personal";

  // Teams disabled in personal-only mode: guard direct URL access.
  useEffect(() => { if (!FEATURE_TEAMS) router.replace("/dashboard"); }, [router]);

  // Read intent from the URL: ?new=1 opens the create flow, ?g=<id> selects a club.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const isNew = p.get("new") === "1";
    setWantsNew(isNew); // eslint-disable-line react-hooks/set-state-in-effect
    const g = p.get("g");
    if (isNew) setActive("__new__"); // eslint-disable-line react-hooks/set-state-in-effect
    else if (g) setActive(g); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (!user) { router.replace("/login"); return; }
    if (!user.accountType) { router.replace("/welcome"); return; }
  }, [ready, user, router]);

  const load = useCallback(async () => {
    const g = await myOwnedGroups();
    setGroups(g);
    setActive((a) => (a && (a === "__new__" || g.some((x) => x.id === a)) ? a : g[0]?.id ?? null));
  }, []);

  // Anyone with an account can manage clubs they own; coaches land here to
  // create their first club. A personal user with no clubs (and not creating
  // one) belongs back in their personal app.
  useEffect(() => {
    if (ready && user?.accountType) void load();
  }, [ready, user, load]);
  useEffect(() => {
    if (groups && isPersonal && groups.length === 0 && !wantsNew) router.replace("/dashboard");
  }, [groups, isPersonal, wantsNew, router]);

  if (!FEATURE_TEAMS || !ready || !user || !user.accountType || groups === null) {
    return <div className="flex min-h-screen items-center justify-center bg-bg"><div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" /></div>;
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-bg/80 px-5 pt-[env(safe-area-inset-top)] backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-2.5">
          <Wordmark href={null} />
          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] font-medium text-text-secondary">Club</span>
        </div>
        <div className="flex items-center gap-2">
          {isPersonal && (
            <button onClick={() => router.push("/dashboard")} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-2 hover:text-text">
              <ArrowLeft size={15} /> Mi app personal
            </button>
          )}
          <button onClick={signOut} aria-label="Cerrar sesión" className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-2 hover:text-danger">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-7 sm:px-8 lg:py-10">
        {groups.length === 0 ? (
          <CreateGroup onCreated={async () => { setWantsNew(false); await load(); }} coachName={user.name} />
        ) : (
          <Dashboard groups={groups} active={active ?? groups[0]?.id ?? "__new__"} setActive={setActive} onNewGroup={() => setActive("__new__")} reload={load} coachName={user.name} />
        )}
      </main>
    </div>
  );
}

/* ---------------- create group ---------------- */

const MAX_HABITS = 5;

function CreateGroup({ onCreated, coachName }: { onCreated: () => Promise<void>; coachName: string }) {
  const [name, setName] = useState("");
  const [chosen, setChosen] = useState<NewHabit[]>(SUGGESTED.slice(0, 4));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const has = (n: string) => chosen.some((h) => h.name.toLowerCase() === n.toLowerCase());
  const add = (h: NewHabit) => setChosen((c) => (c.length >= MAX_HABITS || has(h.name) ? c : [...c, h]));
  const remove = (n: string) => setChosen((c) => c.filter((h) => h.name !== n));

  const create = async () => {
    setErr(""); setBusy(true);
    try {
      await createGroup(name || `Equipo de ${coachName.split(" ")[0]}`, chosen);
      await onCreated();
    } catch (e) { setErr((e as Error).message); setBusy(false); }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl">
      <div className="flex justify-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl accent-gradient text-accent-ink shadow-[var(--shadow-glow)]"><Users size={30} /></span>
      </div>
      <h1 className="mt-6 text-center text-[26px] font-semibold tracking-[-0.02em] sm:text-[30px]">Crea tu club</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-[14.5px] leading-relaxed text-text-secondary">Ponle nombre y define hasta {MAX_HABITS} tareas. Puedes usar sugerencias o crear las tuyas.</p>

      <div className="mt-7 rounded-3xl border border-border bg-surface p-6">
        <label className="text-[12.5px] font-semibold text-text-secondary">Nombre del club</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Alevín A, Primer equipo…" className="mt-2" autoFocus />

        <div className="mt-6 flex items-center justify-between">
          <p className="text-[12.5px] font-semibold text-text-secondary">Tareas ({chosen.length}/{MAX_HABITS})</p>
        </div>

        <div className="mt-2.5 space-y-2">
          {chosen.length === 0 && <p className="rounded-2xl border border-dashed border-border p-4 text-center text-[13px] text-text-muted">Añade tareas abajo o crea una propia.</p>}
          {chosen.map((h) => <ChosenRow key={h.name} h={h} onRemove={() => remove(h.name)} />)}
        </div>

        <CustomHabitForm disabled={chosen.length >= MAX_HABITS} onAdd={add} />

        {chosen.length < MAX_HABITS && (
          <div className="mt-5">
            <p className="text-[12px] font-semibold text-text-muted">Sugerencias</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUGGESTED.filter((h) => !has(h.name)).map((h) => (
                <button key={h.name} onClick={() => add(h)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-[12.5px] text-text-secondary hover:border-border-strong hover:text-text">
                  <HabitIcon name={h.icon} size={13} style={{ color: colorValue(h.color) }} /> {h.name} <Plus size={12} />
                </button>
              ))}
            </div>
          </div>
        )}

        {err && <p className="mt-4 text-[13px] text-danger">{err}</p>}
        <Button size="lg" onClick={create} disabled={busy || chosen.length === 0} className="mt-6 w-full group">
          {busy ? <Loader2 size={17} className="animate-spin" /> : <>Crear club <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" /></>}
        </Button>
      </div>
    </motion.div>
  );
}

function ChosenRow({ h, onRemove }: { h: NewHabit; onRemove: () => void }) {
  const val = colorValue(h.color);
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${val} 16%, transparent)`, color: val }}><HabitIcon name={h.icon} size={17} /></span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-medium">{h.name}</p>
        {h.description && <p className="truncate text-[11.5px] text-text-muted">{h.description}</p>}
      </div>
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-text-secondary"><Zap size={11} className="text-accent" /> {h.xp ?? 10}</span>
      {h.verify && <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-accent"><Camera size={11} /> IA</span>}
      <button onClick={onRemove} aria-label="Quitar" className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-danger"><X size={15} /></button>
    </div>
  );
}

const CUSTOM_ICONS = ["sparkles", "dumbbell", "bed", "glass-water", "salad", "book-open", "brain", "heart", "waves", "footprints", "target", "flame", "sunrise", "leaf", "music", "notebook-pen"];

function CustomHabitForm({ onAdd, disabled, startOpen, onCancel }: { onAdd: (h: NewHabit) => void | Promise<void>; disabled: boolean; startOpen?: boolean; onCancel?: () => void }) {
  const [open, setOpen] = useState(!!startOpen);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("sparkles");
  const [color, setColor] = useState("c-emerald");
  const [type, setType] = useState<NewHabit["type"]>("daily");
  const [xp, setXp] = useState(10);
  const [verify, setVerify] = useState(false);

  const reset = () => { setName(""); setDesc(""); setIcon("sparkles"); setColor("c-emerald"); setType("daily"); setXp(10); setVerify(false); };
  const submit = () => {
    if (!name.trim()) return;
    void onAdd({ name: name.trim(), description: desc.trim() || undefined, icon, color, type, xp, verify });
    reset();
    if (!startOpen) setOpen(false);
  };
  const cancel = () => { if (startOpen) onCancel?.(); else setOpen(false); };

  // Choosing a verification task type turns on photo verification automatically.
  const chooseType = (t: NewHabit["type"]) => {
    setType(t);
    const meta = TASK_TYPES.find((x) => x.key === t);
    if (meta?.verify) setVerify(true);
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} disabled={disabled}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border-strong p-3 text-[13.5px] font-semibold text-accent transition-colors hover:bg-accent-soft disabled:opacity-40">
        <Plus size={16} /> Crear tarea propia
      </button>
    );
  }

  const val = colorValue(color);
  return (
    <div className="mt-3 rounded-2xl border border-accent/40 bg-accent-soft/40 p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${val} 18%, transparent)`, color: val }}><HabitIcon name={icon} size={20} /></span>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre de la tarea" autoFocus />
      </div>
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción (opcional) — qué cuenta como hecho, cómo hacerlo…"
        rows={2} className="mt-2.5 w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-text outline-none placeholder:text-text-muted focus:border-accent" />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11.5px] font-semibold text-text-muted">Tipo de tarea</p>
          <select value={type} onChange={(e) => chooseType(e.target.value as NewHabit["type"])}
            className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] text-text outline-none focus:border-accent">
            {TASK_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <p className="text-[11.5px] font-semibold text-text-muted">XP por completar</p>
          <Input type="number" min={0} max={500} value={xp} onChange={(e) => setXp(Math.max(0, Number(e.target.value) || 0))} className="mt-1.5" />
        </div>
      </div>

      <p className="mt-3 text-[11.5px] font-semibold text-text-muted">Icono</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {CUSTOM_ICONS.map((k) => (
          <button key={k} onClick={() => setIcon(k)} className={cn("flex h-9 w-9 items-center justify-center rounded-xl border transition-colors", icon === k ? "border-accent text-accent" : "border-border text-text-secondary hover:text-text")}>
            <HabitIcon name={k} size={16} />
          </button>
        ))}
      </div>

      <p className="mt-3 text-[11.5px] font-semibold text-text-muted">Color</p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {HABIT_COLORS.map((c) => (
          <button key={c.key} onClick={() => setColor(c.key)} aria-label={c.key}
            className={cn("h-7 w-7 rounded-full transition-transform hover:scale-110", color === c.key && "ring-2 ring-offset-2 ring-offset-surface")}
            style={{ background: c.value, boxShadow: color === c.key ? `0 0 0 2px ${c.value}` : undefined }} />
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface p-3">
        <div className="flex items-center gap-2"><Camera size={15} className="text-accent" /><span className="text-[13px] font-medium">Verificar con foto (IA)</span></div>
        <Toggle checked={verify} onChange={setVerify} label="Verificar con IA" />
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={cancel} className="h-10 flex-1 rounded-xl border border-border text-[13.5px] font-medium text-text-secondary">Cancelar</button>
        <button onClick={submit} disabled={!name.trim()} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl accent-gradient text-[13.5px] font-semibold text-accent-ink disabled:opacity-50"><Plus size={15} /> Añadir tarea</button>
      </div>
    </div>
  );
}

/* ---------------- dashboard (tabbed) ---------------- */

type Tab = "overview" | "players" | "tasks" | "agenda" | "leaderboard" | "announcements" | "settings";
const TABS: { key: Tab; label: string; icon: typeof LayoutGrid }[] = [
  { key: "overview", label: "Resumen", icon: LayoutGrid },
  { key: "players", label: "Jugadores", icon: Users },
  { key: "tasks", label: "Tareas", icon: ListChecks },
  { key: "agenda", label: "Agenda", icon: CalendarDays },
  { key: "leaderboard", label: "Clasificación", icon: Trophy },
  { key: "announcements", label: "Anuncios", icon: Megaphone },
  { key: "settings", label: "Ajustes", icon: SettingsIcon },
];

function Dashboard({ groups, active, setActive, onNewGroup, reload, coachName }: {
  groups: TeamGroup[]; active: string; setActive: (id: string) => void; onNewGroup: () => void; reload: () => Promise<void>; coachName: string;
}) {
  const creating = active === "__new__";
  const group = groups.find((g) => g.id === active) ?? groups[0];
  const [tab, setTab] = useState<Tab>("overview");
  const [habits, setHabits] = useState<TeamHabit[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [comp, setComp] = useState<{ habitId: string; userId: string; date: string; count: number }[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const gid = group?.id;
  const loadData = useCallback(async () => {
    if (!gid) return;
    setLoading(true);
    const since = lastNDays(30)[0];
    const [h, m, c, a] = await Promise.all([groupHabits(gid), groupMembers(gid), groupCompletions(gid, since), groupAnnouncements(gid)]);
    setHabits(h); setMembers(m); setComp(c); setAnnouncements(a); setLoading(false);
  }, [gid]);
  useEffect(() => { if (!creating) void loadData(); }, [creating, loadData]);

  if (creating) return <CreateGroup onCreated={async () => { await reload(); setActive(groups[0]?.id ?? ""); }} coachName={coachName} />;
  if (!group) return null;

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
          <span className="text-[13px] text-text-muted">{members.length} {members.length === 1 ? "jugador" : "jugadores"}</span>
        </div>
        <Button size="sm" variant="secondary" onClick={onNewGroup}><Plus size={15} /> Nuevo club</Button>
      </div>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors",
                tab === t.key ? "bg-accent-soft text-accent" : "text-text-secondary hover:text-text")}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="h-64 animate-pulse rounded-3xl bg-surface-2" />
        ) : tab === "overview" ? (
          <OverviewTab group={group} habits={habits} members={members} comp={comp} />
        ) : tab === "players" ? (
          <PlayersTab members={members} comp={comp} onChange={loadData} />
        ) : tab === "tasks" ? (
          <TasksTab group={group} habits={habits} onChange={loadData} />
        ) : tab === "agenda" ? (
          <AgendaTab group={group} members={members} />
        ) : tab === "leaderboard" ? (
          <LeaderboardTab members={members} habits={habits} comp={comp} />
        ) : tab === "announcements" ? (
          <AnnouncementsTab group={group} items={announcements} onChange={loadData} />
        ) : (
          <SettingsTab group={group} onChange={reload} />
        )}
      </div>
    </div>
  );
}

/* ---------------- invite card (shared) ---------------- */

function InviteCard({ group }: { group: TeamGroup }) {
  const [copied, setCopied] = useState<"" | "code" | "link">("");
  const inviteUrl = typeof window !== "undefined" ? `${window.location.origin}/join?code=${group.inviteCode}` : "";
  const flash = (w: "code" | "link") => { setCopied(w); setTimeout(() => setCopied(""), 1500); };
  const copyCode = async () => { if (await robustCopy(group.inviteCode)) flash("code"); };
  const copyLink = async () => { if (await robustCopy(inviteUrl)) flash("link"); };
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: "Únete a mi club en Fenom", text: `Código: ${group.inviteCode}`, url: inviteUrl }); return; } catch {} }
    void copyLink();
  };
  return (
    <div className="rounded-3xl border border-accent/40 bg-surface p-5 shadow-[var(--shadow-glow)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CrestBadge group={group} />
          <div>
            <p className="text-[12.5px] font-medium text-text-muted">Código de invitación</p>
            <p className="mt-0.5 font-mono text-[30px] font-bold tracking-[0.18em] text-text">{group.inviteCode}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={copyCode}><Copy size={15} /> {copied === "code" ? "¡Copiado!" : "Copiar código"}</Button>
          <Button size="sm" variant="secondary" onClick={copyLink}><Copy size={15} /> {copied === "link" ? "¡Copiado!" : "Copiar enlace"}</Button>
          <Button size="sm" onClick={share}><Share2 size={15} /> Compartir</Button>
        </div>
      </div>
      <p className="mt-3 text-[12.5px] text-text-secondary">Comparte el código o el enlace. Tus jugadores entran, se unen y empiezan a registrar.</p>
    </div>
  );
}

/* ---------------- overview ---------------- */

function OverviewTab({ group, habits, members, comp }: { group: TeamGroup; habits: TeamHabit[]; members: TeamMember[]; comp: { habitId: string; userId: string; date: string; count: number }[] }) {
  const today = todayISO();
  const board = useMemo(() => buildLeaderboard(members, habits, comp, "week", 7), [members, habits, comp]);
  const doneToday = comp.filter((c) => c.date === today).length;
  const possibleToday = habits.length * members.length;
  const todayPct = possibleToday ? Math.round((doneToday / possibleToday) * 100) : 0;
  const top = board[0];

  return (
    <div className="space-y-5">
      <InviteCard group={group} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Jugadores" value={String(members.length)} />
        <StatCard icon={ListChecks} label="Tareas" value={String(habits.length)} />
        <StatCard icon={ShieldCheck} label="Cumplimiento hoy" value={`${todayPct}%`} />
        <StatCard icon={Trophy} label="Líder" value={top ? top.member.displayName : "—"} sub={top ? `${top.xp} XP` : undefined} />
      </div>
      {members.length === 0 && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Users size={26} /></span>
          <div>
            <p className="text-[15px] font-semibold">Aún no hay nadie en el club</p>
            <p className="mt-1 text-[13px] text-text-muted">Comparte el código de arriba para que tu equipo se una.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Icon size={18} /></span>
      <p className="mt-3 truncate text-[22px] font-semibold text-text">{value}</p>
      <p className="text-[12.5px] text-text-muted">{label}{sub ? ` · ${sub}` : ""}</p>
    </div>
  );
}

/* ---------------- players (compliance + roles) ---------------- */

const ROLE_LABELS: Record<MemberRole, string> = {
  owner: "Propietario", admin: "Administrador", coach: "Entrenador", assistant: "Ayudante", player: "Jugador",
};
const ROLE_OPTIONS: MemberRole[] = ["player", "assistant", "coach", "admin"];

function PlayersTab({ members, comp, onChange }: { members: TeamMember[]; comp: { habitId: string; userId: string; date: string }[]; onChange: () => Promise<void> }) {
  const stats = useMemo(() => {
    return members.map((m) => {
      const dates = new Set(comp.filter((c) => c.userId === m.userId).map((c) => c.date));
      return { m, streak: streakFor(dates) };
    });
  }, [members, comp]);

  if (members.length === 0) return <Empty icon={Users} title="Aún no hay jugadores" sub="Comparte el código de invitación desde Resumen o Ajustes." />;

  return (
    <div className="space-y-2.5">
      {stats.map(({ m, streak }) => (
        <div key={m.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-surface p-3.5">
          <Avatar name={m.displayName} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-semibold text-text">
              {m.number != null && <span className="mr-1.5 text-text-muted">#{m.number}</span>}{m.displayName}
            </p>
            <p className="text-[12px] text-text-muted">{ROLE_LABELS[m.role]}{m.position ? ` · ${m.position}` : ""}</p>
          </div>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold"><Flame size={13} className="text-accent" /> {streak}</span>
          <input type="number" min={0} max={99} defaultValue={m.number ?? ""} placeholder="#"
            onBlur={async (e) => { const v = e.target.value === "" ? null : Number(e.target.value); if (v !== (m.number ?? null)) { await setMemberProfile(m.id, m.position ?? null, v); await onChange(); } }}
            className="w-12 rounded-lg border border-border bg-surface px-2 py-1.5 text-center text-[12.5px] text-text outline-none focus:border-accent" />
          <select value={m.position ?? "—"} onChange={async (e) => { await setMemberProfile(m.id, e.target.value === "—" ? null : e.target.value, m.number ?? null); await onChange(); }}
            className="rounded-lg border border-border bg-surface px-2 py-1.5 text-[12.5px] text-text-secondary outline-none focus:border-accent">
            {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={m.role} onChange={async (e) => { await setMemberRole(m.id, e.target.value as MemberRole); await onChange(); }}
            className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12.5px] text-text-secondary outline-none focus:border-accent">
            {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <button onClick={async () => { if (confirm(`¿Quitar a ${m.displayName} del club?`)) { await removeMember(m.id); await onChange(); } }}
            aria-label="Quitar" className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-surface-2 hover:text-danger"><X size={16} /></button>
        </div>
      ))}
      <p className="pt-2 text-center text-[11.5px] text-text-muted"><ShieldCheck size={11} className="mr-1 inline text-accent" /> Nunca ves las fotos de verificación, solo si la tarea está hecha.</p>
    </div>
  );
}

/* ---------------- tasks management ---------------- */

function TasksTab({ group, habits, onChange }: { group: TeamGroup; habits: TeamHabit[]; onChange: () => Promise<void> }) {
  const [showAdd, setShowAdd] = useState(false);
  return (
    <div className="rounded-3xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-text-secondary">Tareas del club ({habits.length})</p>
        {habits.length < MAX_HABITS && !showAdd && (
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent"><Plus size={15} /> Añadir tarea</button>
        )}
      </div>

      <div className="mt-3 space-y-2">
        {habits.length === 0 && <p className="rounded-2xl border border-dashed border-border p-4 text-center text-[13px] text-text-muted">Aún no hay tareas. Añade la primera.</p>}
        {habits.map((h) => {
          const val = colorValue(h.color);
          const typeLabel = TASK_TYPES.find((t) => t.key === h.type)?.label ?? h.type;
          return (
            <div key={h.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: `color-mix(in oklab, ${val} 16%, transparent)`, color: val }}><HabitIcon name={h.icon} size={17} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-text">{h.name}</p>
                <p className="truncate text-[11.5px] text-text-muted">{typeLabel}{h.description ? ` · ${h.description}` : ""}</p>
              </div>
              <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-text-secondary"><Zap size={11} className="text-accent" /> {h.xp}</span>
              {h.verify && <span className="inline-flex items-center gap-0.5 text-[10.5px] font-semibold text-accent"><Camera size={11} /> IA</span>}
              <button onClick={async () => { if (confirm(`¿Quitar "${h.name}"?`)) { await deleteGroupHabit(h.id); await onChange(); } }} aria-label="Quitar" className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:bg-surface hover:text-danger"><X size={15} /></button>
            </div>
          );
        })}
      </div>

      {showAdd && habits.length < MAX_HABITS && (
        <div className="mt-3">
          <CustomHabitForm disabled={false} startOpen onCancel={() => setShowAdd(false)} onAdd={async (h) => {
            await addGroupHabit(group.id, h, habits.length);
            setShowAdd(false);
            await onChange();
          }} />
        </div>
      )}
      {habits.length >= MAX_HABITS && <p className="mt-3 text-center text-[11.5px] text-text-muted">Has alcanzado el máximo de {MAX_HABITS} tareas del plan gratuito.</p>}
    </div>
  );
}

/* ---------------- leaderboard ---------------- */

const PERIODS: { key: LeaderPeriod; label: string; days: number }[] = [
  { key: "today", label: "Hoy", days: 1 },
  { key: "week", label: "Semana", days: 7 },
  { key: "month", label: "Mes", days: 30 },
  { key: "season", label: "Temporada", days: 3650 },
  { key: "all", label: "Histórico", days: 3650 },
];

function LeaderboardTab({ members, habits, comp }: { members: TeamMember[]; habits: TeamHabit[]; comp: { habitId: string; userId: string; date: string; count: number }[] }) {
  const [period, setPeriod] = useState<LeaderPeriod>("week");
  const days = PERIODS.find((p) => p.key === period)!.days;
  const board = useMemo(() => buildLeaderboard(members, habits, comp, period, days), [members, habits, comp, period, days]);

  if (members.length === 0) return <Empty icon={Trophy} title="Sin clasificación todavía" sub="Cuando tus jugadores se unan y completen tareas aparecerán aquí." />;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {PERIODS.map((p) => (
          <button key={p.key} onClick={() => setPeriod(p.key)}
            className={cn("rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors", period === p.key ? "border-accent bg-accent-soft text-accent" : "border-border text-text-secondary hover:text-text")}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-surface shadow-[var(--shadow-sm)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="text-text-muted">
                <th className="p-3 text-[12px] font-medium">#</th>
                <th className="p-3 text-[12px] font-medium">Jugador</th>
                <th className="p-3 text-center text-[12px] font-medium">Nivel</th>
                <th className="p-3 text-center text-[12px] font-medium">Racha</th>
                <th className="p-3 text-center text-[12px] font-medium">Tareas</th>
                <th className="p-3 text-center text-[12px] font-medium">%</th>
                <th className="p-3 text-right text-[12px] font-medium">XP</th>
              </tr>
            </thead>
            <tbody>
              {board.map((r, i) => (
                <tr key={r.member.id} className={cn("border-t border-border", i === 0 && "bg-accent-soft/50")}>
                  <td className="p-3"><span className={cn("flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold", i === 0 ? "accent-gradient text-accent-ink" : "bg-surface-2 text-text-secondary")}>{i + 1}</span></td>
                  <td className="p-3"><div className="flex items-center gap-2.5"><Avatar name={r.member.displayName} /><span className="text-[13.5px] font-medium">{r.member.displayName}</span></div></td>
                  <td className="p-3 text-center text-[13px] font-semibold">{r.level}</td>
                  <td className="p-3 text-center"><span className="inline-flex items-center gap-1 text-[13px] font-semibold"><Flame size={12} className="text-accent" />{r.streak}</span></td>
                  <td className="p-3 text-center text-[13px]">{r.completed}</td>
                  <td className="p-3 text-center text-[13px]">{r.completionRate}%</td>
                  <td className="p-3 text-right text-[13.5px] font-bold text-accent">{r.xp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ---------------- announcements ---------------- */

function AnnouncementsTab({ group, items, onChange }: { group: TeamGroup; items: Announcement[]; onChange: () => Promise<void> }) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const post = async () => {
    if (!title.trim()) return;
    setBusy(true);
    try { await postAnnouncement(group.id, title, body); setTitle(""); setBody(""); await onChange(); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-surface p-5">
        <p className="text-[13px] font-semibold text-text-secondary">Nuevo anuncio</p>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título — ej. Partido el sábado 10:00" className="mt-3" />
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Mensaje para el equipo (opcional)" rows={3}
          className="mt-2.5 w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-text outline-none placeholder:text-text-muted focus:border-accent" />
        <Button size="sm" onClick={post} disabled={busy || !title.trim()} className="mt-3">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <><Megaphone size={15} /> Publicar</>}
        </Button>
      </div>

      {items.length === 0 ? (
        <Empty icon={Megaphone} title="Sin anuncios" sub="Publica novedades, convocatorias o recordatorios para tu equipo." />
      ) : (
        <div className="space-y-2.5">
          {items.map((a) => (
            <div key={a.id} className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14.5px] font-semibold text-text">{a.title}</p>
                  {a.body && <p className="mt-1 whitespace-pre-wrap text-[13px] leading-relaxed text-text-secondary">{a.body}</p>}
                  <p className="mt-2 text-[11.5px] text-text-muted">{new Date(a.createdAt).toLocaleDateString("es", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <button onClick={async () => { if (confirm("¿Eliminar este anuncio?")) { await deleteAnnouncement(a.id); await onChange(); } }}
                  aria-label="Eliminar" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-2 hover:text-danger"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- settings ---------------- */

function SettingsTab({ group, onChange }: { group: TeamGroup; onChange: () => Promise<void> }) {
  const [name, setName] = useState(group.name);
  const [sport, setSport] = useState(group.sport);
  const [color, setColor] = useState(group.color);
  const [crest, setCrest] = useState(group.crest ?? "");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const router = useRouter();

  const dirty = name.trim() !== group.name || sport !== group.sport || color !== group.color || (crest.trim() || "") !== (group.crest ?? "");
  const save = async () => {
    if (!name.trim() || !dirty) return;
    setBusy(true);
    try { await updateGroupIdentity(group.id, { name, sport, color, crest: crest.trim() || null }); await onChange(); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!confirm(`¿Eliminar el club "${group.name}"? Esta acción no se puede deshacer.`)) return;
    await deleteGroup(group.id);
    await onChange();
    router.refresh();
  };

  return (
    <div className="space-y-5">
      <InviteCard group={group} />

      <div className="rounded-3xl border border-border bg-surface p-5">
        <p className="text-[13px] font-semibold text-text-secondary">Identidad del club</p>

        {/* Crest preview */}
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl text-[26px] font-bold text-white shadow-[var(--shadow-sm)]" style={{ background: color }}>
            {group.crestUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={group.crestUrl} alt="" className="h-full w-full object-cover" />
              : (crest.trim() || name.trim().charAt(0).toUpperCase() || "F")}
          </span>
          <div className="min-w-0 flex-1">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del club" />
          </div>
        </div>

        {/* Upload a real crest image */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-[12.5px] font-semibold text-text-secondary hover:border-border-strong">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Subir escudo
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setCropFile(f); e.target.value = ""; }} />
          </label>
          {group.crestUrl && (
            <button onClick={async () => { await updateGroupIdentity(group.id, { crestUrl: null }); await onChange(); }}
              className="text-[12.5px] font-medium text-text-muted hover:text-danger">Quitar imagen</button>
          )}
          <span className="text-[11.5px] text-text-muted">o usa un emoji / iniciales:</span>
        </div>
        <Input value={crest} onChange={(e) => setCrest(e.target.value.slice(0, 3))} placeholder="🦁 o CF" className="mt-2" />

        <p className="mt-4 text-[11.5px] font-semibold text-text-muted">Color</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {CLUB_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)} aria-label={c}
              className={cn("h-8 w-8 rounded-full transition-transform hover:scale-110", color === c && "ring-2 ring-offset-2 ring-offset-surface")}
              style={{ background: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }} />
          ))}
        </div>

        <p className="mt-4 text-[11.5px] font-semibold text-text-muted">Deporte</p>
        <select value={sport} onChange={(e) => setSport(e.target.value)} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-[13.5px] text-text outline-none focus:border-accent">
          {SPORTS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>

        <Button size="sm" onClick={save} disabled={busy || !name.trim() || !dirty} className="mt-4">
          {busy ? <Loader2 size={15} className="animate-spin" /> : "Guardar cambios"}
        </Button>
      </div>

      {cropFile && (
        <CrestCropper file={cropFile} busy={uploading} onCancel={() => setCropFile(null)}
          onSave={async (f) => { setUploading(true); try { await uploadCrest(group.id, f); await onChange(); setCropFile(null); } catch (err) { alert((err as Error).message); } finally { setUploading(false); } }} />
      )}

      <div className="rounded-3xl border border-danger/30 bg-surface p-5">
        <p className="text-[13px] font-semibold text-danger">Zona de peligro</p>
        <p className="mt-1 text-[12.5px] text-text-muted">Eliminar el club borra sus tareas, jugadores y registros.</p>
        <button onClick={remove} className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-danger/40 px-3.5 py-2 text-[13px] font-semibold text-danger hover:bg-danger/10">
          <Trash2 size={15} /> Eliminar club
        </button>
      </div>
    </div>
  );
}

/* ---------------- agenda (sessions & attendance) ---------------- */

const KINDS: { key: SessionKind; label: string }[] = [
  { key: "training", label: "Entreno" },
  { key: "match", label: "Partido" },
  { key: "other", label: "Otro" },
];

function AgendaTab({ group, members }: { group: TeamGroup; members: TeamMember[] }) {
  const [sessions, setSessions] = useState<TeamSession[]>([]);
  const [att, setAtt] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const from = new Date(Date.now() - 12 * 3600 * 1000).toISOString(); // include today
    const s = await listSessions(group.id, from);
    const a = await sessionAttendance(s.map((x) => x.id));
    setSessions(s); setAtt(a); setLoading(false);
  }, [group.id]);
  useEffect(() => { void load(); }, [load]);

  const countFor = (sid: string, status: string) => att.filter((a) => a.sessionId === sid && a.status === status).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-text-secondary">Próximas sesiones</p>
        {!open && <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-[13px] font-semibold text-accent"><Plus size={15} /> Nueva sesión</button>}
      </div>

      {open && <SessionForm groupId={group.id} onDone={async () => { setOpen(false); await load(); }} onCancel={() => setOpen(false)} />}

      {loading ? (
        <div className="h-32 animate-pulse rounded-3xl bg-surface-2" />
      ) : sessions.length === 0 ? (
        <Empty icon={CalendarDays} title="Sin sesiones" sub="Crea un entreno o un partido y el equipo confirma asistencia." />
      ) : (
        <div className="space-y-2.5">
          {sessions.map((s) => {
            const going = countFor(s.id, "going"), maybe = countFor(s.id, "maybe"), out = countFor(s.id, "out");
            const d = new Date(s.startsAt);
            return (
              <div key={s.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("rounded-full px-2 py-0.5 text-[10.5px] font-bold uppercase", s.kind === "match" ? "bg-accent-soft text-accent" : "bg-surface-2 text-text-secondary")}>{KINDS.find((k) => k.key === s.kind)?.label}</span>
                      <p className="truncate text-[14.5px] font-semibold text-text">{s.title}</p>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[12px] text-text-muted">
                      <span className="inline-flex items-center gap-1"><Clock size={11} /> {d.toLocaleDateString("es", { weekday: "short", day: "numeric", month: "short" })} · {d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</span>
                      {s.location && <span className="inline-flex items-center gap-1"><MapPin size={11} /> {s.location}</span>}
                    </p>
                    {s.notes && <p className="mt-1 text-[12.5px] text-text-secondary">{s.notes}</p>}
                  </div>
                  <button onClick={async () => { if (confirm("¿Eliminar esta sesión?")) { await deleteSession(s.id); await load(); } }}
                    aria-label="Eliminar" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-text-muted hover:bg-surface-2 hover:text-danger"><Trash2 size={15} /></button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[12px] font-semibold">
                  <span className="rounded-full bg-accent-soft px-2.5 py-1 text-accent">Van {going}</span>
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-text-secondary">Quizá {maybe}</span>
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-text-muted">No {out}</span>
                  <span className="rounded-full bg-surface-2 px-2.5 py-1 text-text-muted">Sin responder {Math.max(0, members.length - going - maybe - out)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SessionForm({ groupId, onDone, onCancel }: { groupId: string; onDone: () => void; onCancel: () => void }) {
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<SessionKind>("training");
  const [when, setWhen] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!title.trim() || !when) return;
    setBusy(true);
    try { await createSession(groupId, { title, kind, startsAt: new Date(when).toISOString(), location, notes }); onDone(); }
    finally { setBusy(false); }
  };

  return (
    <div className="rounded-2xl border border-accent/40 bg-accent-soft/40 p-4">
      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título — ej. Entreno martes / Partido vs Rival" autoFocus />
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value as SessionKind)} className="rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] text-text outline-none focus:border-accent">
          {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
        </select>
        <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="rounded-xl border border-border bg-surface px-3 py-2.5 text-[13px] text-text outline-none focus:border-accent" />
      </div>
      <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Lugar (opcional)" className="mt-2.5" />
      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas (opcional)" rows={2} className="mt-2.5 w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[13.5px] text-text outline-none placeholder:text-text-muted focus:border-accent" />
      <div className="mt-3 flex gap-2">
        <button onClick={onCancel} className="h-10 flex-1 rounded-xl border border-border text-[13.5px] font-medium text-text-secondary">Cancelar</button>
        <button onClick={save} disabled={busy || !title.trim() || !when} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl accent-gradient text-[13.5px] font-semibold text-accent-ink disabled:opacity-50">{busy ? <Loader2 size={15} className="animate-spin" /> : "Crear sesión"}</button>
      </div>
    </div>
  );
}

/* ---------------- crest cropper ---------------- */

function CrestCropper({ file, busy, onCancel, onSave }: { file: File; busy: boolean; onCancel: () => void; onSave: (f: File) => void }) {
  const V = 260, OUT = 256;
  const [url] = useState(() => URL.createObjectURL(file));
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  const base = nat ? V / Math.min(nat.w, nat.h) : 1;
  const eff = base * scale;

  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, y: e.clientY }; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x, dy = e.clientY - drag.current.y;
    drag.current = { x: e.clientX, y: e.clientY };
    setOffset((o) => ({ x: o.x + dx, y: o.y + dy }));
  };
  const onUp = () => { drag.current = null; };

  const save = () => {
    if (!nat || !imgRef.current) return;
    const c = document.createElement("canvas"); c.width = OUT; c.height = OUT;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const srcSize = V / eff;
    const srcX = nat.w / 2 - offset.x / eff - srcSize / 2;
    const srcY = nat.h / 2 - offset.y / eff - srcSize / 2;
    ctx.drawImage(imgRef.current, srcX, srcY, srcSize, srcSize, 0, 0, OUT, OUT);
    c.toBlob((b) => { if (b) onSave(new File([b], "crest.png", { type: "image/png" })); }, "image/png", 0.92);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm" onClick={onCancel}>
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-lg)]" onClick={(e) => e.stopPropagation()}>
        <p className="text-[15px] font-semibold text-text">Ajusta el escudo</p>
        <p className="mt-1 text-[12.5px] text-text-muted">Arrastra para mover y usa el control para el zoom. El círculo marca cómo se verá.</p>

        <div className="mx-auto mt-4 touch-none select-none overflow-hidden rounded-2xl border border-border bg-surface-2" style={{ width: V, height: V, position: "relative" }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imgRef} src={url} alt="" draggable={false} onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
            style={{ position: "absolute", width: nat ? nat.w * eff : "100%", height: nat ? nat.h * eff : "100%", left: nat ? V / 2 - (nat.w * eff) / 2 + offset.x : 0, top: nat ? V / 2 - (nat.h * eff) / 2 + offset.y : 0, maxWidth: "none" }} />
          {/* Guides */}
          <div aria-hidden className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/70" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.28)" }} />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-[12px] text-text-muted">Zoom</span>
          <input type="range" min={1} max={3} step={0.01} value={scale} onChange={(e) => setScale(Number(e.target.value))} className="flex-1 accent-[var(--accent)]" />
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={onCancel} className="h-10 flex-1 rounded-xl border border-border text-[13.5px] font-medium text-text-secondary">Cancelar</button>
          <button onClick={save} disabled={busy || !nat} className="inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl accent-gradient text-[13.5px] font-semibold text-accent-ink disabled:opacity-50">
            {busy ? <Loader2 size={15} className="animate-spin" /> : "Guardar escudo"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- shared bits ---------------- */

function Empty({ icon: Icon, title, sub }: { icon: typeof Users; title: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Icon size={26} /></span>
      <div>
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-[13px] text-text-muted">{sub}</p>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const colors = ["#45c68e", "#67b0e0", "#a58ce0", "#e0b45c", "#e58a97", "#4fc3b8"];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: colors[h % colors.length] }}>{name[0]?.toUpperCase() ?? "?"}</span>;
}
