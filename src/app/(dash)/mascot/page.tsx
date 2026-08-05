"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Coins, Check, Lock, Sparkles, Pencil, ShoppingBag, Shirt, Wallet, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Mascot } from "@/components/mascot/Mascot";
import { useMascot } from "@/components/mascot/MascotProvider";
import { levelFromXP } from "@/lib/fenom/economy";
import { RARITY_META } from "@/lib/fenom/config";
import { ITEM_SLOTS, type ItemCategory, type ItemSlot, type MascotItemView } from "@/lib/fenom/types";
import { useHabits } from "@/lib/momentum/store";
import { cn } from "@/lib/utils";

type Tab = "companion" | "shop" | "wallet";

const SLOT_LABEL: Record<ItemSlot, string> = { clothing: "Ropa", shoes: "Calzado", accessory: "Accesorio", headwear: "Cabeza" };
const CATEGORIES: { key: ItemCategory; label: string }[] = [
  { key: "outfits", label: "Ropa" },
  { key: "headwear", label: "Cabeza" },
  { key: "accessories", label: "Accesorios" },
  { key: "shoes", label: "Calzado" },
  { key: "special", label: "Especial" },
  { key: "seasonal", label: "Temporada" },
];

export default function MascotPage() {
  const { ready, name, level, balance, itemViews, catalog, reaction, mascot } = useMascot();
  const { xp } = useHabits();
  const [tab, setTab] = useState<Tab>("companion");

  const lv = levelFromXP(xp);
  const layers = useMemo(() => {
    const byId = new Map(catalog.map((c) => [c.id, c.assetKey]));
    return ITEM_SLOTS.map((s) => mascot?.equipped?.[s]).filter(Boolean).map((id) => byId.get(id as string)).filter(Boolean) as string[];
  }, [catalog, mascot]);

  if (!ready) {
    return <div className="container-page max-w-2xl py-7 lg:py-10"><div className="h-72 animate-pulse rounded-3xl bg-surface-2" /></div>;
  }

  return (
    <div className="container-page max-w-2xl py-7 lg:py-10">
      {/* Hero: mascot preview + stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-sm)]">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Mascot state={reaction.state} animation={reaction.animation} layers={layers} name={name} size={150} />
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="text-[12.5px] font-medium text-text-muted">Tu compañero</p>
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text">{name}</h1>
            <p className="mt-0.5 h-5 text-[13px] text-accent">{reaction.message}</p>
            <div className="mt-3 flex items-center justify-center gap-2 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[13px] font-semibold text-text"><Sparkles size={13} className="text-accent" /> Nivel {level}</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1 text-[13px] font-semibold text-text"><Coins size={13} className="text-amber-500" /> {balance}</span>
            </div>
            <div className="mt-3">
              <div className="flex items-center justify-between text-[11.5px] text-text-muted"><span>XP</span><span>{lv.into} / {lv.need}</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full rounded-full accent-gradient" style={{ width: `${lv.pct}%` }} /></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mt-5 flex gap-1 rounded-2xl border border-border bg-surface p-1">
        {([["companion", "Compañero", Shirt], ["shop", "Tienda", ShoppingBag], ["wallet", "Monedero", Wallet]] as const).map(([key, label, Icon]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-[13px] font-medium transition-colors",
              tab === key ? "bg-accent-soft text-accent" : "text-text-secondary hover:text-text")}>
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      <div className="mt-5">
        {tab === "companion" ? <CompanionTab /> : tab === "shop" ? <ShopTab /> : <WalletTab />}
      </div>
    </div>
  );
}

/* ---------------- companion ---------------- */

function CompanionTab() {
  const { name, rename, itemViews, equip } = useMascot();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [saving, setSaving] = useState(false);

  const ownedBySlot = (slot: ItemSlot) => itemViews.filter((i) => i.slot === slot && i.isOwned);

  const save = async () => { setSaving(true); try { await rename(draft); setEditing(false); } finally { setSaving(false); } };

  return (
    <div className="space-y-5">
      {/* Name */}
      <div className="rounded-3xl border border-border bg-surface p-5">
        <p className="text-[13px] font-semibold text-text-secondary">Nombre de tu compañero</p>
        {editing ? (
          <div className="mt-2 flex gap-2">
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={16} autoFocus />
            <button onClick={save} disabled={saving} className="inline-flex h-10 items-center gap-1.5 rounded-xl accent-gradient px-4 text-[13.5px] font-semibold text-accent-ink disabled:opacity-50">
              {saving ? <Loader2 size={15} className="animate-spin" /> : "Guardar"}
            </button>
          </div>
        ) : (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[16px] font-semibold text-text">{name}</span>
            <button onClick={() => { setDraft(name); setEditing(true); }} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-accent"><Pencil size={14} /> Cambiar</button>
          </div>
        )}
      </div>

      {/* Equip by slot */}
      {ITEM_SLOTS.map((slot) => {
        const items = ownedBySlot(slot);
        return (
          <div key={slot} className="rounded-3xl border border-border bg-surface p-5">
            <p className="text-[13px] font-semibold text-text-secondary">{SLOT_LABEL[slot]}</p>
            {items.length === 0 ? (
              <p className="mt-2 text-[12.5px] text-text-muted">Aún no tienes nada para este hueco. Visita la tienda.</p>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                <SlotChip label="Ninguno" active={items.every((i) => !i.isEquipped)} onClick={() => equip(slot, null)} />
                {items.map((it) => (
                  <SlotChip key={it.id} label={it.name} active={it.isEquipped} onClick={() => equip(slot, it.isEquipped ? null : it.id)} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SlotChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
        active ? "border-accent bg-accent-soft text-accent" : "border-border text-text-secondary hover:text-text")}>
      {active && <Check size={13} />} {label}
    </button>
  );
}

/* ---------------- shop ---------------- */

function ShopTab() {
  const { itemViews } = useMascot();
  const [cat, setCat] = useState<ItemCategory>("outfits");
  const items = itemViews.filter((i) => i.category === cat).sort((a, b) => a.sort - b.sort);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button key={c.key} onClick={() => setCat(c.key)}
            className={cn("rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-colors", cat === c.key ? "border-accent bg-accent-soft text-accent" : "border-border text-text-secondary hover:text-text")}>
            {c.label}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-[13px] text-text-muted">Nada por aquí todavía.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((it) => <ShopCard key={it.id} item={it} />)}
        </div>
      )}
    </div>
  );
}

function ShopCard({ item }: { item: MascotItemView }) {
  const { purchase, claimFree, equip } = useMascot();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const rarity = RARITY_META[item.rarity];

  const act = async (fn: () => Promise<void>) => { setErr(""); setBusy(true); try { await fn(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };

  return (
    <div className={cn("flex flex-col rounded-2xl border bg-surface p-3", rarity.ring)}>
      {/* Preview tile (neutral until artwork exists) */}
      <div className="relative flex aspect-square items-center justify-center rounded-xl bg-surface-2">
        <span className="text-[11px] font-medium text-text-muted">{item.name}</span>
        {!item.isUnlocked && !item.isOwned && (
          <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-bg/80 px-1.5 py-0.5 text-[10px] font-semibold text-text-muted"><Lock size={10} /> Nivel {item.requiredLevel}</span>
        )}
      </div>
      <p className="mt-2 truncate text-[13px] font-semibold text-text">{item.name}</p>
      <p className={cn("text-[11px] font-medium", rarity.text)}>{rarity.label}</p>

      <div className="mt-2">
        {item.isOwned ? (
          <button onClick={() => equip(item.slot, item.isEquipped ? null : item.id)}
            className={cn("w-full rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-colors", item.isEquipped ? "bg-accent-soft text-accent" : "accent-gradient text-accent-ink")}>
            {item.isEquipped ? "Equipado" : "Equipar"}
          </button>
        ) : !item.isUnlocked ? (
          <button disabled className="w-full rounded-xl border border-border px-3 py-2 text-[12.5px] font-semibold text-text-muted">Bloqueado</button>
        ) : item.free ? (
          <button onClick={() => act(() => claimFree(item.id))} disabled={busy} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl accent-gradient px-3 py-2 text-[12.5px] font-semibold text-accent-ink disabled:opacity-50">
            {busy ? <Loader2 size={13} className="animate-spin" /> : "Conseguir gratis"}
          </button>
        ) : (
          <button onClick={() => act(() => purchase(item.id))} disabled={busy} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl accent-gradient px-3 py-2 text-[12.5px] font-semibold text-accent-ink disabled:opacity-50">
            {busy ? <Loader2 size={13} className="animate-spin" /> : <><Coins size={13} /> {item.price}</>}
          </button>
        )}
      </div>
      {err && <p className="mt-1.5 text-[11px] text-danger">{err}</p>}
    </div>
  );
}

/* ---------------- wallet ---------------- */

const SOURCE_LABEL: Record<string, string> = {
  habit_completed: "Hábito completado",
  day_completed: "Día completo",
  streak_milestone: "Hito de racha",
  achievement_unlocked: "Logro desbloqueado",
  level_up: "Subida de nivel",
  welcome_bonus: "Bienvenida",
  shop_purchase: "Compra en la tienda",
};

function WalletTab() {
  const { balance, transactions } = useMascot();
  const earned = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const spent = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + -t.amount, 0);

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-3xl accent-gradient p-6 text-accent-ink">
        <p className="text-[12.5px] font-medium opacity-80">Fenom Coins</p>
        <p className="mt-1 flex items-center gap-2 text-[34px] font-bold"><Coins size={28} /> {balance}</p>
        <div className="mt-3 flex gap-4 text-[12.5px] font-medium opacity-90">
          <span>Ganadas: {earned}</span><span>Gastadas: {spent}</span>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-5">
        <p className="text-[13px] font-semibold text-text-secondary">Movimientos</p>
        {transactions.length === 0 ? (
          <p className="mt-3 text-[13px] text-text-muted">Todavía no hay movimientos. Completa hábitos para ganar Coins.</p>
        ) : (
          <div className="mt-3 divide-y divide-border">
            {transactions.slice(0, 40).map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-[13.5px] font-medium text-text">{SOURCE_LABEL[t.source] ?? t.source}</p>
                  <p className="text-[11.5px] text-text-muted">{new Date(t.createdAt).toLocaleDateString("es", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={cn("shrink-0 text-[14px] font-bold", t.amount >= 0 ? "text-accent" : "text-danger")}>{t.amount >= 0 ? "+" : ""}{t.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
