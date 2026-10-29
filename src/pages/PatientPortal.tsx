/**
* PatientPortal - Patient dashboard main entry point
* Redesigned with NutriFlow sage/terracotta palette and motion design
*/
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { PatientLayout } from '@/components/layout/PatientLayout';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { ProgressCard } from '@/components/patient/dashboard/ProgressCard';
import { TodaysMeals } from '@/components/patient/dashboard/TodaysMeals';
import { ChatWidget } from '@/components/patient/dashboard/ChatWidget';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { Target, Calendar, Activity, Heart, Leaf, FlaskConical } from 'lucide-react';
import { motion } from 'framer-motion';
import { LabResultsPanel } from '@/components/LabResultsPanel';
import { PatientAgenda } from '@/components/patient-mobile/PatientAgenda';

export default function PatientPortal() {
const { user, loading: authLoading } = useAuth();
const navigate = useNavigate();
const { patient, mealPlan, progress, isLoading, error } = usePatientData(user?.id || '');

useEffect(() => {
if (!authLoading && !user) {
navigate('/auth');
}
}, [user, authLoading, navigate]);

if (authLoading || isLoading) {
return (
<PatientLayout>
<div className="min-h-screen flex items-center justify-center">
<motion.div
initial={{ opacity: 0, scale: 0.9 }}
animate={{ opacity: 1, scale: 1 }}
className="text-center"
>
<div className="w-16 h-16 bg-gradient-to-br from-[#518C5B] to-[#3d7047] rounded-3xl animate-pulse mx-auto mb-4" />
<p className="text-sm text-muted-foreground">Carregando seu portal...</p>
</motion.div>
</div>
</PatientLayout>
);
}

if (error) {
return (
<PatientLayout>
<ErrorBoundary error={error} />
</PatientLayout>
);
}

const patientData = patient.data;
const mealPlanData = mealPlan.data;
const firstName = patientData?.full_name?.split(' ')[0] || 'Paciente';

return (
<PatientLayout>
<div className="space-y-8 p-4 md:p-6 max-w-7xl mx-auto">
<PageHeader
title={`Bem-vindo, ${firstName}!`}
subtitle="Acompanhe sua evolução e cuide da sua saúde"
icon={<Heart className="w-7 h-7 text-white" />}
gradient="from-[#518C5B] via-[#4a7d52] to-[#3d7047]"
/>

{/* Quick stats */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<RichCard delay={0.1}>
<div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-2xl bg-[#518C5B]/10 flex items-center justify-center">
<Target className="w-6 h-6 text-[#518C5B]" />
</div>
<div className="flex-1 min-w-0">
<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Seu Objetivo</p>
<motion.p
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ delay: 0.2, type: 'spring' }}
className="text-lg font-bold text-foreground leading-tight truncate"
>
{patientData?.goal || 'Não definido'}
</motion.p>
</div>
</div>
</RichCard>

<RichCard delay={0.2}>
<div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-2xl bg-[#C4764A]/10 flex items-center justify-center">
<Calendar className="w-6 h-6 text-[#C4764A]" />
</div>
<div>
<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Refeições/Dia</p>
<motion.p
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ delay: 0.3, type: 'spring' }}
className="text-2xl font-bold text-foreground leading-tight"
>
{mealPlanData?.mealsPerDay || '4'}
</motion.p>
</div>
</div>
</RichCard>

<RichCard delay={0.3}>
<div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
<Activity className="w-6 h-6 text-indigo-500" />
</div>
<div>
<p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Progresso</p>
<motion.p
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
transition={{ delay: 0.4, type: 'spring' }}
className="text-2xl font-bold text-foreground leading-tight"
>
{progress?.percentage || 0}%
</motion.p>
</div>
</div>
</RichCard>
</div>

{/* Progress Card */}
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.4, duration: 0.5 }}
>
<RichCard delay={0.4} padding="lg">
<ProgressCard progress={progress} />
</RichCard>
</motion.div>

{/* Today's Meals */}
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.5, duration: 0.5 }}
>
<RichCard delay={0.5} padding="lg">
<div className="flex items-center gap-2 mb-4">
<div className="w-9 h-9 rounded-xl bg-[#518C5B]/10 flex items-center justify-center">
<Leaf className="w-5 h-5 text-[#518C5B]" />
</div>
<h2 className="text-lg font-bold text-foreground">Refeições de Hoje</h2>
</div>
<TodaysMeals mealPlan={mealPlan} />
</RichCard>
</motion.div>

{/* Agenda do Paciente com Videochamada */}
{patientData?.id && (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.45, duration: 0.5 }}
>
<RichCard delay={0.45} padding="lg">
<div className="flex items-center gap-2 mb-4">
<div className="w-9 h-9 rounded-xl bg-[#518C5B]/10 flex items-center justify-center">
<Calendar className="w-5 h-5 text-[#518C5B]" />
</div>
<div>
<h2 className="text-lg font-bold text-foreground">Minha Agenda</h2>
<p className="text-xs text-muted-foreground">Suas consultas e teleconsultas — entre na videochamada direto daqui</p>
</div>
</div>
<PatientAgenda patientId={patientData.id} />
</RichCard>
</motion.div>
)}

{/* Lab Results - Patient Upload */}
{patientData?.id && (
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.55, duration: 0.5 }}
>
<RichCard delay={0.55} padding="lg">
<div className="flex items-center gap-2 mb-4">
<div className="w-9 h-9 rounded-xl bg-[#C4764A]/10 flex items-center justify-center">
<FlaskConical className="w-5 h-5 text-[#C4764A]" />
</div>
<div>
<h2 className="text-lg font-bold text-foreground">Meus Exames</h2>
<p className="text-xs text-muted-foreground">Envie seus exames — seu nutricionista vê na hora, sem precisar de consulta</p>
</div>
</div>
<LabResultsPanel patientId={patientData.id} />
</RichCard>
</motion.div>
)}

{/* Chat Widget */}
<motion.div
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.6, duration: 0.5 }}
>
<ChatWidget />
</motion.div>
</div>
</PatientLayout>
);
}