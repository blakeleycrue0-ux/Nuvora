import { Check } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Everything you need to start tracking with intention.",
    features: [
      "Workout & nutrition logging",
      "Calorie & macro tracking",
      "Weight & progress photos",
      "7-day history",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/ month",
    description: "The full experience, with AI doing the heavy lifting.",
    features: [
      "Everything in Free",
      "AI Coach & meal planning",
      "Unlimited history & analytics",
      "Custom workout builder",
      "Priority support",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Team",
    price: "$29",
    period: "/ month",
    description: "For coaches and small studios managing multiple clients.",
    features: [
      "Everything in Pro",
      "Up to 10 client profiles",
      "Shared programs & templates",
      "Progress reporting",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 sm:py-32">
      <Container>
        <SectionHeading
          eyebrow="Pricing"
          title="Simple pricing. No surprises."
          description="Start free. Upgrade when the AI coach earns its keep."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={i * 0.08}>
              <Card
                className={cn(
                  "flex h-full flex-col gap-6 p-7",
                  plan.highlighted && "border-primary/40 bg-gradient-to-b from-primary-soft to-card ring-1 ring-primary/20",
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[16px] font-semibold text-text">{plan.name}</h3>
                    {plan.highlighted && <Badge tone="primary">Most Popular</Badge>}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-[36px] font-semibold tracking-tight text-text">
                      {plan.price}
                    </span>
                    <span className="text-[13px] text-text-muted">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-text-secondary">
                    {plan.description}
                  </p>
                </div>

                <ul className="flex flex-1 flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-[13.5px] text-text-secondary">
                      <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  href="/login"
                  variant={plan.highlighted ? "primary" : "secondary"}
                  size="md"
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Card>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
