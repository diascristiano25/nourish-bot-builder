import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, Save, Upload, User, Link2, Image } from 'lucide-react';

interface NutritionistProfile {
  id: string;
  full_name: string;
  crn: string | null;
  phone: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
}

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<NutritionistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [useLogoUrl, setUseLogoUrl] = useState(true); // true = URL, false = Upload
  
  const [fullName, setFullName] = useState('');
  const [crn, setCrn] = useState('');
  const [phone, setPhone] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#4a7c59');
  const [secondaryColor, setSecondaryColor] = useState('#2d5a3d');
  const [logoUrl, setLogoUrl] = useState('');

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
      setPrimaryColor(data.primary_color || '#4a7c59');
      setSecondaryColor(data.secondary_color || '#2d5a3d');
      setLogoUrl(data.logo_url || '');
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">Meu Perfil</h1>
              <p className="text-xs text-muted-foreground">Configure suas informações profissionais</p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Salvar
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl space-y-6">
        {/* Informações Pessoais */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações Pessoais
            </CardTitle>
            <CardDescription>
              Dados que aparecerão nos cardápios exportados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr(a). Nome Sobrenome"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crn">CRN (Registro Profissional)</Label>
                <Input
                  id="crn"
                  value={crn}
                  onChange={(e) => setCrn(e.target.value)}
                  placeholder="CRN-X 12345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Marca e Personalização
            </CardTitle>
            <CardDescription>
              Adicione sua logo para aparecer nos documentos e PDFs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle entre URL e Upload */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                <Link2 className={`w-4 h-4 ${useLogoUrl ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${useLogoUrl ? 'font-medium' : 'text-muted-foreground'}`}>
                  Inserir Link
                </span>
              </div>
              <Switch
                checked={!useLogoUrl}
                onCheckedChange={(checked) => setUseLogoUrl(!checked)}
              />
              <div className="flex items-center gap-3">
                <span className={`text-sm ${!useLogoUrl ? 'font-medium' : 'text-muted-foreground'}`}>
                  Upload de Arquivo
                </span>
                <Upload className={`w-4 h-4 ${!useLogoUrl ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
            </div>

            {/* Campo de URL ou Upload */}
            {useLogoUrl ? (
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL da Logo</Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://exemplo.com/minha-logo.png"
                />
                <p className="text-xs text-muted-foreground">
                  Cole a URL de uma imagem hospedada online (recomendado: PNG com fundo transparente)
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Upload de Logo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
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
                        // Convert to base64 for now (until storage is set up)
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
                      {uploadingLogo ? 'Carregando...' : 'Clique para selecionar ou arraste uma imagem'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou WEBP (máx. 2MB)
                    </p>
                  </label>
                </div>
              </div>
            )}
            
            {/* Prévia da Logo */}
            {logoUrl && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">Prévia:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogoUrl('')}
                    className="text-xs h-7"
                  >
                    Remover
                  </Button>
                </div>
                <div className="bg-white rounded p-4 flex justify-center">
                  <img 
                    src={logoUrl} 
                    alt="Logo preview" 
                    className="max-h-24 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cores do Tema */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Cores da Marca</CardTitle>
            <CardDescription>
              Personalize as cores dos documentos exportados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Cor Principal</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="primaryColor"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    placeholder="#4a7c59"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    id="secondaryColor"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    placeholder="#2d5a3d"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Prévia das cores */}
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-3">Prévia do Cabeçalho:</p>
              <div 
                className="p-4 rounded-lg text-white"
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
      </main>
    </div>
  );
}
