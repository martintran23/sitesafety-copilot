import type { Metadata } from "next";
import HeroDemo from "@/components/landing/HeroDemo";
import InteractiveDemo from "@/components/landing/InteractiveDemo";
import LandingNav from "@/components/landing/LandingNav";
import {
  Features,
  FinalCta,
  HowItWorks,
  LandingFooter,
  StandardsTeaser,
  TrustStrip,
} from "@/components/landing/LandingSections";

export const metadata: Metadata = {
  title: "SiteSafety Copilot — Point a camera at the site. Get the OSHA citation back.",
  description:
    "Voice-and-vision OSHA 29 CFR 1926 hazard detection. Boxes every violation, cites the exact paragraph, scores site risk, and briefs the crew out loud.",
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0b1020] text-slate-100 selection:bg-amber-400 selection:text-slate-950">
      <LandingNav />
      <main className="flex-1">
        <HeroDemo />
        <TrustStrip />
        <HowItWorks />
        <InteractiveDemo />
        <Features />
        <StandardsTeaser />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
