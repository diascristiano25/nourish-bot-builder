import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Upload, Mail } from 'lucide-react';
import { LogoUploader } from '@/components/profile/LogoUploader';

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

interface ProfileFormProps {
  profile: NutritionistProfile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [crn, setCrn] = useState(profile?.crn || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url || '');
  const [emailSignature, setEmailSignature] = useState(profile?.email_signature || '');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Buscar o email real do usuário autenticado
  useEffect(() => {
    const fetchEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    fetchEmail();
  }, []);

  // Sincronizar com props quando o profile mudar
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setCrn(profile.crn || '');
      setPhone(profile.phone || '');
      setLogoUrl(profile.logo_url || '');
      setEmailSignature(profile.email_signature || '');
    }
  }, [profile]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingPhoto(true);
    try {
      // Upload para o Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        setLogoUrl(urlData.publicUrl);
        toast({
          title: 'Logo carregada!',
          description: 'Clique em Salvar para confirmar.',
        });
      }
    } catch (error: any) {
      // Fallback: converter para base64 se o storage falhar
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target?.result as string;
          setLogoUrl(base64);
          toast({
            title: 'Logo carregada (local)',
            description: 'Clique em Salvar para confirmar.',
          });
        };
        reader.readAsDataURL(file);
      } catch {
        toast({
          title: 'Erro ao carregar',
          description: error.message,
          variant: 'destructive'
        });
      }
    } finally {
      setUploadingPhoto(false);
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
          logo_url: logoUrl || null,
          email_signature: emailSignature.trim() || null,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: "Perfil atualizado!",
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <motion.form
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={(e) => e.preventDefault()}
    >
      {/* Nome Completo */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
          Nome Completo
        </Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Dr(a). Nome Sobrenome"
          className="rounded-xl border-border focus:border-[#518C5B] focus:ring-[#518C5B]/20"
        />
      </motion.div>

      {/* Email (somente leitura) */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="email"
            value={userEmail || 'Carregando...'}
            disabled
            className="rounded-xl bg-secondary pl-10 text-muted-foreground"
          />
        </div>
        <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
      </motion.div>

      {/* CRN */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="crn" className="text-sm font-medium text-foreground">
          CRN (Conselho Regional de Nutrição)
        </Label>
        <Input
          id="crn"
          value={crn}
          onChange={(e) => setCrn(e.target.value)}
          placeholder="Ex: 12345"
          className="rounded-xl border-border focus:border-[#518C5B] focus:ring-[#518C5B]/20"
        />
      </motion.div>

      {/* Telefone */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="phone" className="text-sm font-medium text-foreground">
          Telefone
        </Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 99999-9999"
          className="rounded-xl border-border focus:border-[#518C5B] focus:ring-[#518C5B]/20"
        />
      </motion.div>

      {/* Logo Upload */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <LogoUploader
          currentLogoUrl={logoUrl || undefined}
          onUploadComplete={(url) => setLogoUrl(url)}
        />
      </motion.div>

      {/* Assinatura de Email */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="emailSignature" className="text-sm font-medium text-foreground">
          Assinatura de Email
        </Label>
        <Input
          id="emailSignature"
          value={emailSignature}
          onChange={(e) => setEmailSignature(e.target.value)}
          placeholder="Ex: Atenciosamente, Dra. Maria - CRN 12345"
          className="rounded-xl border-border focus:border-[#518C5B] focus:ring-[#518C5B]/20"
        />
        <p className="text-xs text-muted-foreground">Usada em emails enviados aos pacientes.</p>
      </motion.div>

      {/* Botão Salvar */}
      <motion.div className="pt-4" variants={itemVariants}>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl gap-2 bg-gradient-to-r from-[#518C5B] to-[#3d7047] hover:opacity-90 text-white"
          size="lg"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Perfil
            </>
          )}
        </Button>
      </motion.div>
    </motion.form>
  );
}