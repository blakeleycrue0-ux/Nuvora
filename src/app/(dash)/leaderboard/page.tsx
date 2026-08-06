"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Trophy, Crown, Loader2, ChevronDown } from "lucide-react";
import { fenomBus } from "@/lib/fenom/bus";
import { getMyRank, getLeaderboardPage, getAroundMe, type LeaderRow, type MyRank } from "@/lib/fenom/leaderboard";
import { cn } from "@/lib/utils";

const PAGE = 20;

export default function LeaderboardPage() {
  const [me, setMe] = useState<MyRank | null>(null);
  const [top, setTop] = useState<LeaderRow[]>([]);
  const [list, setList] = useState<LeaderRow[]>([]);
  const [around, setAround] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const load = useCallback(async () => {
    const [m, t, l, a] = await Promise.all([
      getMyRank(),
      getLeaderboardPage(3, 0),
      getLeaderboardPage(PAGE, 3),
      getAroundMe(3),
    ]);
    setMe(m); setTop(t); setList(l); setAround(a);
    setHasMore(l.length === PAGE);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Intelligent refresh: when the user earns XP, re-pull the ranking shortly after
  // (the DB trigger has updated their XP by then).
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return fenomBus.subscribe((e) => {
      if (e.type !== "HABIT_COMPLETED" && e.type !== "DAY_COMPLETED") return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => { void load(); }, 1400);
    });
  }, [load]);

  const loadMore = async () => {
    setMore(true);
    const next = await getLeaderboardPage(PAGE, 3 + list.length);
    setList((prev) => [...prev, ...next]);
    setHasMore(next.length === PAGE);
    setMore(false);
  };

  // Only show the "nearby" block if the user isn't already visible above.
  const shownMaxRank = 3 + list.length;
  const showNearby = !!me && me.rank > shownMaxRank;

  if (loading) {
    return (
      <div className="container-page max-w-2xl py-7 lg:py-10">
        <div className="h-28 animate-pulse rounded-3xl bg-surface-2" />
        <div className="mt-5 h-40 animate-pulse rounded-3xl bg-surface-2" />
        <div className="mt-5 space-y-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-14 animate-pulse rounded-2xl bg-surface-2" />)}</div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-2xl py-7 lg:py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Trophy size={19} /></span>
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text sm:text-[28px]">Ranking global</h1>
          {me && <p className="text-[13px] text-text-secondary">{me.total.toLocaleString()} atletas en Fenom</p>}
        </div>
      </div>

      {/* Your position */}
      {me && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="mt-5 overflow-hidden rounded-3xl accent-gradient p-5 text-accent-ink shadow-[var(--shadow-md)]">
          <p className="text-[12.5px] font-medium opacity-80">Tu posición</p>
          <div className="mt-1 flex items-end justify-between">
            <div>
              <p className="text-[40px] font-bold leading-none">#{me.rank.toLocaleString()}</p>
              <p className="mt-1.5 text-[13px] font-medium opacity-90">{me.displayName}</p>
            </div>
            <div className="text-right">
              <p className="text-[15px] font-bold">Nivel {me.level}</p>
              <p className="text-[13px] font-medium opacity-90">{me.xp.toLocaleString()} XP</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Top 3 podium */}
      {top.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Top jugadores</p>
          <div className="flex items-end justify-center gap-3">
            {podiumOrder(top).map((r) => r && <Podium key={r.rank} row={r} />)}
          </div>
        </div>
      )}

      {/* Global ranking */}
      <div className="mt-6">
        <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Clasificación global</p>
        <div className="space-y-2">
          {list.map((r) => <Row key={r.rank} row={r} />)}
        </div>
        {hasMore && (
          <button onClick={loadMore} disabled={more}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3 text-[13.5px] font-semibold text-text-secondary transition-colors hover:text-text disabled:opacity-50">
            {more ? <Loader2 size={16} className="animate-spin" /> : <><ChevronDown size={16} /> Ver más</>}
          </button>
        )}
      </div>

      {/* Nearby (only if you're further down) */}
      {showNearby && (
        <div className="mt-7">
          <p className="mb-2.5 text-[12px] font-semibold uppercase tracking-wide text-text-muted">Cerca de ti</p>
          <div className="space-y-2">
            {around.map((r) => <Row key={`near-${r.rank}`} row={r} />)}
          </div>
        </div>
      )}
    </div>
  );
}

// Order the top 3 as 2 · 1 · 3 for a podium look.
function podiumOrder(top: LeaderRow[]): (LeaderRow | null)[] {
  const byRank = new Map(top.map((r) => [r.rank, r]));
  return [byRank.get(2) ?? null, byRank.get(1) ?? null, byRank.get(3) ?? null];
}

function Podium({ row }: { row: LeaderRow }) {
  const isFirst = row.rank === 1;
  const ring = row.rank === 1 ? "border-amber-400/70" : row.rank === 2 ? "border-slate-300" : "border-orange-400/60";
  const badge = row.rank === 1 ? "bg-amber-400 text-black" : row.rank === 2 ? "bg-slate-300 text-black" : "bg-orange-400 text-black";
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: row.rank * 0.05 }}
      className={cn("flex flex-1 flex-col items-center rounded-3xl border bg-surface p-4 text-center shadow-[var(--shadow-sm)]", ring, isFirst ? "pb-6 pt-6" : "mt-4")}>
      {isFirst && <Crown size={18} className="mb-1 text-amber-400" />}
      <Avatar name={row.displayName} size={isFirst ? 52 : 44} highlight={row.isMe} />
      <span className={cn("mt-2 flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold", badge)}>{row.rank}</span>
      <p className="mt-1.5 max-w-full truncate text-[13px] font-semibold text-text">{row.isMe ? "Tú" : row.displayName}</p>
      <p className="text-[11.5px] text-text-muted">Nivel {row.level}</p>
      <p className="text-[12.5px] font-semibold text-accent">{row.xp.toLocaleString()} XP</p>
    </motion.div>
  );
}

function Row({ row }: { row: LeaderRow }) {
  return (
    <div className={cn("flex items-center gap-3 rounded-2xl border p-3 transition-colors",
      row.isMe ? "border-accent bg-accent-soft" : "border-border bg-surface")}>
      <span className={cn("w-9 shrink-0 text-center text-[13.5px] font-bold", row.isMe ? "text-accent" : "text-text-muted")}>{row.rank}</span>
      <Avatar name={row.displayName} size={36} highlight={row.isMe} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-text">{row.isMe ? "Tú" : row.displayName}</p>
        <p className="text-[12px] text-text-muted">Nivel {row.level}</p>
      </div>
      <span className="shrink-0 text-[13.5px] font-bold text-text">{row.xp.toLocaleString()} <span className="text-[11px] font-medium text-text-muted">XP</span></span>
    </div>
  );
}

function Avatar({ name, size = 36, highlight }: { name: string; size?: number; highlight?: boolean }) {
  const colors = ["#45c68e", "#67b0e0", "#a58ce0", "#e0b45c", "#e58a97", "#4fc3b8"];
  let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return (
    <span className={cn("flex shrink-0 items-center justify-center rounded-full font-bold text-white", highlight && "ring-2 ring-accent ring-offset-2 ring-offset-surface")}
      style={{ width: size, height: size, fontSize: size * 0.4, background: colors[h % colors.length] }}>
      {name[0]?.toUpperCase() ?? "?"}
    </span>
  );
}
