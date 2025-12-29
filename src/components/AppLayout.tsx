import { ReactNode, useState, memo } from 'react';
import { AppSidebar } from './AppSidebar';
import { CommandBar } from './CommandBar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { NeonText } from '@/components/ui/NeonText';
import logoImg from '@/assets/logo.png';

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

// Memoized layout component for optimal performance
export const AppLayout = memo(function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Command Bar */}
      <CommandBar open={commandBarOpen} onOpenChange={setCommandBarOpen} />

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar onCommandBarOpen={() => setCommandBarOpen(true)} />
      </div>

      {/* Mobile Header with Hamburger Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 glass-strong border-b border-border/30 flex items-center px-4 safe-area-inset">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl active:scale-95 transition-transform touch-manipulation text-muted-foreground hover:text-foreground"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="p-0 w-72 border-r-0 shadow-2xl bg-background"
          >
            <AppSidebar 
              isMobile 
              onNavigate={() => setMobileMenuOpen(false)} 
              onCommandBarOpen={() => {
                setMobileMenuOpen(false);
                setCommandBarOpen(true);
              }}
            />
          </SheetContent>
        </Sheet>
        <div className="ml-3 flex items-center gap-2">
          <img src={logoImg} alt="NutriFlow" className="w-7 h-7 object-contain" />
          <span className="font-bold text-foreground text-base tracking-tight">
            Nutri<NeonText variant="lime">Flow</NeonText>
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-56 transition-all duration-300 pt-14 md:pt-0 min-w-0">
        <div className="w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
});
