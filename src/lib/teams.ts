// Teams / coach data layer (Supabase). Coaches own groups; members join with
// an invite code and log the group's habits. The coach reads completions
// (done / not-done) and streaks — never the verification photos.

import { supabase } from "@/lib/supabase";
import { todayISO } from "@/lib/momentum/date";

export interface TeamGroup {
  id: string;
  name: string;
  inviteCode: string;
  ownerId: string;
  createdAt: string;
}
// A group habit is internally a "task". `type` describes how it's completed and
// `xp` is what it awards on the leaderboard. Kept as strings so new task types /
// roles can be added later without a schema or type migration.
export type TaskType =
  | "daily" | "weekly" | "onetime" | "photo" | "ai_photo"
  | "manual" | "timer" | "match" | "video" | "custom";

export interface TeamHabit {
  id: string;
  groupId: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  difficulty: string;
  verify: boolean;
  type: TaskType;
  xp: number;
  dueDate?: string;
  sort: number;
}
export type MemberRole = "owner" | "admin" | "coach" | "assistant" | "player";
export interface TeamMember {
  id: string;
  groupId: string;
  userId: string;
  displayName: string;
  role: MemberRole;
  joinedAt: string;
}
export interface TeamCompletion {
  habitId: string;
  userId: string;
  date: string;
  count: number;
}
export interface Announcement {
  id: string;
  groupId: string;
  authorId: string;
  title: string;
  body: string;
  createdAt: string;
}

export interface NewHabit {
  name: string;
  description?: string;
  icon: string;
  color: string;
  difficulty?: string;
  verify?: boolean;
  type?: TaskType;
  xp?: number;
  dueDate?: string;
}

// Task-type catalog for the coach UI. `verify` marks types that require photo /
// AI verification (so we default the verify flag when the type is chosen).
export const TASK_TYPES: { key: TaskType; label: string; verify?: boolean }[] = [
  { key: "daily", label: "Hábito diario" },
  { key: "weekly", label: "Hábito semanal" },
  { key: "onetime", label: "Tarea única" },
  { key: "ai_photo", label: "Foto con verificación IA", verify: true },
  { key: "photo", label: "Foto (revisión manual)", verify: true },
  { key: "manual", label: "Aprobación manual" },
  { key: "timer", label: "Cronómetro" },
  { key: "match", label: "Ver partido" },
  { key: "video", label: "Vídeo" },
  { key: "custom", label: "Personalizado" },
];

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars

function newCode(len = 6): string {
  let s = "";
  const arr = new Uint32Array(len);
  (globalThis.crypto ?? crypto).getRandomValues(arr);
  for (let i = 0; i < len; i++) s += CODE_ALPHABET[arr[i] % CODE_ALPHABET.length];
  return s;
}

/* ---------------- rows → types ---------------- */

type GroupRow = { id: string; name: string; invite_code: string; owner_id: string; created_at: string };
const toGroup = (r: GroupRow): TeamGroup => ({ id: r.id, name: r.name, inviteCode: r.invite_code, ownerId: r.owner_id, createdAt: r.created_at });

type HabitRow = { id: string; group_id: string; name: string; description: string | null; icon: string; color: string; difficulty: string; verify: boolean; type: string | null; xp: number | null; due_date: string | null; sort: number };
const toHabit = (r: HabitRow): TeamHabit => ({ id: r.id, groupId: r.group_id, name: r.name, description: r.description ?? undefined, icon: r.icon, color: r.color, difficulty: r.difficulty, verify: r.verify, type: (r.type as TaskType) ?? "daily", xp: r.xp ?? 10, dueDate: r.due_date ?? undefined, sort: r.sort });

type MemberRow = { id: string; group_id: string; user_id: string; display_name: string; role: string | null; joined_at: string };
const toMember = (r: MemberRow): TeamMember => ({ id: r.id, groupId: r.group_id, userId: r.user_id, displayName: r.display_name, role: (r.role as MemberRole) ?? "player", joinedAt: r.joined_at });

type AnnouncementRow = { id: string; group_id: string; author_id: string; title: string; body: string; created_at: string };
const toAnnouncement = (r: AnnouncementRow): Announcement => ({ id: r.id, groupId: r.group_id, authorId: r.author_id, title: r.title, body: r.body, createdAt: r.created_at });

/* ---------------- coach ---------------- */

