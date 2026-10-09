import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-800/50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">NutriFlow</span>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-300 hover:text-slate-50">
                  Login
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-teal-600 hover:bg-teal-500 text-white">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-12">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold">NutriFlow</span>
            </div>

            <div className="flex gap-8 text-sm text-slate-400">
              <Link to="/privacy" className="hover:text-slate-300 transition">
                Privacidade
              </Link>
              <Link to="/terms" className="hover:text-slate-300 transition">
                Termos
              </Link>
              <Link to="/support" className="hover:text-slate-300 transition">
                Suporte
              </Link>
            </div>

            <p className="text-sm text-slate-500">
              © 2026 NutriFlow. CNPJ 00.000.000/0001-00
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
