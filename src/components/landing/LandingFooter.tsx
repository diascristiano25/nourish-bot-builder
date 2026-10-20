import { Link } from 'react-router-dom';
import logoImg from '@/assets/logo-nutriflow.png';
import { Sparkles } from 'lucide-react';

export default function LandingFooter() {
  return (
    <footer className="relative border-t border-nf-border bg-nf-bg overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nf-teal/30 to-transparent" />

      {/* Subtle background glow */}
      <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-nf-teal/3 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={logoImg} alt="NutriFlow" className="h-10 w-auto group-hover:scale-110 transition-transform" />
              <span className="font-serif text-2xl font-bold text-nf-text">NutriFlow</span>
            </Link>
            <p className="text-nf-text-muted leading-relaxed max-w-md">
              A nova geração de software para nutricionistas. IA generativa e gestão clínica unificada em uma plataforma que transforma sua prática.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-nf-teal/10 text-nf-teal text-xs font-semibold border border-nf-teal/20">
              <span className="w-2 h-2 rounded-full bg-nf-teal animate-pulse" />
              Lançamento 2026
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-nf-text text-sm uppercase tracking-wider">Produto</h4>
            <nav className="space-y-3">
              <a href="#recursos" className="block text-nf-text-muted hover:text-nf-teal transition-colors text-sm">Recursos</a>
              <a href="#como-funciona" className="block text-nf-text-muted hover:text-nf-teal transition-colors text-sm">Como Funciona</a>
              <a href="#planos" className="block text-nf-text-muted hover:text-nf-teal transition-colors text-sm">Planos</a>
              <Link to="/auth" className="block text-nf-text-muted hover:text-nf-teal transition-colors text-sm">Entrar</Link>
            </nav>
          </div>

          {/* Legal links */}
          <div className="space-y-4">
            <h4 className="font-serif font-bold text-nf-text text-sm uppercase tracking-wider">Legal</h4>
            <nav className="space-y-3">
              <Link to="/terms" className="block text-nf-text-muted hover:text-nf-teal transition-colors text-sm">Termos de Uso</Link>
              <Link to="/privacy" className="block text-nf-text-muted hover:text-nf-teal transition-colors text-sm">Privacidade</Link>
              <Link to="/lgpd" className="block text-nf-text-muted hover:text-nf-teal transition-colors text-sm">LGPD</Link>
              <a href="mailto:contato@nutriflow.com.br" className="block text-nf-text-muted hover:text-nf-teal transition-colors text-sm">Contato</a>
            </nav>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-nf-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-nf-text-muted text-sm">
            © 2026 NutriFlow. Inovação em nutrição. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-xs text-nf-text-muted">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span>Todos os sistemas operacionais</span>
          </div>
        </div>
      </div>
    </footer>
  );
}