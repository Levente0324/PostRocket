import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Industries } from "@/components/landing/Industries";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";
import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Industries />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
