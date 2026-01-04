import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  DollarSign, 
  Settings,
  ChevronLeft,
  LogOut,
  BookOpen,
  HelpCircle,
  Search,
  Sun,
  Moon,
  MessageCircle,
  FileText,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { NeonText } from '@/components/ui/NeonText';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
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
  { label: 'Dashboard', icon: Home, href: '/dashboard', tourId: 'nav-home' },
  { label: 'Pacientes', icon: Users, href: '/patients', tourId: 'nav-pacientes' },
  { label: 'Agenda', icon: Calendar, href: '/agenda', tourId: 'nav-agenda' },
  { label: 'Biblioteca', icon: BookOpen, href: '/biblioteca', tourId: 'nav-biblioteca' },
  { label: 'Financeiro', icon: DollarSign, href: '/financeiro', tourId: 'nav-financeiro' },
  { label: 'Configurações', icon: Settings, href: '/profile', tourId: 'nav-config' },
];

interface NavItemWithBadge extends NavItemWithTour {
  showBadge?: boolean;
}

const WHATSAPP_HELP_URL = "https://wa.me/5547992381906?text=Olá! Preciso de ajuda com o NutriFlow.";

interface AppSidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
  onCommandBarOpen?: () => void;
}

export function AppSidebar({ isMobile = false, onNavigate, onCommandBarOpen }: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [nutritionistId, setNutritionistId] = useState<string | null>(null);

  // Fetch nutritionist ID and unread messages
  useEffect(() => {
    if (!user) return;

    const fetchNutritionistId = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setNutritionistId(data.id);
      }
    };

    fetchNutritionistId();
  }, [user]);

  useEffect(() => {
    if (!nutritionistId) return;

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('nutritionist_id', nutritionistId)
        .eq('sender_type', 'patient')
        .eq('is_read', false);

      setUnreadMessages(count || 0);
    };

    fetchUnread();

    // Subscribe to message changes
    const channel = supabase
      .channel('sidebar-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `nutritionist_id=eq.${nutritionistId}`,
        },
        () => {
          fetchUnread();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [nutritionistId]);

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
        "h-screen glass-strong border-r border-border/30 transition-all duration-300 flex flex-col",
        isMobile ? "w-full bg-background" : "fixed left-0 top-0 z-40",
        isMobile ? "" : (isCollapsed ? "w-[72px]" : "w-56")
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-border/30 px-4",
        isCollapsed ? "justify-center" : "gap-3"
      )}>
        <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0">
          <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
          <img src={logoImg} alt="NutriFlow" className="w-9 h-9 object-contain relative z-10" />
        </div>
        {!isCollapsed && (
          <span className="font-bold text-foreground text-lg tracking-tight">
            Nutri<NeonText variant="lime">Flow</NeonText>
          </span>
        )}
      </div>

      {/* Command Bar Shortcut */}
      {!isCollapsed && (
        <div className="px-3 py-3">
          <Button
            variant="outline"
            onClick={onCommandBarOpen}
            className="w-full justify-between h-10 rounded-xl border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30 text-muted-foreground text-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Buscar...</span>
            </div>
            <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              Ctrl+K
            </kbd>
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-2 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/dashboard' && location.pathname === '/');
          const showBadge = item.href === '/patients' && unreadMessages > 0;
          
          return (
            <Button
              key={item.href}
              variant="ghost"
              onClick={() => handleNavigation(item.href)}
              data-tour={item.tourId}
              className={cn(
                "w-full justify-start gap-3 h-11 rounded-xl transition-all duration-200 touch-manipulation group relative",
                isCollapsed && "justify-center px-0",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_20px_hsl(68_100%_50%/0.15)]" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn(
                "w-[18px] h-[18px] flex-shrink-0 transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
              )} strokeWidth={isActive ? 2 : 1.5} />
              {!isCollapsed && (
                <>
                  <span className={cn(
                    "text-sm transition-colors flex-1 text-left",
                    isActive ? "font-semibold" : "font-medium"
                  )}>
                    {item.label}
                  </span>
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className="h-5 min-w-5 px-1.5 text-xs font-bold animate-pulse"
                    >
                      {unreadMessages > 99 ? '99+' : unreadMessages}
                    </Badge>
                  )}
                </>
              )}
              {isCollapsed && showBadge && (
                <div className="absolute -top-1 -right-1">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                  </span>
                </div>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/30 space-y-1">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          onClick={toggleTheme}
          className={cn(
            "w-full justify-start gap-3 h-11 rounded-xl text-muted-foreground hover:text-warning hover:bg-warning/10 transition-all duration-200",
            isCollapsed && "justify-center px-0"
          )}
        >
          {theme === 'dark' ? (
            <Sun className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
          ) : (
            <Moon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
          )}
          {!isCollapsed && <span className="text-sm font-medium">{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>}
        </Button>
        <Button
          variant="ghost"
          asChild
          className={cn(
            "w-full justify-start gap-3 h-11 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-200",
            isCollapsed && "justify-center px-0"
          )}
        >
          <a href={WHATSAPP_HELP_URL} target="_blank" rel="noopener noreferrer">
            <HelpCircle className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
            {!isCollapsed && <span className="text-sm font-medium">Ajuda</span>}
          </a>
        </Button>
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className={cn(
            "w-full justify-start gap-3 h-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
          {!isCollapsed && <span className="text-sm font-medium">Sair</span>}
        </Button>

        {/* Legal Links */}
        {!isCollapsed && (
          <div className="pt-3 mt-2 border-t border-border/30 flex flex-wrap gap-x-3 gap-y-1 px-1">
            <Link 
              to="/termos" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <FileText className="w-3 h-3" />
              Termos
            </Link>
            <Link 
              to="/privacidade" 
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              Privacidade
            </Link>
          </div>
        )}
      </div>

      {/* Collapse Toggle - Desktop only */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full glass border border-border/50 hover:border-primary/50 hover:bg-muted transition-all duration-200"
        >
          <ChevronLeft className={cn(
            "w-3 h-3 text-muted-foreground transition-transform duration-200",
            isCollapsed && "rotate-180"
          )} />
        </Button>
      )}
    </aside>
  );
}
