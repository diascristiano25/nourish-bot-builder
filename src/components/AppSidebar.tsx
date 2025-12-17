import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  DollarSign, 
  Settings,
  ChevronLeft,
  LogOut,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import logoImg from '@/assets/logo.png';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

interface NavItemWithTour extends NavItem {
  tourId?: string;
}

const navItems: NavItemWithTour[] = [
  { label: 'Home', icon: Home, href: '/dashboard', tourId: 'nav-home' },
  { label: 'Pacientes', icon: Users, href: '/patients', tourId: 'nav-pacientes' },
  { label: 'Agenda', icon: Calendar, href: '/agenda', tourId: 'nav-agenda' },
  { label: 'Biblioteca', icon: BookOpen, href: '/biblioteca', tourId: 'nav-biblioteca' },
  { label: 'Financeiro', icon: DollarSign, href: '/financeiro', tourId: 'nav-financeiro' },
  { label: 'Configurações', icon: Settings, href: '/profile', tourId: 'nav-config' },
];

interface AppSidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function AppSidebar({ isMobile = false, onNavigate }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    if (onNavigate) {
      onNavigate();
    }
  };

  // On mobile, always show expanded sidebar
  const isCollapsed = isMobile ? false : collapsed;

  return (
    <aside 
      className={cn(
        "h-screen bg-card border-r border-border/50 transition-all duration-300 flex flex-col",
        isMobile ? "w-full" : "fixed left-0 top-0 z-40",
        isMobile ? "" : (isCollapsed ? "w-16" : "w-56")
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-border/50 px-4",
        isCollapsed ? "justify-center" : "gap-3"
      )}>
        <img src={logoImg} alt="NutriFlow" className="w-9 h-9 object-contain flex-shrink-0" />
        {!isCollapsed && (
          <span className="font-semibold text-foreground text-lg">NutriFlow</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/dashboard' && location.pathname === '/');
          
          return (
            <Button
              key={item.href}
              variant="ghost"
              onClick={() => handleNavigation(item.href)}
              data-tour={item.tourId}
              className={cn(
                "w-full justify-start gap-3 h-11 rounded-lg transition-colors",
                isCollapsed && "justify-center px-0",
                isActive 
                  ? "bg-primary/10 text-primary hover:bg-primary/15" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-primary")} />
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/50 space-y-1">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 h-11 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </Button>
      </div>

      {/* Collapse Toggle - Only show on desktop */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border/50 shadow-sm hover:bg-muted"
        >
          <ChevronLeft className={cn(
            "w-3 h-3 transition-transform",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      )}
    </aside>
  );
}
