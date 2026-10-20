import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import logoImg from '@/assets/logo.png';

export default function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-nf-bg/90 border-b border-nf-border/50 scroll-fade-up">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
          <span className="font-serif text-2xl font-bold text-nf-text">NutriFlow</span>
        </Link>

        <nav className="hidden md:flex gap-8">
          <a href="#recursos" className="text-nf-text-muted hover:text-nf-text transition-colors text-sm font-medium">Recursos</a>
          <a href="#como-funciona" className="text-nf-text-muted hover:text-nf-text transition-colors text-sm font-medium">Como Funciona</a>
          <a href="#planos" className="text-nf-text-muted hover:text-nf-text transition-colors text-sm font-medium">Planos</a>
        </nav>

        <div className="hidden md:block">
          <Link to="/auth">
            <Button variant="outline" className="border-nf-teal text-nf-teal hover:bg-nf-teal/10">
              Entrar
            </Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 text-nf-text"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-nf-border/50 bg-nf-bg px-6 py-4 space-y-4">
          <a href="#recursos" className="block text-nf-text-muted hover:text-nf-text" onClick={() => setMobileOpen(false)}>Recursos</a>
          <a href="#como-funciona" className="block text-nf-text-muted hover:text-nf-text" onClick={() => setMobileOpen(false)}>Como Funciona</a>
          <a href="#planos" className="block text-nf-text-muted hover:text-nf-text" onClick={() => setMobileOpen(false)}>Planos</a>
          <Link to="/auth" onClick={() => setMobileOpen(false)}>
            <Button variant="outline" className="w-full border-nf-teal text-nf-teal hover:bg-nf-teal/10">Entrar</Button>
          </Link>
        </div>
      )}
    </header>
  );
}