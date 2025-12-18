import { ReactNode, useState, memo } from 'react';
import { AppSidebar } from './AppSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';


interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

// Memoized layout component for optimal performance
export const AppLayout = memo(function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Mobile Header with Hamburger Menu - Touch optimized */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-white/95 backdrop-blur-lg border-b border-slate-200/60 flex items-center px-4 safe-area-inset">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-xl active:scale-95 transition-transform touch-manipulation"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="p-0 w-72 border-r-0 shadow-2xl"
          >
            <AppSidebar isMobile onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="ml-3 flex items-center">
          <span className="font-bold text-slate-800 text-base tracking-tight">NutriFlow</span>
        </div>
      </div>

      {/* Main Content - optimized for touch */}
      <main className="md:ml-52 transition-all duration-300 pt-14 md:pt-0 min-w-0">
        <div className="w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
});
