import { MarketingHeader } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { Features } from "@/components/marketing/Features";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ScreensPreview } from "@/components/marketing/ScreensPreview";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Pricing } from "@/components/marketing/Pricing";
import { FAQ } from "@/components/marketing/FAQ";
import { CTA } from "@/components/marketing/CTA";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-1 flex-col bg-bg">
      <MarketingHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <ScreensPreview />
        <Testimonials />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
