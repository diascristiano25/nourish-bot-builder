import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Settings, User as UserIcon, Award, Phone } from 'lucide-react';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { ProfileForm } from '@/components/nutritionist/profile/ProfileForm';
import { PageHeader } from '@/components/shared/PageHeader';
import { RichCard } from '@/components/shared/RichCard';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NutritionistProfile {
  id: string;
  full_name: string;
  crn: string | null;
  phone: string | null;
  bio: string | null;
  specialties: string[] | null;
  photo_url: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  email_signature: string | null;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      toast({ title: 'Erro ao carregar perfil', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      // ProfileForm handles its own save via internal state; this is a fallback trigger
      toast({ title: 'Salvando...', description: 'Aguarde um momento.' });
    } catch (error: any) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ModernLayout>
        <div className="min-h-screen flex items-center justify-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#518C5B] to-[#3d7047] rounded-3xl animate-pulse mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Carregando perfil...</p>
          </motion.div>
        </div>
      </ModernLayout>
    );
  }

  const initials = profile?.full_name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || 'N';

  return (
    <ModernLayout>
      <div className="space-y-8">
        <PageHeader
          title="Meu Perfil"
          subtitle="Personalize suas informações e identidade visual"
          icon={<Settings className="w-7 h-7 text-white" />}
          gradient="from-[#518C5B] via-[#4a7d52] to-[#3d7047]"
          actions={
            <Button
              onClick={handleSave}
              disabled={saving}
              className="gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white border border-white/20 rounded-2xl font-semibold px-5 h-11 shadow-lg"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </Button>
          }
        />

        {/* Profile summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RichCard delay={0.1}>
            <div className="flex items-center gap-4">
              <Avatar className="w-14 h-14 ring-4 ring-[#518C5B]/10">
                <AvatarFallback className="bg-gradient-to-br from-[#518C5B] to-[#3d7047] text-white text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Nome</p>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-lg font-bold text-slate-800 truncate"
                >
                  {profile?.full_name || 'Nutricionista'}
                </motion.p>
              </div>
            </div>
          </RichCard>

          <RichCard delay={0.2}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#C4764A]/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-[#C4764A]" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">CRN</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring' }}
                  className="text-2xl font-bold text-slate-800 leading-tight"
                >
                  {profile?.crn || '—'}
                </motion.p>
              </div>
            </div>
          </RichCard>

          <RichCard delay={0.3}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Phone className="w-6 h-6 text-indigo-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Telefone</p>
                <motion.p
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring' }}
                  className="text-lg font-bold text-slate-800 leading-tight truncate"
                >
                  {profile?.phone || '—'}
                </motion.p>
              </div>
            </div>
          </RichCard>
        </div>

        {/* Profile form in rich card */}
        <RichCard delay={0.4} padding="lg">
          <div className="flex items-center gap-2 mb-6">
            <UserIcon className="w-5 h-5 text-[#518C5B]" />
            <h2 className="text-lg font-bold text-slate-800">Informações do Perfil</h2>
          </div>
          <ProfileForm profile={profile} />
        </RichCard>
      </div>
    </ModernLayout>
  );
}