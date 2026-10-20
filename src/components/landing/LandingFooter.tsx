import { Link } from 'react-router-dom';
import logoImg from '@/assets/logo.png';

export default function LandingFooter() {
  return (
    <footer className="border-t border-nf-border py-12 bg-nf-bg">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="NutriFlow" className="h-6 w-auto opacity-80" />
          <span className="text-nf-text-muted text-sm">
            © 2026 NutriFlow. Inovação em nutrição.
          </span>
        </div>
        <nav className="flex gap-6">
          <Link to="/terms" className="text-nf-text-muted hover:text-nf-text transition-colors text-sm">
            Termos
          </Link>
          <Link to="/privacy" className="text-nf-text-muted hover:text-nf-text transition-colors text-sm">
            Privacidade
          </Link>
          <a href="mailto:contato@nutriflow.com.br" className="text-nf-text-muted hover:text-nf-text transition-colors text-sm">
            Contato
          </a>
        </nav>
      </div>
    </footer>
  );
}