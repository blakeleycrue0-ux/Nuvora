"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Do I need other fitness apps alongside Nuvora?",
    answer:
      "No. Nuvora is built to fully replace separate apps for workouts, nutrition, calorie tracking, progress photos and habits — it's all in one place, designed to work together.",
  },
  {
    question: "How does the AI Coach work?",
    answer:
      "The AI Coach looks at your logged workouts, meals and trends to suggest adjustments — like recalibrating calories after a hard training week or generating a workout for today in seconds.",
  },
  {
    question: "Can I track my own custom workouts?",
    answer:
      "Yes. Build routines from our exercise library with your own sets, reps and weights, or let the AI generate a full plan based on your goals and equipment.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes — Nuvora Free covers the core tracking experience. Nuvora Pro unlocks the full AI coach, advanced analytics and unlimited history.",
  },
  {
    question: "Which devices does Nuvora support?",
    answer:
      "Nuvora works beautifully on iOS, Android and the web, with wearable integrations on the roadmap.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 sm:py-32">
      <Container className="max-w-3xl">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />

        <div className="mt-12 flex flex-col divide-y divide-border rounded-2xl border border-border bg-card">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.question} className="px-5 sm:px-6">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-[14.5px] font-medium text-text">{faq.question}</span>
                  <Plus
                    size={18}
                    className={cn(
                      "shrink-0 text-text-muted transition-transform duration-300",
                      isOpen && "rotate-45 text-primary",
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-[13.5px] leading-relaxed text-text-secondary">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
