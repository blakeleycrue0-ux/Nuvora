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
export interface TeamHabit {
  id: string;
  groupId: string;
  name: string;
  icon: string;
  color: string;
  difficulty: string;
  verify: boolean;
  sort: number;
}
export interface TeamMember {
  id: string;
  groupId: string;
  userId: string;
  displayName: string;
  joinedAt: string;
}
export interface TeamCompletion {
  habitId: string;
  userId: string;
  date: string;
  count: number;
}

export interface NewHabit {
  name: string;
  icon: string;
  color: string;
  difficulty?: string;
  verify?: boolean;
}

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

type HabitRow = { id: string; group_id: string; name: string; icon: string; color: string; difficulty: string; verify: boolean; sort: number };
const toHabit = (r: HabitRow): TeamHabit => ({ id: r.id, groupId: r.group_id, name: r.name, icon: r.icon, color: r.color, difficulty: r.difficulty, verify: r.verify, sort: r.sort });

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
      group_id: group!.id, name: h.name, icon: h.icon, color: h.color,
      difficulty: h.difficulty ?? "medium", verify: h.verify ?? false, sort: i,
    }));
    const { error } = await supabase.from("group_habits").insert(rows);
    if (error) throw new Error(error.message);
  }
  return toGroup(group);
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
    group_id: groupId, name: h.name, icon: h.icon, color: h.color,
    difficulty: h.difficulty ?? "medium", verify: h.verify ?? false, sort,
  });
  if (error) throw new Error(error.message);
}

export async function deleteGroupHabit(habitId: string): Promise<void> {
  await supabase.from("group_habits").delete().eq("id", habitId);
}

export async function groupMembers(groupId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase.from("group_members").select("*").eq("group_id", groupId).order("joined_at");
  if (error || !data) return [];
  return (data as { id: string; group_id: string; user_id: string; display_name: string; joined_at: string }[])
    .map((r) => ({ id: r.id, groupId: r.group_id, userId: r.user_id, displayName: r.display_name, joinedAt: r.joined_at }));
}

export async function removeMember(memberId: string): Promise<void> {
  await supabase.from("group_members").delete().eq("id", memberId);
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
