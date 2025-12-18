import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save, Upload, User, Link2, Image, Palette } from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';

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
        .from('nutritionists')
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
        .from('nutritionists')
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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-slate-50">
        {/* Elite Header */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60">
          <div className="px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => navigate('/dashboard')}
                  className="rounded-xl"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
                    Configurações
                  </h1>
                  <p className="text-sm text-slate-500">Personalize seu perfil profissional</p>
                </div>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={saving} 
                className="gap-2 bg-emerald-500 hover:bg-emerald-600 rounded-xl h-10 px-5"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
          {/* Personal Info */}
          <Card className="bg-white rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-emerald-500" />
                </div>
                Informações Pessoais
              </CardTitle>
              <CardDescription className="text-slate-500">
                Dados que aparecerão nos documentos exportados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700">Nome Completo</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Dr(a). Nome Sobrenome"
                  className="rounded-xl border-slate-200 focus:border-emerald-300"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="crn" className="text-slate-700">CRN</Label>
                  <Input
                    id="crn"
                    value={crn}
                    onChange={(e) => setCrn(e.target.value)}
                    placeholder="CRN-X 12345"
                    className="rounded-xl border-slate-200 focus:border-emerald-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-700">Telefone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                    className="rounded-xl border-slate-200 focus:border-emerald-300"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card className="bg-white rounded-2xl border-0 shadow-sm" data-tour="profile-logo">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Image className="w-4 h-4 text-blue-500" />
                </div>
                Logo
              </CardTitle>
              <CardDescription className="text-slate-500">
                Adicione sua logo para aparecer nos PDFs e Portal do Paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50">
                <div className="flex items-center gap-2">
                  <Link2 className={`w-4 h-4 ${useLogoUrl ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={`text-sm ${useLogoUrl ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                    Link
                  </span>
                </div>
                <Switch
                  checked={!useLogoUrl}
                  onCheckedChange={(checked) => setUseLogoUrl(!checked)}
                />
                <div className="flex items-center gap-2">
                  <Upload className={`w-4 h-4 ${!useLogoUrl ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <span className={`text-sm ${!useLogoUrl ? 'font-medium text-slate-700' : 'text-slate-400'}`}>
                    Upload
                  </span>
                </div>
              </div>

              {useLogoUrl ? (
                <div className="space-y-2">
                  <Label htmlFor="logoUrl" className="text-slate-700">URL da Logo</Label>
                  <Input
                    id="logoUrl"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://exemplo.com/logo.png"
                    className="rounded-xl border-slate-200 focus:border-emerald-300"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:border-emerald-300 transition-colors cursor-pointer">
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
                      <Loader2 className="w-8 h-8 mx-auto text-slate-400 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                    )}
                    <p className="text-sm text-slate-500">
                      Clique para selecionar
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG (máx. 2MB)
                    </p>
                  </label>
                </div>
              )}
              
              {logoUrl && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-slate-600">Prévia</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLogoUrl('')}
                      className="text-xs h-7 text-slate-500"
                    >
                      Remover
                    </Button>
                  </div>
                  <div className="bg-white rounded-lg p-4 flex justify-center">
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
            </CardContent>
          </Card>

          {/* Colors */}
          <Card className="bg-white rounded-2xl border-0 shadow-sm" data-tour="profile-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-800">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-purple-500" />
                </div>
                Cores da Marca
              </CardTitle>
              <CardDescription className="text-slate-500">
                Personalize as cores dos documentos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor" className="text-slate-700">Cor Principal</Label>
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
                      className="flex-1 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor" className="text-slate-700">Cor Secundária</Label>
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
                      className="flex-1 rounded-xl border-slate-200"
                    />
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="p-4 rounded-xl border border-slate-200">
                <p className="text-sm font-medium text-slate-600 mb-3">Prévia do Cabeçalho</p>
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
            </CardContent>
          </Card>

          {/* Email Signature */}
          <Card className="bg-white rounded-2xl border-0 shadow-sm" data-tour="profile-signature">
            <CardHeader>
              <CardTitle className="text-slate-800">Assinatura</CardTitle>
              <CardDescription className="text-slate-500">
                Texto que aparece no rodapé do Portal do Paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                id="emailSignature"
                value={emailSignature}
                onChange={(e) => setEmailSignature(e.target.value)}
                placeholder="Ex: Atenciosamente, Dra. Maria Silva - Nutricionista Clínica"
                rows={3}
                className="rounded-xl border-slate-200 focus:border-emerald-300"
              />
              
              {emailSignature && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm font-medium text-slate-600 mb-2">Prévia</p>
                  <div className="text-sm text-slate-700 whitespace-pre-line border-t border-slate-200 pt-3">
                    {emailSignature}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </AppLayout>
  );
}
