"use client";

import { Check, Sparkles } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const perks = [
  "Barcode scanner for instant food logging",
  "AI meal photo recognition",
  "Unlimited AI Coach conversations",
  "Advanced analytics & unlimited history",
];

export function UpgradeModal({
  open,
  onClose,
  feature,
}: {
  open: boolean;
  onClose: () => void;
  feature?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Upgrade to Pro">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary-soft p-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/20">
            <Sparkles size={18} className="text-primary" />
          </span>
          <p className="text-[13px] text-text">
            {feature ? <span className="font-medium">{feature}</span> : "This feature"} is part of Nuvora Pro.
          </p>
        </div>

        <ul className="flex flex-col gap-2.5">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2.5 text-[13px] text-text-secondary">
              <Check size={15} className="mt-0.5 shrink-0 text-primary" />
              {perk}
            </li>
          ))}
        </ul>

        <Button href="/#pricing" className="w-full">
          Upgrade to Pro — $12/month
        </Button>
        <Button variant="ghost" onClick={onClose} className="w-full">
          Not now
        </Button>
      </div>
    </Modal>
  );
}
