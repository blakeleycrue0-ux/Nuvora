"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, User, Users, Plus, Check } from "lucide-react";
import { myMemberGroups, type TeamGroup } from "@/lib/teams";
import { cn } from "@/lib/utils";

// Instant switcher between the Personal workspace and any football clubs the
// user has joined. Lives in the app top bar. Navigation only — it doesn't
// change global state, so it's safe and works with the existing routes.
export function WorkspaceSwitcher() {
  const router = useRouter();
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [open, setOpen] = useState(false);
  const [activeGid, setActiveGid] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { void myMemberGroups().then(setGroups); }, []);

  // Derive the current workspace from the URL (Personal = /dashboard etc.).
  useEffect(() => {
    const onTeam = window.location.pathname.startsWith("/team");
    const g = new URLSearchParams(window.location.search).get("g");
    setActiveGid(onTeam ? g : null); // eslint-disable-line react-hooks/set-state-in-effect
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const active = groups.find((g) => g.id === activeGid) ?? null;
  const go = (href: string) => { setOpen(false); router.push(href); };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)}
        className="flex max-w-[190px] items-center gap-2 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-[13px] font-semibold text-text transition-colors hover:border-border-strong">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
          {active ? <Users size={13} /> : <User size={13} />}
        </span>
        <span className="truncate">{active ? active.name : "Personal"}</span>
        <ChevronDown size={15} className={cn("shrink-0 text-text-muted transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute left-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-surface p-1.5 shadow-[var(--shadow-lg)]">
            <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-muted">Espacios</p>
            <SwitchItem icon={<User size={15} />} label="Personal" active={!active} onClick={() => go("/dashboard")} />
            {groups.map((g) => (
              <SwitchItem key={g.id} icon={<Users size={15} />} label={g.name} active={active?.id === g.id} onClick={() => go(`/team?g=${g.id}`)} />
            ))}
            <div className="my-1.5 h-px bg-border" />
            <SwitchItem icon={<Plus size={15} />} label="Unirme a un club" muted onClick={() => go("/join")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SwitchItem({ icon, label, active, muted, onClick }: { icon: React.ReactNode; label: string; active?: boolean; muted?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn("flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13.5px] font-medium transition-colors",
        active ? "bg-accent-soft text-accent" : muted ? "text-text-secondary hover:bg-surface-2 hover:text-text" : "text-text hover:bg-surface-2")}>
      <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", active ? "text-accent" : "text-text-muted")}>{icon}</span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {active && <Check size={15} className="shrink-0 text-accent" />}
    </button>
  );
}