export async function createGroup(name: string, habits: NewHabit[]): Promise<TeamGroup> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("No has iniciado sesión.");

  // Insert the group, retrying on the (unlikely) invite-code collision.
  let group: GroupRow | null = null;
  for (let attempt = 0; attempt < 5 && !group; attempt++) {
    const code = newCode();
    const { data, error } = await supabase
      .from("groups")
      .insert({ owner_id: uid, name: name.trim() || "Mi equipo", invite_code: code })
      .select()
      .single();
    if (!error && data) { group = data as GroupRow; break; }
    if (error && !`${error.message}`.toLowerCase().includes("duplicate")) throw new Error(error.message);
  }
  if (!group) throw new Error("No se pudo crear el grupo. Inténtalo de nuevo.");

  if (habits.length) {
    const rows = habits.map((h, i) => ({
      group_id: group!.id, name: h.name, description: h.description ?? null, icon: h.icon, color: h.color,
      difficulty: h.difficulty ?? "medium", verify: h.verify ?? false,
      type: h.type ?? "daily", xp: h.xp ?? 10, due_date: h.dueDate ?? null, sort: i,
    }));
    const { error } = await supabase.from("group_habits").insert(rows);
    if (error) throw new Error(error.message);
  }
  return toGroup(group);
}

export async function renameGroup(groupId: string, name: string): Promise<void> {
  const { error } = await supabase.from("groups").update({ name: name.trim() }).eq("id", groupId);
  if (error) throw new Error(error.message);
}

export async function deleteGroup(groupId: string): Promise<void> {
  const { error } = await supabase.from("groups").delete().eq("id", groupId);
  if (error) throw new Error(error.message);
}

export async function myOwnedGroups(): Promise<TeamGroup[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase.from("groups").select("*").eq("owner_id", uid).order("created_at");
  if (error) return [];
  return (data as GroupRow[]).map(toGroup);
}

export async function myMemberGroups(): Promise<TeamGroup[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("group_members")
    .select("groups(*)")
    .eq("user_id", uid);
  if (error || !data) return [];
  return (data as unknown as { groups: GroupRow | null }[])
    .map((r) => r.groups)
    .filter((g): g is GroupRow => !!g)
    .map(toGroup);
}

export async function groupHabits(groupId: string): Promise<TeamHabit[]> {
  const { data, error } = await supabase.from("group_habits").select("*").eq("group_id", groupId).order("sort");
  if (error || !data) return [];
  return (data as HabitRow[]).map(toHabit);
}

export async function addGroupHabit(groupId: string, h: NewHabit, sort: number): Promise<void> {
  const { error } = await supabase.from("group_habits").insert({
    group_id: groupId, name: h.name, description: h.description ?? null, icon: h.icon, color: h.color,
    difficulty: h.difficulty ?? "medium", verify: h.verify ?? false,
    type: h.type ?? "daily", xp: h.xp ?? 10, due_date: h.dueDate ?? null, sort,
  });
  if (error) throw new Error(error.message);
}

export async function deleteGroupHabit(habitId: string): Promise<void> {
  await supabase.from("group_habits").delete().eq("id", habitId);
}

export async function groupMembers(groupId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase.from("group_members").select("*").eq("group_id", groupId).order("joined_at");
  if (error || !data) return [];
  return (data as MemberRow[]).map(toMember);
}

export async function removeMember(memberId: string): Promise<void> {
  await supabase.from("group_members").delete().eq("id", memberId);
}

export async function setMemberRole(memberId: string, role: MemberRole): Promise<void> {
  const { error } = await supabase.from("group_members").update({ role }).eq("id", memberId);
  if (error) throw new Error(error.message);
}

/* ---------------- announcements ---------------- */

export async function groupAnnouncements(groupId: string): Promise<Announcement[]> {
  const { data, error } = await supabase
    .from("group_announcements")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as AnnouncementRow[]).map(toAnnouncement);
}

export async function postAnnouncement(groupId: string, title: string, body: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("No has iniciado sesión.");
  const { error } = await supabase.from("group_announcements").insert({
    group_id: groupId, author_id: uid, title: title.trim(), body: body.trim(),
  });
  if (error) throw new Error(error.message);
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await supabase.from("group_announcements").delete().eq("id", id);
}

// Completions for a group across a date range (inclusive of `since`).
export async function groupCompletions(groupId: string, since: string): Promise<TeamCompletion[]> {
  const { data, error } = await supabase
    .from("group_completions")
    .select("habit_id,user_id,date,count")
    .eq("group_id", groupId)
    .gte("date", since);
  if (error || !data) return [];
  return (data as { habit_id: string; user_id: string; date: string; count: number }[])
    .map((r) => ({ habitId: r.habit_id, userId: r.user_id, date: r.date, count: r.count }));
}

/* ---------------- player ---------------- */

