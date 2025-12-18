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

  const isCollapsed = isMobile ? false : collapsed;

  return (
    <aside 
      className={cn(
        "h-screen bg-white border-r border-slate-200/60 transition-all duration-300 flex flex-col",
        isMobile ? "w-full" : "fixed left-0 top-0 z-40",
        isMobile ? "" : (isCollapsed ? "w-[68px]" : "w-52")
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-slate-200/60 px-4",
        isCollapsed ? "justify-center" : "gap-3"
      )}>
        <div className="w-11 h-11 flex items-center justify-center flex-shrink-0">
          <img src={logoImg} alt="NutriFlow" className="w-10 h-10 object-contain" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-slate-800 text-lg tracking-tight">NutriFlow</span>
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
                "w-full justify-start gap-3 h-11 rounded-xl transition-all duration-200 touch-manipulation",
                isCollapsed && "justify-center px-0",
                isActive 
                  ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/15 shadow-sm border border-emerald-200/50" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <item.icon className={cn(
                "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                isActive ? "text-emerald-500" : "text-slate-400"
              )} strokeWidth={isActive ? 2.5 : 1.5} />
              {!isCollapsed && (
                <span className={cn(
                  "text-sm transition-colors",
                  isActive ? "font-semibold" : "font-medium"
                )}>
                  {item.label}
                </span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200/60">
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 h-11 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </Button>
      </div>

      {/* Collapse Toggle - Desktop only */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 hover:shadow transition-all duration-200"
        >
          <ChevronLeft className={cn(
            "w-3 h-3 text-slate-400 transition-transform duration-200",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      )}
    </aside>
  );
}
