import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import ValuePropsSection from '@/components/landing/ValuePropsSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeatureShowcaseSection from '@/components/landing/FeatureShowcaseSection';
import VideoShowcaseSection from '@/components/landing/VideoShowcaseSection';
import PricingSection from '@/components/landing/PricingSection';
import FinalCTASection from '@/components/landing/FinalCTASection';
import LandingFooter from '@/components/landing/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-nf-bg text-nf-text">
      <LandingHeader />
      <main>
        <HeroSection />
        <ValuePropsSection />
        <HowItWorksSection />
        <FeatureShowcaseSection />
        <VideoShowcaseSection />
        <PricingSection />
        <FinalCTASection />
      </main>
      <LandingFooter />
    </div>
  );
}