import { StickyNav } from '@/components/landing/StickyNav';
import { HeroWithScreenshot } from '@/components/landing/HeroWithScreenshot';
import { FeatureTabsSection } from '@/components/landing/FeatureTabsSection';
import { DualBenefitsSection } from '@/components/landing/DualBenefitsSection';
import { PricingCards } from '@/components/landing/PricingCards';
import { TestimonialGrid } from '@/components/landing/TestimonialGrid';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { Button } from '@/components/ui/button';

function SocialProofBand() {
  return (
    <section className="py-8 bg-slate-50 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">500+</div>
            <div className="text-sm text-slate-600">Nutricionistas</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">10.000+</div>
            <div className="text-sm text-slate-600">Cardápios Criados</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-900">95%</div>
            <div className="text-sm text-slate-600">Satisfação</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-16 md:py-24 bg-emerald-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Pronto para transformar sua prática?
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          Comece seu teste grátis de 14 dias agora. Sem cartão de crédito.
        </p>
        <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg">
          Começar Teste Grátis
        </Button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Atendimento</a></li>
              <li><a href="#" className="hover:text-white">Prescrição</a></li>
              <li><a href="#" className="hover:text-white">Gestão</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Sobre</a></li>
              <li><a href="#" className="hover:text-white">Blog</a></li>
              <li><a href="#" className="hover:text-white">Contato</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-white">Treinamentos</a></li>
              <li><a href="#" className="hover:text-white">Status</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Privacidade</a></li>
              <li><a href="#" className="hover:text-white">Termos</a></li>
              <li><a href="#" className="hover:text-white">LGPD</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 text-center text-sm">
          © 2026 NutriFlow. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}

export default function LandingPageProfessional() {
  return (
    <div className="min-h-screen bg-white">
      <StickyNav />
      <HeroWithScreenshot />
      <SocialProofBand />
      <FeatureTabsSection />
      <DualBenefitsSection />
      <PricingCards />
      <TestimonialGrid />
      <FAQAccordion />
      <FinalCTA />
      <Footer />
    </div>
  );
}