export async function groupByCode(code: string): Promise<{ id: string; name: string; memberCount: number } | null> {
  const { data, error } = await supabase.rpc("group_by_code", { p_code: code });
  if (error || !data || !data.length) return null;
  const r = data[0] as { id: string; name: string; member_count: number };
  return { id: r.id, name: r.name, memberCount: Number(r.member_count) };
}

export async function joinGroup(code: string, displayName: string): Promise<string> {
  const { data, error } = await supabase.rpc("join_group", { p_code: code, p_name: displayName });
  if (error) throw new Error(error.message.includes("invalid_code") ? "Código no válido." : error.message);
  return data as string;
}

export async function setGroupCompletion(groupId: string, habitId: string, done: boolean, date = todayISO()): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) throw new Error("No has iniciado sesión.");
  if (done) {
    await supabase.from("group_completions").upsert(
      { group_id: groupId, habit_id: habitId, user_id: uid, date, count: 1 },
      { onConflict: "habit_id,user_id,date" },
    );
  } else {
    await supabase.from("group_completions").delete().eq("habit_id", habitId).eq("user_id", uid).eq("date", date);
  }
}

// My own completions for a group across a range (for the player view / streaks).
export async function myGroupCompletions(groupId: string, since: string): Promise<TeamCompletion[]> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("group_completions")
    .select("habit_id,user_id,date,count")
    .eq("group_id", groupId)
    .eq("user_id", uid)
    .gte("date", since);
  if (error || !data) return [];
  return (data as { habit_id: string; user_id: string; date: string; count: number }[])
    .map((r) => ({ habitId: r.habit_id, userId: r.user_id, date: r.date, count: r.count }));
}

/* ---------------- leaderboard ---------------- */

export type LeaderPeriod = "today" | "week" | "month" | "season" | "all";

export interface LeaderRow {
  member: TeamMember;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  completed: number;      // tasks completed in the period
  completionRate: number; // 0–100 across the period
}

// Level curve: every 100 XP is a level (level 1 at 0 XP).
export const levelForXp = (xp: number) => Math.floor(xp / 100) + 1;

// Longest consecutive-day streak within a set of completion dates.
export function longestStreakFor(dates: Set<string>): number {
  if (dates.size === 0) return 0;
  const sorted = [...dates].sort();
  let best = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1] + "T00:00:00");
    const cur = new Date(sorted[i] + "T00:00:00");
    const gap = Math.round((cur.getTime() - prev.getTime()) / 86400000);
    run = gap === 1 ? run + 1 : 1;
    if (run > best) best = run;
  }
  return best;
}

// Build a ranked leaderboard from members + completions for the chosen period.
// XP is summed from each completed task's `xp` reward. Completion rate is
// completions ÷ (tasks × active days) over the period window.
export function buildLeaderboard(
  members: TeamMember[],
  habits: TeamHabit[],
  completions: TeamCompletion[],
  period: LeaderPeriod,
  periodDays: number,
): LeaderRow[] {
  const xpOf = new Map(habits.map((h) => [h.id, h.xp]));
  const since = period === "all" || period === "season" ? null : lastNDaysStart(periodDays);
  const inWindow = (d: string) => !since || d >= since;

  const rows = members.map((member) => {
    const mine = completions.filter((c) => c.userId === member.userId && inWindow(c.date));
    const dates = new Set(mine.map((c) => c.date));
    const xp = mine.reduce((sum, c) => sum + (xpOf.get(c.habitId) ?? 10), 0);
    const denom = habits.length * (period === "today" ? 1 : Math.max(1, dates.size || 1));
    return {
      member,
      xp,
      level: levelForXp(xp),
      streak: streakFor(new Set(completions.filter((c) => c.userId === member.userId).map((c) => c.date))),
      longestStreak: longestStreakFor(new Set(completions.filter((c) => c.userId === member.userId).map((c) => c.date))),
      completed: mine.length,
      completionRate: denom ? Math.min(100, Math.round((mine.length / denom) * 100)) : 0,
    };
  });
  return rows.sort((a, b) => b.xp - a.xp || b.streak - a.streak);
}

function lastNDaysStart(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  return d.toISOString().slice(0, 10);
}

/* ---------------- helpers ---------------- */

// Consecutive-day streak (days with at least one completion) ending today.
export function streakFor(dates: Set<string>): number {
  let streak = 0;
  const d = new Date();
  for (;;) {
    const iso = d.toISOString().slice(0, 10);
    if (dates.has(iso)) { streak++; d.setDate(d.getDate() - 1); }
    else if (streak === 0 && iso === todayISO()) { d.setDate(d.getDate() - 1); } // today not done yet — keep yesterday's streak
    else break;
  }
  return streak;
}
