import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save, Upload, User, Link2, Image, Palette, GraduationCap, RotateCcw, Settings } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { restartOnboardingTour, isTourCompleted } from '@/components/OnboardingTour';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import { ModernLayout } from '@/components/layout/ModernLayout';
import { ProfileForm } from '@/components/nutritionist/profile/ProfileForm';

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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [useLogoUrl, setUseLogoUrl] = useState(true);

  const [fullName, setFullName] = useState('');
  const [crn, setCrn] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#10B981');
  const [secondaryColor, setSecondaryColor] = useState('#059669');
  const [logoUrl, setLogoUrl] = useState('');
  const [emailSignature, setEmailSignature] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
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
      setFullName(data.full_name || '');
      setCrn(data.crn || '');
      setPhone(data.phone || '');
      setPrimaryColor(data.primary_color || '#10B981');
      setSecondaryColor(data.secondary_color || '#059669');
      setLogoUrl(data.logo_url || '');
      setEmailSignature(data.email_signature || '');
    } catch (error: any) {
      toast({
        title: "Erro ao carregar perfil",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          crn: crn.trim() || null,
          phone: phone.trim() || null,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          logo_url: logoUrl.trim() || null,
          email_signature: emailSignature.trim() || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <ModernLayout>
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </ModernLayout>
    );
  }

  return (
    <ModernLayout>
      <div className="min-h-screen bg-[#FAF8F5]">
        {/* Cyber Header */}
        <header className="sticky top-0 z-30 glass-strong border-b border-border/30">
          <div className="px-4 md:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/dashboard')}
                  className="rounded-xl glass hover:bg-primary/10"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground tracking-tight">
                      <NeonText variant="lime">Meu Perfil</NeonText>
                    </h1>
                    <p className="text-sm text-muted-foreground">Personalizar suas informações</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="gap-2 bg-primary hover:bg-primary/90 rounded-xl h-10 px-5"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 max-w-3xl mx-auto space-y-6">
          <ProfileForm profile={profile} />
        </main>
      </div>
    </ModernLayout>
  );
}
