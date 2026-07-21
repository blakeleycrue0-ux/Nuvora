import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CTA() {
  return (
    <section className="py-24 sm:py-28">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card px-8 py-16 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.14] blur-[100px]"
            style={{ background: "radial-gradient(circle, #3B82F6, transparent 70%)" }}
          />
          <h2 className="relative text-balance text-[28px] font-semibold leading-tight tracking-tight text-text sm:text-[36px]">
            Ready to simplify your health?
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-balance text-[15px] text-text-secondary">
            Join thousands who replaced their fitness app folder with one experience.
          </p>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/login" size="lg" className="group">
              Get Started Free
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
