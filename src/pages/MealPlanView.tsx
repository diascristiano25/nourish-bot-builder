import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { GlassCard } from '@/components/ui/GlassCard';
import { NeonText } from '@/components/ui/NeonText';
import MealPlanDocument from '@/components/MealPlanDocument';
import MealPlanEditor from '@/components/MealPlanEditor';
import { 
  ArrowLeft, 
  Loader2, 
  Coffee, 
  Sun, 
  Cookie, 
  Moon,
  UtensilsCrossed,
  Download,
  Share2,
  Calendar,
  Settings,
  Pencil,
  Apple,
  Soup
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MealItem {
  food: string;
  portion: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface Meal {
  name: string;
  time?: string;
  items: MealItem[];
  totalCalories?: number;
}

interface MealPlanData {
  meals: Meal[];
  totalCalories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
  };
  notes?: string;
}

interface MealPlan {
  id: string;
  title: string;
  description: string | null;
  total_calories: number | null;
  plan_data: MealPlanData;
  is_active: boolean;
  created_at: string;
  patient_id: string;
}

interface Patient {
  full_name: string;
}

interface NutritionistProfile {
  full_name: string;
  crn: string | null;
  phone: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
}

const mealIcons: Record<string, React.ReactNode> = {
  'Café da Manhã': <Coffee className="w-5 h-5" />,
  'Lanche da Manhã': <Apple className="w-5 h-5" />,
  'Almoço': <Sun className="w-5 h-5" />,
  'Lanche da Tarde': <Cookie className="w-5 h-5" />,
  'Jantar': <Moon className="w-5 h-5" />,
  'Ceia': <Soup className="w-5 h-5" />,
};

export default function MealPlanView() {
  const { id, planId } = useParams<{ id: string; planId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const documentRef = useRef<HTMLDivElement>(null);
  
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [nutritionist, setNutritionist] = useState<NutritionistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && planId) {
      fetchData();
    }
  }, [user, planId]);

  const fetchData = async () => {
    try {
      const { data: planData, error: planError } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('id', planId)
        .single();

      if (planError) throw planError;
      
      const transformedPlan: MealPlan = {
        ...planData,
        plan_data: planData.plan_data as unknown as MealPlanData,
      };
      setMealPlan(transformedPlan);

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('full_name')
        .eq('id', planData.patient_id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      const { data: nutritionistData, error: nutritionistError } = await supabase
        .from('profiles')
        .select('full_name, crn, phone, logo_url, primary_color, secondary_color')
        .eq('user_id', user!.id)
        .single();

      if (nutritionistError) throw nutritionistError;
      setNutritionist(nutritionistData);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar cardápio",
        description: error.message,
        variant: "destructive",
      });
      navigate(`/patients/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!documentRef.current || !mealPlan || !patient || !nutritionist) {
      toast({
        title: "Erro ao gerar PDF",
        description: "Dados incompletos. Configure seu perfil primeiro.",
        variant: "destructive",
      });
      return;
    }

    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(documentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `cardapio_${patient.full_name.replace(/\s+/g, '_')}_${format(new Date(), 'dd-MM-yyyy')}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF gerado com sucesso",
        description: `Arquivo "${fileName}" baixado.`,
      });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast({
        title: "Erro ao gerar PDF",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!mealPlan || !patient || !id) return;

    setSharing(true);
    try {
      const portalUrl = `https://nutriflow.inf.br/paciente/${id}`;
      const shareText = `Seu Plano Alimentar por ${nutritionist?.full_name || 'seu nutricionista'}: ${portalUrl}`;
      
      if (navigator.share && navigator.canShare && navigator.canShare({ text: shareText, url: portalUrl })) {
        try {
          await navigator.share({
            title: `Plano Alimentar - ${patient.full_name}`,
            text: `Olá ${patient.full_name.split(' ')[0]}! Acesse seu plano alimentar:`,
            url: portalUrl,
          });
          return;
        } catch (shareError: any) {
          if (shareError.name === 'AbortError') {
            return;
          }
        }
      }
      
      await navigator.clipboard.writeText(portalUrl);
      toast({
        title: "Link copiado!",
        description: "Link do portal do paciente copiado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    } finally {
      setSharing(false);
    }
  };

  const handleSaveEdit = async (updatedData: MealPlanData) => {
    if (!mealPlan) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('meal_plans')
        .update({
          plan_data: updatedData as any,
          total_calories: updatedData.totalCalories,
          updated_at: new Date().toISOString(),
        })
        .eq('id', mealPlan.id);

      if (error) throw error;

      setMealPlan({
        ...mealPlan,
        plan_data: updatedData,
        total_calories: updatedData.totalCalories || null,
      });
      setIsEditing(false);
      
      toast({
        title: "Cardápio salvo",
        description: "As alterações foram salvas.",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (!mealPlan || !patient) {
    return null;
  }

  const planData = mealPlan.plan_data;
  const hasNutritionistProfile = nutritionist && nutritionist.full_name;

  return (
    <div className="min-h-screen bg-background">
      {/* Cyber Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/patients/${id}`)}
              className="hover:bg-primary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <NeonText as="h1" color="primary" className="font-bold">
                {mealPlan.title}
              </NeonText>
              <p className="text-xs text-muted-foreground">{patient.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={isEditing ? "secondary" : "outline"}
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              className="border-border/50 hover:border-primary/50"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleShare}
              disabled={sharing || isEditing}
              className="border-border/50 hover:border-primary/50"
            >
              {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleDownloadPDF}
              disabled={downloading || !hasNutritionistProfile || isEditing}
              className="border-border/50 hover:border-primary/50"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="px-4 lg:px-6 py-6 max-w-3xl mx-auto space-y-6">
        {/* Profile Warning */}
        {!hasNutritionistProfile && (
          <GlassCard className="p-4 border-warning/30 bg-warning/5">
            <div className="flex items-center gap-4">
              <Settings className="w-6 h-6 text-warning" />
              <div className="flex-1">
                <p className="font-medium text-warning">Configure seu perfil</p>
                <p className="text-sm text-muted-foreground">
                  Adicione nome, CRN e logo para exportar documentos.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/profile')} 
                variant="outline"
                className="border-warning/30 text-warning hover:bg-warning/10"
              >
                Configurar
              </Button>
            </div>
          </GlassCard>
        )}

        {isEditing ? (
          <MealPlanEditor 
            planData={planData} 
            onSave={handleSaveEdit} 
            onCancel={() => setIsEditing(false)}
            saving={saving}
          />
        ) : (
          <>
            {/* Summary Card */}
            <GlassCard className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(mealPlan.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </span>
                  </div>
                  {mealPlan.is_active && (
                    <Badge className="bg-success/20 text-success border-success/30">
                      Cardápio Ativo
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-primary glow-primary">
                    {mealPlan.total_calories || planData.totalCalories || '-'}
                  </p>
                  <p className="text-sm text-muted-foreground">kcal/dia</p>
                </div>
              </div>

              {planData.macros && (
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/30">
                  <div className="text-center">
                    <p className="text-xl font-bold text-info">{planData.macros.protein}g</p>
                    <p className="text-xs text-muted-foreground">Proteínas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-warning">{planData.macros.carbs}g</p>
                    <p className="text-xs text-muted-foreground">Carboidratos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-success">{planData.macros.fat}g</p>
                    <p className="text-xs text-muted-foreground">Gorduras</p>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* Meals */}
            <div className="space-y-4">
              {planData.meals?.map((meal, index) => (
                <GlassCard key={index} className="overflow-hidden">
                  <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                          {mealIcons[meal.name] || <UtensilsCrossed className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{meal.name}</h3>
                          {meal.time && (
                            <p className="text-sm text-muted-foreground">{meal.time}</p>
                          )}
                        </div>
                      </div>
                      {meal.totalCalories && (
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                          {meal.totalCalories} kcal
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {meal.items?.map((item, itemIndex) => (
                        <div 
                          key={itemIndex} 
                          className="flex items-center justify-between py-3 border-b border-border/30 last:border-0"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{item.food}</p>
                            <p className="text-sm text-muted-foreground">{item.portion}</p>
                          </div>
                          {item.calories && (
                            <div className="text-right">
                              <p className="font-semibold text-primary">{item.calories} kcal</p>
                              {(item.protein || item.carbs || item.fat) && (
                                <p className="text-xs text-muted-foreground">
                                  P:{item.protein || 0}g • C:{item.carbs || 0}g • G:{item.fat || 0}g
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>

            {/* Notes */}
            {planData.notes && (
              <GlassCard className="p-6">
                <NeonText as="h3" color="primary" className="font-semibold mb-3">
                  Observações
                </NeonText>
                <p className="text-muted-foreground whitespace-pre-wrap">{planData.notes}</p>
              </GlassCard>
            )}
          </>
        )}
      </main>

      {/* Hidden PDF Document - Elite Magazine Layout */}
      <div className="absolute left-[-9999px] top-0">
        <MealPlanDocument
          ref={documentRef}
          mealPlan={{
            title: mealPlan.title,
            description: mealPlan.description,
            total_calories: mealPlan.total_calories,
            plan_data: planData,
            created_at: mealPlan.created_at,
          }}
          patientName={patient?.full_name || ''}
          nutritionist={{
            full_name: nutritionist?.full_name || '',
            crn: nutritionist?.crn || null,
            phone: nutritionist?.phone || null,
            logo_url: nutritionist?.logo_url || null,
            primary_color: nutritionist?.primary_color || null,
            secondary_color: nutritionist?.secondary_color || null,
          }}
        />
      </div>
    </div>
  );
}
