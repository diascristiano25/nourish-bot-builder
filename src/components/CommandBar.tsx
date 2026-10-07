import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Users,
  Calendar,
  FileText,
  Settings,
  Home,
  Plus,
  Search,
  BookOpen,
  DollarSign,
  User,
  LogOut,
  HelpCircle,
  Sparkles,
  LayoutDashboard,
  Utensils,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface CommandBarProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CommandAction {
  id: string;
  label: string;
  icon: React.ElementType;
  action: () => void;
  keywords?: string[];
  group: 'navigation' | 'actions' | 'settings';
}

export function CommandBar({ open, onOpenChange }: CommandBarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isOpen = open ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  // Toggle command bar with CMD+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isOpen, setIsOpen]);

  const actions: CommandAction[] = useMemo(() => [
    // Navigation
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
      keywords: ['home', 'início', 'painel'],
      group: 'navigation',
    },
    {
      id: 'patients',
      label: 'Pacientes',
      icon: Users,
      action: () => navigate('/pacientes'),
      keywords: ['clientes', 'lista'],
      group: 'navigation',
    },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: Calendar,
      action: () => navigate('/agenda'),
      keywords: ['calendário', 'consultas', 'horários'],
      group: 'navigation',
    },
    {
      id: 'biblioteca',
      label: 'Biblioteca',
      icon: BookOpen,
      action: () => navigate('/biblioteca'),
      keywords: ['alimentos', 'taco', 'receitas'],
      group: 'navigation',
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: DollarSign,
      action: () => navigate('/financeiro'),
      keywords: ['dinheiro', 'receita', 'despesa'],
      group: 'navigation',
    },
    {
      id: 'profile',
      label: 'Perfil',
      icon: User,
      action: () => navigate('/profile'),
      keywords: ['conta', 'configurações'],
      group: 'navigation',
    },
    // Quick Actions
    {
      id: 'new-patient',
      label: 'Novo Paciente',
      icon: Plus,
      action: () => navigate('/new-patient'),
      keywords: ['adicionar', 'cadastrar', 'criar'],
      group: 'actions',
    },
    {
      id: 'new-meal-plan',
      label: 'Gerar Cardápio com IA',
      icon: Sparkles,
      action: () => navigate('/generate-meal-plan'),
      keywords: ['dieta', 'plano', 'alimentar', 'inteligência artificial'],
      group: 'actions',
    },
    // Settings
    {
      id: 'help',
      label: 'Suporte',
      icon: HelpCircle,
      action: () => window.open('https://wa.me/5547992381906', '_blank'),
      keywords: ['ajuda', 'contato', 'whatsapp'],
      group: 'settings',
    },
    {
      id: 'logout',
      label: 'Sair',
      icon: LogOut,
      action: () => signOut(),
      keywords: ['deslogar', 'logout'],
      group: 'settings',
    },
  ], [navigate, signOut]);

  const runAction = useCallback((action: CommandAction) => {
    setIsOpen(false);
    action.action();
  }, [setIsOpen]);

  const navigationActions = actions.filter(a => a.group === 'navigation');
  const quickActions = actions.filter(a => a.group === 'actions');
  const settingsActions = actions.filter(a => a.group === 'settings');

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <Command className="rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl">
        <div className="flex items-center border-b border-border/50 px-4">
          <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <CommandInput 
            placeholder="Digite um comando ou busque..." 
            className="h-14 text-base placeholder:text-muted-foreground"
          />
          <kbd className="pointer-events-none ml-auto hidden h-6 select-none items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
        <CommandList className="max-h-[400px] p-2">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <Search className="h-8 w-8 text-muted-foreground/50" />
              <p>Nenhum resultado encontrado.</p>
            </div>
          </CommandEmpty>
          
          <CommandGroup heading="Navegação" className="px-2">
            {navigationActions.map((action) => (
              <CommandItem
                key={action.id}
                value={`${action.label} ${action.keywords?.join(' ')}`}
                onSelect={() => runAction(action)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-2 bg-border/50" />

          <CommandGroup heading="Ações Rápidas" className="px-2">
            {quickActions.map((action) => (
              <CommandItem
                key={action.id}
                value={`${action.label} ${action.keywords?.join(' ')}`}
                onSelect={() => runAction(action)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium">{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator className="my-2 bg-border/50" />

          <CommandGroup heading="Configurações" className="px-2">
            {settingsActions.map((action) => (
              <CommandItem
                key={action.id}
                value={`${action.label} ${action.keywords?.join(' ')}`}
                onSelect={() => runAction(action)}
                className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/50">
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="font-medium">{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
