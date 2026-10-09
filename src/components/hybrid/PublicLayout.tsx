import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoImg from '@/assets/logo.png';

export interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-[#C4764A]/20">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
              <span className="text-lg font-semibold text-[#518C5B]">NutriFlow</span>
            </Link>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-[#C4764A] hover:text-[#518C5B]">
                  Login
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-[#518C5B] hover:bg-[#518C5B]/90 text-white">
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
      <footer className="border-t border-[#C4764A]/20 py-12 bg-white">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src={logoImg} alt="NutriFlow" className="h-8 w-auto" />
              <span className="text-lg font-semibold text-[#518C5B]">NutriFlow</span>
            </div>

            <div className="flex gap-8 text-sm text-[#C4764A]">
              <Link to="/suporte/privacidade" className="hover:text-[#518C5B] transition">
                Privacidade
              </Link>
              <Link to="/suporte/termos" className="hover:text-[#518C5B] transition">
                Termos
              </Link>
              <Link to="/suporte" className="hover:text-[#518C5B] transition">
                Suporte
              </Link>
            </div>

            <p className="text-sm text-[#C4764A]/70">
              © 2026 NutriFlow. CNPJ 00.000.000/0001-00
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
