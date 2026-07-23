"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  User as UserIcon, Palette, Bell, Shield, Download, Upload, Trash2, Keyboard,
  Sun, Moon, Check, LogOut, RotateCcw, Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { useHabits } from "@/lib/momentum/store";
import { levelFromXP } from "@/lib/momentum/stats";
import type { MomentumData } from "@/lib/momentum/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { Modal } from "@/components/ui/Modal";
import {
  notifSupported, notifPermission, requestNotif, remindersEnabled, setReminders, showNotif,
} from "@/lib/notifications";
import { cn } from "@/lib/utils";

const SHORTCUTS = [
  { keys: ["G", "D"], label: "Go to Dashboard" },
  { keys: ["G", "H"], label: "Go to Habits" },
  { keys: ["G", "P"], label: "Go to Progress" },
  { keys: ["N"], label: "New habit" },
  { keys: ["T"], label: "Toggle theme" },
  { keys: ["?"], label: "Show shortcuts" },
];

export default function SettingsPage() {
  const { user, signOut, updateUser } = useAuth();
  const { theme, toggle } = useTheme();
  const { exportData, importData, resetAll, habits, xp } = useHabits();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [savedName, setSavedName] = useState(false);
  const [notif, setNotif] = useState({ streaks: true, weekly: false, achievements: true });
  const [remindersOn, setRemindersOn] = useState(false);
  const [notifState, setNotifState] = useState<string>("default");
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    // Read notification state after mount (not available during SSR).
    /* eslint-disable react-hooks/set-state-in-effect */
    setRemindersOn(remindersEnabled() && notifPermission() === "granted");
    setNotifState(String(notifPermission()));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const toggleReminders = async (on: boolean) => {
    if (!on) {
      setReminders(false);
      setRemindersOn(false);
      return;
    }
    if (!notifSupported()) {
      setNotifState("unsupported");
      return;
    }
    const perm = await requestNotif();
    setNotifState(perm);
    if (perm === "granted") {
      setReminders(true);
      setRemindersOn(true);
      void showNotif("Momentum", { body: "Reminders are on. We'll nudge you at each habit's time.", icon: "/icon-192.png" });
    } else {
      setReminders(false);
      setRemindersOn(false);
    }
  };
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [importError, setImportError] = useState("");

  const level = useMemo(() => levelFromXP(xp), [xp]);

  const saveName = () => {
    if (name.trim() && name.trim() !== user?.name) {
      updateUser({ name: name.trim() });
      setSavedName(true);
      setTimeout(() => setSavedName(false), 1800);
    }
  };

  const doExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `momentum-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string) as MomentumData;
        if (!Array.isArray(parsed.habits)) throw new Error("Invalid file");
        importData(parsed);
        setImportError("");
      } catch {
        setImportError("That file couldn't be read as a Momentum backup.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const doDeleteAccount = () => {
    resetAll();
    signOut();
    router.replace("/");
  };

  return (
    <div className="container-page max-w-3xl py-7 lg:py-10">
      <div>
        <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-text sm:text-[30px]">Settings</h1>
        <p className="mt-1 text-[14px] text-text-secondary">Manage your profile, preferences, and data.</p>
      </div>

      {/* Profile */}
      <Section icon={UserIcon} title="Profile" desc="Your account information.">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-[24px] font-semibold text-white" style={{ background: user?.avatarColor ?? "var(--accent)" }}>
            {(user?.name ?? "M").charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold text-text">{user?.name}</p>
            <p className="truncate text-[13px] text-text-muted">{user?.email}</p>
            <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold text-accent">
              <Sparkles size={12} /> Level {level.level} · {level.title}
            </div>
          </div>
        </div>
        <Row label="Display name">
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} className="sm:w-56" placeholder="Your name" />
            <Button variant="secondary" size="sm" onClick={saveName} disabled={!name.trim() || name.trim() === user?.name}>
              {savedName ? <><Check size={15} /> Saved</> : "Save"}
            </Button>
          </div>
        </Row>
      </Section>

      {/* Appearance */}
      <Section icon={Palette} title="Appearance" desc="Customize how Momentum looks.">
        <Row label="Theme" hint="Switch between light and dark mode.">
          <div className="inline-flex rounded-xl border border-border bg-surface-2 p-1">
            <button onClick={() => theme === "dark" && toggle()} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors", theme === "light" ? "bg-surface text-text shadow-[var(--shadow-sm)]" : "text-text-muted hover:text-text")}>
              <Sun size={15} /> Light
            </button>
            <button onClick={() => theme === "light" && toggle()} className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors", theme === "dark" ? "bg-surface text-text shadow-[var(--shadow-sm)]" : "text-text-muted hover:text-text")}>
              <Moon size={15} /> Dark
            </button>
          </div>
        </Row>
      </Section>

      {/* Notifications */}
      <Section icon={Bell} title="Notifications" desc="Choose what Momentum reminds you about.">
        <ToggleRow
          label="Habit reminders"
          hint={
            notifState === "denied"
              ? "Notifications are blocked — enable them for this site in your browser settings."
              : notifState === "unsupported"
                ? "This browser doesn't support notifications."
                : "Get nudged at each habit's reminder time while the app is open."
          }
          checked={remindersOn}
          onChange={toggleReminders}
        />
        {remindersOn && (
          <div className="-mt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => showNotif("Momentum", { body: "This is a test reminder.", icon: "/icon-192.png" })}>
              <Bell size={14} /> Send a test
            </Button>
          </div>
        )}
        <ToggleRow label="Streak alerts" hint="Warn me before I break a streak." checked={notif.streaks} onChange={(v) => setNotif((n) => ({ ...n, streaks: v }))} />
        <ToggleRow label="Achievement unlocks" hint="Celebrate when I earn a new badge." checked={notif.achievements} onChange={(v) => setNotif((n) => ({ ...n, achievements: v }))} />
        <ToggleRow label="Weekly summary" hint="A recap of my week every Sunday." checked={notif.weekly} onChange={(v) => setNotif((n) => ({ ...n, weekly: v }))} />
      </Section>

      {/* Privacy & data */}
      <Section icon={Shield} title="Privacy & data" desc="Your data lives privately in this browser.">
        <ToggleRow label="Anonymous analytics" hint="Help improve Momentum with usage stats." checked={analytics} onChange={setAnalytics} />
        <Row label="Backup" hint="Export or import all your habits and history.">
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={doExport}><Download size={15} /> Export</Button>
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()}><Upload size={15} /> Import</Button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={doImport} />
          </div>
        </Row>
        {importError && <p className="text-[12.5px] text-danger">{importError}</p>}
        <Row label="Reset data" hint="Delete all your habits and history and start fresh.">
          <Button variant="secondary" size="sm" onClick={() => setConfirmReset(true)}><RotateCcw size={15} /> Reset</Button>
        </Row>
      </Section>

      {/* Keyboard shortcuts */}
      <Section icon={Keyboard} title="Keyboard shortcuts" desc="Move faster around Momentum.">
        <div className="grid gap-2 sm:grid-cols-2">
          {SHORTCUTS.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3.5 py-2.5">
              <span className="text-[13px] text-text-secondary">{s.label}</span>
              <span className="flex gap-1">
                {s.keys.map((k) => (
                  <kbd key={k} className="inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-border bg-surface px-1.5 text-[11px] font-semibold text-text shadow-[var(--shadow-sm)]">{k}</kbd>
                ))}
              </span>
            </div>
          ))}
        </div>
      </Section>

      {/* Danger zone */}
      <div className="mt-6 rounded-3xl border border-danger/30 bg-danger-soft/40 p-5 sm:p-6">
        <h3 className="text-[15px] font-semibold text-danger">Danger zone</h3>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[14px] font-medium text-text">Sign out</p>
            <p className="text-[12.5px] text-text-muted">End your session on this device.</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => { signOut(); router.replace("/"); }}><LogOut size={15} /> Sign out</Button>
        </div>
        <div className="mt-4 flex flex-col gap-3 border-t border-danger/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[14px] font-medium text-text">Delete account & data</p>
            <p className="text-[12.5px] text-text-muted">Permanently erase everything on this device.</p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete</Button>
        </div>
      </div>

      <p className="mt-8 text-center text-[12px] text-text-muted">
        Momentum · {habits.length} habits tracked · {xp} XP earned
      </p>

      {/* Reset modal */}
      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset all data?" subtitle="This permanently deletes all your habits and history. This can't be undone.">
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmReset(false)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={() => { resetAll(); setConfirmReset(false); }}>Reset everything</Button>
        </div>
      </Modal>

      {/* Delete modal */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your account?" subtitle="Your profile and all habit data on this device will be permanently removed.">
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={() => setConfirmDelete(false)}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={doDeleteAccount}>Delete forever</Button>
        </div>
      </Modal>
    </div>
  );
}

function Section({ icon: Icon, title, desc, children }: { icon: typeof UserIcon; title: string; desc: string; children: React.ReactNode }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="mt-6 rounded-3xl border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent"><Icon size={19} /></span>
        <div>
          <h2 className="text-[16px] font-semibold text-text">{title}</h2>
          <p className="text-[12.5px] text-text-muted">{desc}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </motion.section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border-t border-border pt-4 first:border-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[14px] font-medium text-text">{label}</p>
        {hint && <p className="text-[12.5px] text-text-muted">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function ToggleRow({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border pt-4 first:border-0 first:pt-0">
      <div>
        <p className="text-[14px] font-medium text-text">{label}</p>
        {hint && <p className="text-[12.5px] text-text-muted">{hint}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} label={label} />
    </div>
  );
}
