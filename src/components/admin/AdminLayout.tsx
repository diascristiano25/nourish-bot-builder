import { ReactNode, useState, memo } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { CommandBar } from '../CommandBar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import logoImg from '@/assets/logo.png';

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = memo(function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <CommandBar open={commandBarOpen} onOpenChange={setCommandBarOpen} />

      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card/95 backdrop-blur-xl border-b border-border flex items-center px-4 safe-area-inset">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-muted-foreground" aria-label="Abrir menu">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-0 shadow-soft-xl bg-card">
            <AdminSidebar
              isMobile
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="ml-3 flex items-center gap-2">
          <img src={logoImg} alt="NutriFlow" className="w-7 h-7 object-contain" />
          <span className="font-serif font-semibold text-foreground text-base tracking-tight">
            Nutri<span className="text-primary">Flow</span>
          </span>
          <span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded font-medium">Admin</span>
        </div>
      </div>

      <main className="md:ml-56 transition-all duration-300 pt-14 md:pt-0 min-w-0">
        <div className="w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
});