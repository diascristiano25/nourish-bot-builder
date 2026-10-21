import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  DollarSign,
  Settings,
  ChevronLeft,
  LogOut,
  Shield,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import logoImg from '@/assets/logo.png';

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
}

const adminNavItems: NavItem[] = [
  { label: 'Visão Geral', icon: LayoutDashboard, href: '/admin' },
  { label: 'Nutricionistas', icon: Users, href: '/admin/nutris' },
  { label: 'Suporte', icon: MessageSquare, href: '/admin/suporte' },
  { label: 'Financeiro', icon: DollarSign, href: '/admin/financeiro' },
  { label: 'Configurações', icon: Settings, href: '/admin/configuracoes' },
];

interface AdminSidebarProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

export function AdminSidebar({ isMobile = false, onNavigate }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [pendingTickets, setPendingTickets] = useState(0);

  useEffect(() => {
    fetchPendingTickets();

    const channel = supabase
      .channel('admin-sidebar-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'support_tickets' },
        () => fetchPendingTickets()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingTickets = async () => {
    try {
      const { count, error } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'open');

      if (!error) {
        setPendingTickets(count || 0);
      }
    } catch (error) {
      console.error('Error fetching pending tickets:', error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const sidebarWidth = collapsed ? 'w-[72px]' : 'w-56';

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen border-r border-border/50 bg-card/95 backdrop-blur-xl transition-all duration-300',
        sidebarWidth,
        isMobile && 'w-72'
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-14 items-center gap-3 border-b border-border/30 px-4">
          <img src={logoImg} alt="NutriFlow" className="h-8 w-8 object-contain" />
          {!collapsed && (
            <div className="flex items-center gap-1">
              <span className="font-serif font-semibold text-foreground tracking-tight">
                Nutri<span className="text-primary">Flow</span>
              </span>
              <Badge variant="secondary" className="ml-1 bg-primary/20 text-primary border-primary/30 text-[10px] px-1.5">
                <Shield className="w-3 h-3 mr-0.5" />
                Admin
              </Badge>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.href ||
              (item.href !== '/admin' && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onNavigate}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  collapsed && !isMobile && 'justify-center px-2'
                )}
                title={collapsed && !isMobile ? item.label : undefined}
              >
                <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                {(!collapsed || isMobile) && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.href === '/admin/suporte' && pendingTickets > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-white">
                        {pendingTickets}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-border/30 p-3 space-y-1">
          {/* Back to App */}
          <Link
            to="/dashboard"
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground',
              collapsed && !isMobile && 'justify-center px-2'
            )}
            title={collapsed && !isMobile ? 'Voltar ao App' : undefined}
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {(!collapsed || isMobile) && <span>Voltar ao App</span>}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted/50 hover:text-foreground',
              collapsed && !isMobile && 'justify-center px-2'
            )}
            title={collapsed && !isMobile ? (theme === 'dark' ? 'Modo Claro' : 'Modo Escuro') : undefined}
          >
            {theme === 'dark' ? (
              <span className="text-lg">☀️</span>
            ) : (
              <span className="text-lg">🌙</span>
            )}
            {(!collapsed || isMobile) && (
              <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
            )}
          </button>

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className={cn(
              'group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive/80 transition-all hover:bg-destructive/10 hover:text-destructive',
              collapsed && !isMobile && 'justify-center px-2'
            )}
            title={collapsed && !isMobile ? 'Sair' : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {(!collapsed || isMobile) && <span>Sair</span>}
          </button>

          {/* Collapse Toggle (desktop only) */}
          {!isMobile && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="mt-2 flex w-full items-center justify-center rounded-lg py-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform duration-300',
                  collapsed && 'rotate-180'
                )}
              />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}