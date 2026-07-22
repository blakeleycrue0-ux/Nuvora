"use client";

import { Star } from "lucide-react";

interface Review {
  name: string;
  text: string;
  color: string;
  initials: string;
}

const reviews: Review[] = [
  { name: "Maya C.", text: "Deleted four apps the week I started. Everything's in one place now.", color: "#3B82F6", initials: "MC" },
  { name: "Daniel O.", text: "The AI coach adjusting my calories after a heavy week is unreal.", color: "#22C55E", initials: "DO" },
  { name: "Priya N.", text: "Clean, fast, no nagging notifications. The charts alone are worth it.", color: "#A78BFA", initials: "PN" },
  { name: "Leo F.", text: "Down 9kg in three months. The plan just made sense from day one.", color: "#F59E0B", initials: "LF" },
  { name: "Sara M.", text: "Onboarding actually understood my goal. Felt personal instantly.", color: "#EF4444", initials: "SM" },
  { name: "Tom R.", text: "Finally an app that doesn't feel like a spreadsheet. Beautiful.", color: "#199e70", initials: "TR" },
];

function ReviewCard({ r }: { r: Review }) {
  return (
    <div className="flex w-[280px] shrink-0 flex-col gap-2.5 rounded-2xl border border-border bg-card p-4">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={11} className="fill-primary text-primary" />
        ))}
      </div>
      <p className="text-[12.5px] leading-relaxed text-text-secondary">&ldquo;{r.text}&rdquo;</p>
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-white"
          style={{ background: r.color }}
        >
          {r.initials}
        </span>
        <span className="text-[11.5px] font-medium text-text">{r.name}</span>
      </div>
    </div>
  );
}

export function ReviewsMarquee() {
  const loop = [...reviews, ...reviews];
  return (
    <div className="relative w-full overflow-hidden py-2">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-bg to-transparent" />
      <div className="flex w-max gap-3 animate-marquee">
        {loop.map((r, i) => (
          <ReviewCard key={i} r={r} />
        ))}
      </div>
    </div>
  );
}
