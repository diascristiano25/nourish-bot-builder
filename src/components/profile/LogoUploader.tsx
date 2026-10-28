import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, X } from 'lucide-react';

export interface LogoUploaderProps {
  currentLogoUrl?: string;
  onUploadComplete: (url: string) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const STORAGE_BUCKET = 'nutritionist-logos';

export function LogoUploader({ currentLogoUrl, onUploadComplete }: LogoUploaderProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato não suportado. Use PNG, JPG ou SVG.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande';
    }
    return null;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      toast({
        title: 'Erro de validação',
        description: error,
        variant: 'destructive',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setValidationError(null);

    // Show preview immediately
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      if (urlData?.publicUrl) {
        onUploadComplete(urlData.publicUrl);
        toast({
          title: 'Logo carregada com sucesso!',
          description: 'Clique em Salvar para confirmar.',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar logo',
        description: error.message,
        variant: 'destructive',
      });
      // Revert preview on error
      setPreviewUrl(currentLogoUrl || null);
    } finally {
      setUploading(false);
      // Clean up object URL
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onUploadComplete('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium text-foreground">Logo do Nutricionista</Label>

      <div className="flex items-start gap-4">
        {/* Preview */}
        {previewUrl && (
          <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-border shrink-0 bg-secondary">
            <img
              src={previewUrl}
              alt="Preview da logo"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
              aria-label="Remover logo"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Validation Error */}
        {validationError && (
          <p className="text-sm text-red-500 mt-2">{validationError}</p>
        )}

        {/* Upload Area */}
        <div className="flex-1">
          <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:border-[#518C5B]/50 transition-colors cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              id="logo-upload"
              accept=".png,.jpg,.jpeg,.svg"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <label htmlFor="logo-upload" className="cursor-pointer block">
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 mx-auto text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground mt-2">Carregando...</p>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique para selecionar uma logo
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG ou SVG (máx. 2MB)
                  </p>
                </>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}