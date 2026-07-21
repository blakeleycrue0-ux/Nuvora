import { Target, ScanLine, Sparkles, LineChart } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconTile } from "@/components/ui/IconTile";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

const steps = [
  {
    icon: Target,
    title: "Set your goals",
    description: "Tell Nuvora what you're working toward — lose fat, build muscle, or just move more.",
  },
  {
    icon: ScanLine,
    title: "Log in seconds",
    description: "Search food, scan a barcode, or tap a saved workout. No tedious data entry.",
  },
  {
    icon: Sparkles,
    title: "Let AI adjust",
    description: "Your coach recalibrates calories, macros and workouts as your week unfolds.",
  },
  {
    icon: LineChart,
    title: "Watch it compound",
    description: "Clear weekly trends show the progress that daily numbers hide.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="How it Works"
          title="From setup to results in four steps"
          description="No onboarding maze. No twelve screens before your first log. Just a clean path forward."
        />

        <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <div className="pointer-events-none absolute top-[26px] left-0 right-0 hidden h-px bg-border lg:block" />
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.08} className="relative flex flex-col gap-4">
              <div className="relative z-10 flex items-center gap-3">
                <IconTile icon={step.icon} color="#3B82F6" />
                <span className="text-[13px] font-medium tabular-nums text-text-muted">
                  0{i + 1}
                </span>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-text">{step.title}</h3>
                <p className="mt-1.5 max-w-[240px] text-[13.5px] leading-relaxed text-text-secondary">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
