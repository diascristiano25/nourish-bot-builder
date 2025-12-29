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

interface NutritionistProfile {
  id: string;
  full_name: string;
  crn: string | null;
  phone: string | null;
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
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
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
                      <NeonText variant="lime">Configurações</NeonText>
                    </h1>
                    <p className="text-sm text-muted-foreground">Personalize seu perfil profissional</p>
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
          {/* Personal Info */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Informações Pessoais</h2>
                <p className="text-sm text-muted-foreground">Dados que aparecerão nos documentos exportados</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-muted-foreground text-sm">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr(a). Nome Sobrenome"
                  className="rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crn" className="text-muted-foreground text-sm">CRN</Label>
                  <Input
                    id="crn"
                    value={crn}
                    onChange={(e) => setCrn(e.target.value)}
                    placeholder="CRN-X 12345"
                    className="rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-muted-foreground text-sm">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Logo */}
          <GlassCard className="p-6" data-tour="profile-logo">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Image className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Logo</h2>
                <p className="text-sm text-muted-foreground">Adicione sua logo para aparecer nos PDFs e Portal do Paciente</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl glass">
                <div className="flex items-center gap-2">
                  <Link2 className={`w-4 h-4 ${useLogoUrl ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${useLogoUrl ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    Link
                  </span>
                </div>
                <Switch
                  checked={!useLogoUrl}
                  onCheckedChange={(checked) => setUseLogoUrl(!checked)}
                />
                <div className="flex items-center gap-2">
                  <Upload className={`w-4 h-4 ${!useLogoUrl ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${!useLogoUrl ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                    Upload
                  </span>
                </div>
              </div>

              {useLogoUrl ? (
                <div className="space-y-2">
                  <Label htmlFor="logoUrl" className="text-muted-foreground text-sm">URL da Logo</Label>
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                    className="rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer glass">
                  <input
                    type="file"
                    id="logo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      if (file.size > 2 * 1024 * 1024) {
                        toast({
                          title: 'Arquivo muito grande',
                          description: 'O tamanho máximo é 2MB.',
                          variant: 'destructive'
                        });
                        return;
                      }
                      
                      setUploadingLogo(true);
                      try {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const base64 = event.target?.result as string;
                          setLogoUrl(base64);
                          toast({
                            title: 'Logo carregada!',
                            description: 'Clique em Salvar para confirmar.',
                          });
                        };
                        reader.readAsDataURL(file);
                      } catch (error: any) {
                        toast({
                          title: 'Erro ao carregar',
                          description: error.message,
                          variant: 'destructive'
                        });
                      } finally {
                        setUploadingLogo(false);
                      }
                    }}
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    {uploadingLogo ? (
                      <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    )}
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG (máx. 2MB)
                    </p>
                  </label>
                </div>
              )}
              
              {logoUrl && (
                <div className="p-4 rounded-xl glass">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Prévia</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogoUrl('')}
                      className="text-xs h-7 text-muted-foreground hover:text-foreground"
                    >
                      Remover
                    </Button>
                  </div>
                  <div className="bg-background/50 rounded-lg p-4 flex justify-center">
                    <img 
                      src={logoUrl} 
                      alt="Logo preview" 
                      className="max-h-20 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Colors */}
          <GlassCard className="p-6" data-tour="profile-colors">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                <Palette className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Cores da Marca</h2>
                <p className="text-sm text-muted-foreground">Personalize as cores dos documentos</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-muted-foreground text-sm">Cor Principal</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer rounded-lg"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 rounded-xl bg-background/50 border-border/50"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-muted-foreground text-sm">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      id="secondaryColor"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer rounded-lg"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 rounded-xl bg-background/50 border-border/50"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="p-4 rounded-xl glass">
                <p className="text-sm font-medium text-muted-foreground mb-3">Prévia do Cabeçalho</p>
                <div 
                  className="p-4 rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                  <div className="flex items-center gap-3">
                    {logoUrl && (
                      <img src={logoUrl} alt="Logo" className="h-8 object-contain" />
                    )}
                    <div>
                      <p className="font-bold">{fullName || 'Seu Nome'}</p>
                      <p className="text-sm opacity-90">{crn || 'CRN-X 00000'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Email Signature */}
          <GlassCard className="p-6" data-tour="profile-signature">
            <h2 className="font-semibold text-foreground mb-1">Assinatura</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Texto que aparece no rodapé do Portal do Paciente
            </p>
            <div className="space-y-4">
              <Textarea
                id="emailSignature"
                value={emailSignature}
                onChange={(e) => setEmailSignature(e.target.value)}
                placeholder="Ex: Atenciosamente, Dra. Maria Silva - Nutricionista Clínica"
                rows={3}
                className="rounded-xl bg-background/50 border-border/50 focus:border-primary/50"
              />
              
              {emailSignature && (
                <div className="p-4 rounded-xl glass">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Prévia</p>
                  <div className="text-sm text-foreground whitespace-pre-line border-t border-border/30 pt-3">
                    {emailSignature}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Tour Training Section */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Treinamento</h2>
                <p className="text-sm text-muted-foreground">Reinicie o tour de treinamento para rever as funcionalidades</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl glass">
              <div>
                <p className="font-medium text-foreground">Tour de Onboarding</p>
                <p className="text-sm text-muted-foreground">
                  Clique para reiniciar o tour
                </p>
              </div>
              <Button
                variant="outline"
                onClick={async () => {
                  if (profile) {
                    await restartOnboardingTour(profile.id);
                    toast({
                      title: "Tour reiniciado",
                      description: "O tour começará na próxima vez que você acessar o Dashboard.",
                    });
                  }
                }}
                className="gap-2 rounded-xl border-border/50 hover:bg-primary/10"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar Tour
              </Button>
            </div>
          </GlassCard>
        </main>
      </div>
    </AppLayout>
  );
}
