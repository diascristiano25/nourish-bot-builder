import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save } from 'lucide-react';
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/motion-variants';

interface NutritionistProfile {
  id: string;
  full_name: string;
  crn: string | null;
  phone: string | null;
  bio: string | null;
  specialties: string[] | null;
  photo_url: string | null;
}

interface ProfileFormProps {
  profile: NutritionistProfile | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.id || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [specialties, setSpecialties] = useState(profile?.specialties || []);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(profile?.photo_url || '');

  const availableSpecialties = [
    'Emagrecimento',
    'Ganho de Massa',
    'Nutrição Esportiva',
    'Nutrição Clínica',
    'Nutrição Preventiva',
    'Gestacional',
    'Pediatria',
  ];

  const toggleSpecialty = (specialty: string) => {
    setSpecialties(prev =>
      prev.includes(specialty)
        ? prev.filter(s => s !== specialty)
        : [...prev, specialty]
    );
  };

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
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setPhotoUrl(base64);
        toast({
          title: 'Foto carregada!',
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
          phone: phone.trim() || null,
          bio: bio.trim() || null,
          specialties: specialties,
          photo_url: photoUrl || null,
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
    >
      {/* Name */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="fullName" className="text-sm font-medium">
          Nome Completo
        </Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Dr(a). Nome Sobrenome"
          className="rounded-xl"
        />
      </motion.div>

      {/* Email (disabled) */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          value={email}
          disabled
          className="rounded-xl bg-muted"
        />
      </motion.div>

      {/* Phone */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="phone" className="text-sm font-medium">
          Telefone
        </Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="(11) 99999-9999"
          className="rounded-xl"
        />
      </motion.div>

      {/* Bio */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label htmlFor="bio" className="text-sm font-medium">
          Biografia
        </Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Conte um pouco sobre você e sua experiência..."
          rows={4}
          className="rounded-xl"
        />
      </motion.div>

      {/* Specialties */}
      <motion.div className="space-y-3" variants={itemVariants}>
        <Label className="text-sm font-medium">Especialidades</Label>
        <div className="grid grid-cols-2 gap-2">
          {availableSpecialties.map(specialty => (
            <button
              key={specialty}
              type="button"
              onClick={() => toggleSpecialty(specialty)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                specialties.includes(specialty)
                  ? 'bg-primary text-white'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Photo Upload */}
      <motion.div className="space-y-2" variants={itemVariants}>
        <Label className="text-sm font-medium">Foto de Perfil</Label>
        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer">
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
            disabled={uploadingPhoto}
          />
          <label htmlFor="photo-upload" className="cursor-pointer block">
            {uploadingPhoto ? (
              <Loader2 className="w-8 h-8 mx-auto text-muted-foreground animate-spin" />
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Clique para selecionar uma foto
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG (máx. 2MB)
                </p>
              </>
            )}
          </label>
        </div>
        {photoUrl && (
          <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
            <p className="text-sm text-foreground">Foto carregada</p>
            <button
              type="button"
              onClick={() => setPhotoUrl('')}
              className="text-xs text-destructive hover:underline"
            >
              Remover
            </button>
          </div>
        )}
      </motion.div>

      {/* Submit Button */}
      <motion.div className="pt-4" variants={itemVariants}>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl gap-2"
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
