import { Button } from '@/components/ui/button';
import { List, X } from '@phosphor-icons/react';
import { useState } from 'react';
import logoImg from '@/assets/logo.png';

export function StickyNav(): JSX.Element {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Recursos', href: '#features' },
    { label: 'Preços', href: '#pricing' },
    { label: 'Casos', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' }
  ];

  const handleScrollTo = (href: string) => {
    const id = href.replace('#', '');
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Section #${id} not found for smooth scroll`);
      return;
    }
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <img src={logoImg} alt="NutriFlow" className="h-10 w-auto" />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleScrollTo(link.href)}
                  className="text-slate-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                className="text-slate-700"
                onClick={() => window.location.href = '/auth'}
              >
                Login
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => window.location.href = '/auth'}
              >
                Testar Grátis
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-700 hover:text-emerald-600 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <List size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white md:hidden">
          <div className="flex flex-col items-center justify-center h-full space-y-8 px-4">
            <nav className="flex flex-col items-center space-y-6">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleScrollTo(link.href)}
                  className="text-2xl text-slate-700 hover:text-emerald-600 font-medium transition-colors"
                >
                  {link.label}
                </button>
              ))}
            </nav>
            <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
              <Button
                variant="outline"
                className="w-full text-slate-700 border-slate-300"
                onClick={() => window.location.href = '/auth'}
              >
                Login
              </Button>
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => window.location.href = '/auth'}
              >
                Testar Grátis
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
