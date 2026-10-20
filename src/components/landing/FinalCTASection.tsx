import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function FinalCTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-nf-teal/5 via-nf-bg to-nf-coral/5 pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 text-center relative z-10 scroll-fade-up">
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-nf-text mb-6">
          Pronto para transformar sua prática?
        </h2>
        <p className="text-lg md:text-xl text-nf-text-muted mb-10 leading-relaxed">
          Junte-se aos primeiros nutricionistas a usar o NutriFlow.
          Inovação em nutrição, disponível agora.
        </p>
        <Link to="/auth">
          <Button className="bg-nf-coral hover:bg-nf-coral/90 text-white font-semibold px-10 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300">
            Começar Gratuitamente <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}