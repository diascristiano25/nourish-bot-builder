import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
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

      {/* Mobile Header with Hamburger Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border/50 flex items-center px-4">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <AppSidebar isMobile onNavigate={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>
        <span className="ml-3 font-semibold text-foreground">NutriFlow</span>
      </div>

      {/* Main Content */}
      <main className="md:ml-56 transition-all duration-300 pt-14 md:pt-0 min-w-0">
        <div className="w-full max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
