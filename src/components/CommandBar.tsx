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
Plus,
Search,
BookOpen,
DollarSign,
User,
LogOut,
HelpCircle,
Sparkles,
LayoutDashboard,
TrendingUp,
MessageCircle,
Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface CommandBarProps {
open?: boolean;
onOpenChange?: (open: boolean) => void;
}

interface CommandAction {
id: string;
label: string;
subtitle?: string;
icon: React.ElementType;
action: () => void;
keywords?: string[];
group: 'navigation' | 'actions' | 'settings' | 'patients' | 'appointments';
}

export function CommandBar({ open, onOpenChange }: CommandBarProps) {
const [internalOpen, setInternalOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [patients, setPatients] = useState<Array<{ id: string; full_name: string; email?: string }>>([]);
const [appointments, setAppointments] = useState<Array<{ id: string; patient_name: string; scheduled_at: string }>>([]);
const [loadingData, setLoadingData] = useState(false);
const navigate = useNavigate();
const { user, signOut } = useAuth();
const isOpen = open ?? internalOpen;
const setIsOpen = onOpenChange ?? setInternalOpen;

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

useEffect(() => {
if (!isOpen || !user) return;
let cancelled = false;
const load = async () => {
try {
setLoadingData(true);
const { data: profile } = await supabase
.from('profiles')
.select('id')
.eq('user_id', user.id)
.single();
if (!profile || cancelled) return;
const [patientsRes, apptsRes] = await Promise.all([
supabase
.from('patients')
.select('id, full_name, email')
.eq('nutritionist_id', profile.id)
.order('created_at', { ascending: false })
.limit(50),
supabase
.from('appointments')
.select('id, scheduled_at, patient:patients(full_name)')
.eq('nutritionist_id', profile.id)
.gte('scheduled_at', new Date().toISOString())
.order('scheduled_at', { ascending: true })
.limit(20),
]);
if (cancelled) return;
setPatients((patientsRes.data || []) as any);
setAppointments(
(apptsRes.data || []).map((a: any) => ({
id: a.id,
patient_name: Array.isArray(a.patient) ? a.patient[0]?.full_name : a.patient?.full_name || 'Paciente',
scheduled_at: a.scheduled_at,
}))
);
} catch (err) {
console.warn('CommandBar: falha ao carregar dados reais:', err);
} finally {
if (!cancelled) setLoadingData(false);
}
};
load();
return () => { cancelled = true; };
}, [isOpen, user]);

const staticActions: CommandAction[] = useMemo(() => [
{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => navigate('/dashboard'), keywords: ['home', 'início', 'painel'], group: 'navigation' },
{ id: 'evolucao', label: 'Evolução', icon: TrendingUp, action: () => navigate('/evolucao'), keywords: ['progresso', 'peso', 'imc', 'gordura'], group: 'navigation' },
{ id: 'mensagens', label: 'Mensagens', icon: MessageCircle, action: () => navigate('/mensagens'), keywords: ['chat', 'conversas', 'pacientes'], group: 'navigation' },
{ id: 'patients', label: 'Pacientes', icon: Users, action: () => navigate('/pacientes'), keywords: ['clientes', 'lista'], group: 'navigation' },
{ id: 'agenda', label: 'Agenda', icon: Calendar, action: () => navigate('/agenda'), keywords: ['calendário', 'consultas', 'horários'], group: 'navigation' },
{ id: 'biblioteca', label: 'Biblioteca', icon: BookOpen, action: () => navigate('/biblioteca'), keywords: ['alimentos', 'taco', 'receitas', 'planos'], group: 'navigation' },
{ id: 'financeiro', label: 'Financeiro', icon: DollarSign, action: () => navigate('/financeiro'), keywords: ['dinheiro', 'receita', 'despesa'], group: 'navigation' },
{ id: 'profile', label: 'Perfil', icon: User, action: () => navigate('/perfil'), keywords: ['conta', 'configurações'], group: 'navigation' },
{ id: 'new-patient', label: 'Novo Paciente', icon: Plus, action: () => navigate('/novo-paciente'), keywords: ['adicionar', 'cadastrar', 'criar'], group: 'actions' },
{ id: 'new-meal-plan', label: 'Gerar Cardápio com IA', icon: Sparkles, action: () => navigate('/gerar-cardapio'), keywords: ['dieta', 'plano', 'alimentar', 'inteligência artificial'], group: 'actions' },
{ id: 'help', label: 'Suporte', icon: HelpCircle, action: () => navigate('/suporte/ajuda'), keywords: ['ajuda', 'contato', 'faq'], group: 'settings' },
{ id: 'logout', label: 'Sair', icon: LogOut, action: () => signOut(), keywords: ['deslogar', 'logout'], group: 'settings' },
], [navigate, signOut]);

const dynamicActions = useMemo<CommandAction[]>(() => {
const q = searchQuery.trim().toLowerCase();
const patientActions: CommandAction[] = patients
.filter((p) => !q || p.full_name.toLowerCase().includes(q) || (p.email || '').toLowerCase().includes(q))
.slice(0, 8)
.map((p) => ({
id: `patient-${p.id}`,
label: p.full_name,
subtitle: p.email || 'Paciente',
icon: User,
action: () => navigate(`/pacientes/${p.id}`),
keywords: [p.full_name, p.email || ''],
group: 'patients',
}));
const apptActions: CommandAction[] = appointments
.filter((a) => !q || a.patient_name.toLowerCase().includes(q))
.slice(0, 6)
.map((a) => ({
id: `appt-${a.id}`,
label: `Consulta · ${a.patient_name}`,
subtitle: new Date(a.scheduled_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
icon: Calendar,
action: () => navigate('/agenda'),
keywords: [a.patient_name, 'consulta', 'agenda'],
group: 'appointments',
}));
return [...patientActions, ...apptActions];
}, [patients, appointments, searchQuery, navigate]);

const runAction = useCallback((action: CommandAction) => {
setIsOpen(false);
setSearchQuery('');
action.action();
}, [setIsOpen]);

const navigationActions = staticActions.filter(a => a.group === 'navigation');
const quickActions = staticActions.filter(a => a.group === 'actions');
const settingsActions = staticActions.filter(a => a.group === 'settings');
const patientResults = dynamicActions.filter(a => a.group === 'patients');
const appointmentResults = dynamicActions.filter(a => a.group === 'appointments');
const hasDynamicResults = patientResults.length > 0 || appointmentResults.length > 0;

const filteredNav = navigationActions.filter(a =>
!searchQuery ||
a.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
(a.keywords || []).some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
);

return (
<CommandDialog open={isOpen} onOpenChange={(v) => { setIsOpen(v); if (!v) setSearchQuery(''); }}>
<Command className="rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl" shouldFilter={false}>
<div className="flex items-center border-b border-border/50 px-4">
<Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
<CommandInput
placeholder="Buscar pacientes, consultas, ações..."
className="h-14 text-base placeholder:text-muted-foreground"
value={searchQuery}
onValueChange={setSearchQuery}
/>
<kbd className="pointer-events-none ml-auto hidden h-6 select-none items-center gap-1 rounded border border-border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
<span className="text-xs">⌘</span>K
</kbd>
</div>
<CommandList className="max-h-[420px] p-2 overflow-y-auto">
{!hasDynamicResults && filteredNav.length === 0 && !loadingData && (
<CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
<div className="flex flex-col items-center gap-2">
<Search className="h-8 w-8 text-muted-foreground/50" />
<p>Nenhum resultado encontrado.</p>
</div>
</CommandEmpty>
)}

{patientResults.length > 0 && (
<>
<CommandGroup heading="Pacientes" className="px-2">
{patientResults.map((action) => (
<CommandItem
key={action.id}
value={action.id}
onSelect={() => runAction(action)}
className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
>
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#518C5B]/10">
<action.icon className="h-4 w-4 text-[#518C5B]" />
</div>
<div className="flex flex-col min-w-0">
<span className="font-medium truncate">{action.label}</span>
{action.subtitle && <span className="text-xs text-muted-foreground truncate">{action.subtitle}</span>}
</div>
</CommandItem>
))}
</CommandGroup>
<CommandSeparator className="my-2 bg-border/50" />
</>
)}

{appointmentResults.length > 0 && (
<>
<CommandGroup heading="Próximas Consultas" className="px-2">
{appointmentResults.map((action) => (
<CommandItem
key={action.id}
value={action.id}
onSelect={() => runAction(action)}
className="flex items-center gap-3 px-4 py-3 cursor-pointer rounded-xl data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
>
<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#C4764A]/10">
<action.icon className="h-4 w-4 text-[#C4764A]" />
</div>
<div className="flex flex-col min-w-0">
<span className="font-medium truncate">{action.label}</span>
{action.subtitle && <span className="text-xs text-muted-foreground truncate">{action.subtitle}</span>}
</div>
</CommandItem>
))}
</CommandGroup>
<CommandSeparator className="my-2 bg-border/50" />
</>
)}

{loadingData && (
<div className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
<Loader2 className="h-3 w-3 animate-spin" />
Carregando pacientes e consultas...
</div>
)}

{filteredNav.length > 0 && (
<CommandGroup heading="Navegação" className="px-2">
{filteredNav.map((action) => (
<CommandItem
key={action.id}
value={action.id}
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
)}

{!searchQuery && (
<>
<CommandSeparator className="my-2 bg-border/50" />
<CommandGroup heading="Ações Rápidas" className="px-2">
{quickActions.map((action) => (
<CommandItem
key={action.id}
value={action.id}
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
value={action.id}
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
</>
)}
</CommandList>
</Command>
</CommandDialog>
);
}