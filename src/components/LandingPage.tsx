"use client"

import Header from "./header"
import HeroSection from "./hero-section"
import FeaturesSection from "./features-section"
import BentoSection from "./bento-section"
import StatsSection from "./stats-section"
import CtaSection from "./cta-section"
import Footer from "./footer"

interface LandingPageProps {
  onNavigateToAuth?: () => void;
}

export default function Home({ onNavigateToAuth }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header onNavigateToAuth={onNavigateToAuth} />
      <main>
        <HeroSection onNavigateToAuth={onNavigateToAuth} />
        <FeaturesSection />
        <BentoSection /> 
        <StatsSection />
        <CtaSection onNavigateToAuth={onNavigateToAuth} />
      </main>
      <Footer />
    </div>
  )
}
