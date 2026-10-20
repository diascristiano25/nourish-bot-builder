import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const commonAllergies = ['Glúten', 'Lactose', 'Amendoim', 'Nozes', 'Soja', 'Ovos', 'Frutos do mar', 'Mariscos'];
const commonRestrictions = ['Vegetariano', 'Vegano', 'Sem carne vermelha', 'Kosher', 'Halal', 'Low carb', 'Cetogênica'];
export default function NewPatient() {
const { user, loading: authLoading } = useAuth();
const navigate = useNavigate();
const { toast } = useToast();
const [formData, setFormData] = useState({
fullName: '',
email: '',
phone: '',
birthDate: '',
gender: '',
goal: '',
activityLevel: '',
allergies: [] as string[],
restrictions: [] as string[],
medicalConditions: '',
notes: '',
weight: '',
height: '',
});
const [saving, setSaving] = useState(false);
if (authLoading) return null;
const handleSave = async () => {
if (!user || !formData.fullName.trim()) {
toast({ title: 'Campos obrigatórios', description: 'Nome completo é obrigatório.', variant: 'destructive' });
return;
}
setSaving(true);
try {
const { data: profileData } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
if (!profileData) throw new Error('Profile not found');
const { data: patientData, error } = await supabase.from('patients').insert({
nutritionist_id: profileData.id,
full_name: formData.fullName.trim(),
email: formData.email.trim() || null,
phone: formData.phone.trim() || null,
birth_date: formData.birthDate || null,
gender: formData.gender || null,
goal: formData.goal || null,
activity_level: formData.activityLevel || null,
allergies: formData.allergies,
dietary_restrictions: formData.restrictions,
medical_conditions: formData.medicalConditions || null,
notes: formData.notes || null,
initial_weight: formData.weight ? parseFloat(formData.weight) : null,
height: formData.height ? parseFloat(formData.height) : null,
}).select().single();
if (error) throw error;
toast({ title: 'Paciente cadastrado!', description: `${formData.fullName} foi adicionado com sucesso.` });
navigate(`/pacientes/${patientData.id}`);
} catch (err: any) {
toast({ title: 'Erro ao cadastrar', description: err.message, variant: 'destructive' });
} finally {
setSaving(false);
}
};
const toggleAllergy = (a: string) => {
setFormData(prev => ({ ...prev, allergies: prev.allergies.includes(a) ? prev.allergies.filter(x => x !== a) : [...prev.allergies, a] }));
};
const toggleRestriction = (r: string) => {
setFormData(prev => ({ ...prev, restrictions: prev.restrictions.includes(r) ? prev.restrictions.filter(x => x !== r) : [...prev.restrictions, r] }));
};
return (
<ModernLayout>
<div className="space-y-8 max-w-4xl mx-auto">
<PageHeader
title="Novo Paciente"
subtitle="Preencha a anamnese inicial"
icon={<UserPlus className="w-7 h-7 text-white" />}
gradient="from-[#518C5B] via-[#4a7d52] to-[#2d5a37]"
actions={
<Button onClick={() => navigate('/pacientes')} variant="ghost" className="text-white hover:bg-white/20 rounded-xl">
<ArrowLeft className="w-5 h-5 mr-2" /> Voltar
</Button>
}
/>
<RichCard padding="lg">
<div className="space-y-6">
<div>
<h3 className="text-lg font-bold text-[#518C5B] mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Dados Pessoais</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div><Label>Nome completo *</Label><Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Maria da Silva" /></div>
<div><Label>Email</Label><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="paciente@email.com" /></div>
<div><Label>Telefone</Label><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(11) 99999-9999" /></div>
<div><Label>Data de Nascimento</Label><Input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} /></div>
<div><Label>Sexo</Label><Select value={formData.gender} onValueChange={v => setFormData({...formData, gender: v})}><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger><SelectContent><SelectItem value="Feminino">Feminino</SelectItem><SelectItem value="Masculino">Masculino</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent></Select></div>
</div>
</div>
<div>
<h3 className="text-lg font-bold text-[#C4764A] mb-4 flex items-center gap-2"><Save className="w-5 h-5" /> Medidas Atuais</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div><Label>Peso (kg)</Label><Input type="number" step="0.1" value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})} placeholder="70.5" /></div>
<div><Label>Altura (cm)</Label><Input type="number" value={formData.height} onChange={e => setFormData({...formData, height: e.target.value})} placeholder="170" /></div>
</div>
</div>
<div>
<h3 className="text-lg font-bold text-[#518C5B] mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5" /> Objetivo & Atividade</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div><Label>Objetivo</Label><Select value={formData.goal} onValueChange={v => setFormData({...formData, goal: v})}><SelectTrigger><SelectValue placeholder="Selecione o objetivo" /></SelectTrigger><SelectContent><SelectItem value="Emagrecimento">Emagrecimento</SelectItem><SelectItem value="Hipertrofia">Hipertrofia</SelectItem><SelectItem value="Manutenção">Manutenção</SelectItem><SelectItem value="Saúde">Saúde</SelectItem></SelectContent></Select></div>
<div><Label>Nível de Atividade</Label><Select value={formData.activityLevel} onValueChange={v => setFormData({...formData, activityLevel: v})}><SelectTrigger><SelectValue placeholder="Selecione o nível" /></SelectTrigger><SelectContent><SelectItem value="Sedentário">Sedentário</SelectItem><SelectItem value="Leve">Leve</SelectItem><SelectItem value="Moderado">Moderado</SelectItem><SelectItem value="Intenso">Intenso</SelectItem></SelectContent></Select></div>
</div>
</div>
<div>
<h3 className="text-lg font-bold text-slate-700 mb-3">Alergias</h3>
<div className="flex flex-wrap gap-2">{commonAllergies.map(a => <Button key={a} type="button" size="sm" variant={formData.allergies.includes(a) ? 'default' : 'outline'} onClick={() => toggleAllergy(a)} className={formData.allergies.includes(a) ? 'bg-[#518C5B]' : ''}>{a}</Button>)}</div>
</div>
<div>
<h3 className="text-lg font-bold text-slate-700 mb-3">Restrições Alimentares</h3>
<div className="flex flex-wrap gap-2">{commonRestrictions.map(r => <Button key={r} type="button" size="sm" variant={formData.restrictions.includes(r) ? 'default' : 'outline'} onClick={() => toggleRestriction(r)} className={formData.restrictions.includes(r) ? 'bg-[#C4764A]' : ''}>{r}</Button>)}</div>
</div>
<div><Label>Condições Médicas</Label><Textarea value={formData.medicalConditions} onChange={e => setFormData({...formData, medicalConditions: e.target.value})} placeholder="Diabetes, hipertensão, etc." /></div>
<div><Label>Observações</Label><Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Notas adicionais..." /></div>
<Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-to-r from-[#518C5B] to-[#3d7047] hover:opacity-90 text-white py-3 text-lg">
{saving ? 'Salvando...' : <><Save className="w-5 h-5 mr-2" /> Cadastrar Paciente</>}
</Button>
</div>
</RichCard>
</div>
</ModernLayout>
);
}