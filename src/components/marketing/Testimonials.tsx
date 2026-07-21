import { Star } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

const testimonials = [
  {
    quote:
      "I deleted four apps the week I started using Nuvora. Everything just lives in one place now, and I actually check it every day.",
    name: "Maya Chen",
    role: "Marketing Lead",
    initials: "MC",
    color: "#3B82F6",
  },
  {
    quote:
      "The AI coach adjusting my calories after a heavy training week is the feature I didn't know I needed. It feels like it's actually paying attention.",
    name: "Daniel Osei",
    role: "Software Engineer",
    initials: "DO",
    color: "#22C55E",
  },
  {
    quote:
      "Clean, fast, and it doesn't nag me with fifteen notifications a day. The progress charts alone are worth switching for.",
    name: "Priya Nair",
    role: "Physical Therapist",
    initials: "PN",
    color: "#A78BFA",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Testimonials"
          title="Loved by people who take health seriously"
        />

        <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08}>
              <Card className="flex h-full flex-col justify-between gap-6 p-6">
                <div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={13} className="fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="mt-4 text-[14.5px] leading-relaxed text-text-secondary">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-medium text-text">{t.name}</p>
                    <p className="text-[12px] text-text-muted">{t.role}</p>
                  </div>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
