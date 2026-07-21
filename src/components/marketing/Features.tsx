import { Dumbbell, Apple, Flame, TrendingUp, Scale, Repeat, Sparkles, BarChart3 } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { IconTile } from "@/components/ui/IconTile";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";

const features = [
  {
    icon: Dumbbell,
    color: "#3B82F6",
    title: "Workout Builder",
    description: "Design custom routines with sets, reps and weights — or let Nuvora build one for you.",
  },
  {
    icon: Apple,
    color: "#22C55E",
    title: "Nutrition",
    description: "Log meals in seconds with smart food search and an AI meal planner.",
  },
  {
    icon: Flame,
    color: "#F59E0B",
    title: "Calories",
    description: "Effortless daily tracking with a clear picture of intake versus goals.",
  },
  {
    icon: TrendingUp,
    color: "#A78BFA",
    title: "Progress",
    description: "Photos, measurements and body fat trends, visualized beautifully.",
  },
  {
    icon: Scale,
    color: "#3B82F6",
    title: "Weight Tracking",
    description: "Log your weight and watch trendlines smooth out the daily noise.",
  },
  {
    icon: Repeat,
    color: "#22C55E",
    title: "Habits",
    description: "Build streaks for the small things that compound into big results.",
  },
  {
    icon: Sparkles,
    color: "#3B82F6",
    title: "AI Coach",
    description: "A coach in your pocket — plans, adjustments and answers, instantly.",
  },
  {
    icon: BarChart3,
    color: "#EF4444",
    title: "Analytics",
    description: "Weekly and monthly insights that actually explain your progress.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Features"
          title="Everything you need. Nothing you don't."
          description="Eight tools that replace an entire folder of fitness apps — designed to work together, not against each other."
        />

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={(i % 4) * 0.06}>
              <Card className="group h-full p-6 transition-colors hover:border-white/[0.12]">
                <IconTile icon={feature.icon} color={feature.color} />
                <h3 className="mt-4 text-[15px] font-semibold text-text">{feature.title}</h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-text-secondary">
                  {feature.description}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
