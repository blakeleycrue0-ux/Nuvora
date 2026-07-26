"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Check, X, ShieldCheck, Sparkles } from "lucide-react";
import type { Verification } from "@/lib/momentum/types";
import { listVerifications, signedPhotoUrl } from "@/lib/verify";
import { prettyDate } from "@/lib/momentum/date";
import { cn } from "@/lib/utils";

export default function VerificationsPage() {
  const [items, setItems] = useState<Verification[] | null>(null);
  const [urls, setUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      const list = await listVerifications(60);
      if (!active) return;
      setItems(list);
      // Resolve signed photo URLs lazily.
      const entries = await Promise.all(
        list.filter((v) => v.imagePath).map(async (v) => [v.id, (await signedPhotoUrl(v.imagePath)) ?? ""] as const),
      );
      if (!active) return;
      setUrls(Object.fromEntries(entries.filter(([, u]) => u)));
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="container-page max-w-2xl py-7 lg:py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <ShieldCheck size={19} />
        </span>
        <div>
          <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-text sm:text-[28px]">Verifications</h1>
          <p className="text-[13px] text-text-secondary">Your AI photo checks.</p>
        </div>
      </div>

      {items === null ? (
        <div className="mt-7 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-2" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-soft text-accent"><ShieldCheck size={26} /></span>
          <div>
            <p className="text-[15px] font-semibold text-text">No verifications yet</p>
            <p className="mt-1 text-[13px] text-text-muted">Turn on photo verification for a habit to see checks here.</p>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(i * 0.03, 0.3) }}
              className="flex gap-3.5 rounded-2xl border border-border bg-surface p-3.5 shadow-[var(--shadow-sm)]"
            >
              {urls[v.id] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={urls[v.id]} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-text-muted">
                  <ShieldCheck size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[14px] font-semibold text-text">{v.habitName}</p>
                  <span
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      v.approved ? "bg-accent-soft text-accent" : "bg-danger-soft text-danger",
                    )}
                  >
                    {v.approved ? <Check size={12} /> : <X size={12} />}
                    {v.approved ? "Approved" : "Rejected"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-text-secondary">{v.explanation}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[11.5px] text-text-muted">
                  <span>{prettyDate(v.date)}</span>
                  {v.approved && v.xpEarned > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-accent">
                      <Sparkles size={11} /> +{v.xpEarned} XP
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
