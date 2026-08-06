// ============================================================
// Global leaderboard data layer. All ranking is computed in Postgres (see
// migration 0009) — the client only calls RPCs and renders the result. No
// user list is ever downloaded wholesale; pages are fetched on demand.
// ============================================================

import { supabase } from "@/lib/supabase";

export interface LeaderRow {
  rank: number;
  displayName: string;
  level: number;
  xp: number;
  isMe: boolean;
}

export interface MyRank {
  rank: number;
  displayName: string;
  level: number;
  xp: number;
  total: number;
}

type Row = { rank: number; display_name: string; level: number; xp: number; is_me: boolean };
const toRow = (r: Row): LeaderRow => ({ rank: Number(r.rank), displayName: r.display_name, level: r.level, xp: r.xp, isMe: r.is_me });

// Make sure the signed-in user has a public profile (and up-to-date XP).
export async function ensureProfile(): Promise<void> {
  await supabase.rpc("fenom_ensure_profile");
}

export async function getMyRank(): Promise<MyRank | null> {
  const { data, error } = await supabase.rpc("leaderboard_me");
  if (error || !data || !data.length) return null;
  const r = data[0] as { rank: number; display_name: string; level: number; xp: number; total: number };
  return { rank: Number(r.rank), displayName: r.display_name, level: r.level, xp: r.xp, total: Number(r.total) };
}

export async function getLeaderboardPage(limit: number, offset: number): Promise<LeaderRow[]> {
  const { data, error } = await supabase.rpc("leaderboard_page", { p_limit: limit, p_offset: offset });
  if (error || !data) return [];
  return (data as Row[]).map(toRow);
}

export async function getAroundMe(range = 3): Promise<LeaderRow[]> {
  const { data, error } = await supabase.rpc("leaderboard_around", { p_range: range });
  if (error || !data) return [];
  return (data as Row[]).map(toRow);
}
