import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
  Edit,
  Calendar,
  Settings,
  ShoppingCart,
  Pencil
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MealPlanDocument from '@/components/MealPlanDocument';
import MealPlanEditor from '@/components/MealPlanEditor';

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
  'Lanche da Manhã': <Cookie className="w-5 h-5" />,
  'Almoço': <Sun className="w-5 h-5" />,
  'Lanche da Tarde': <Cookie className="w-5 h-5" />,
  'Jantar': <Moon className="w-5 h-5" />,
  'Ceia': <UtensilsCrossed className="w-5 h-5" />,
};

const mealColors: Record<string, string> = {
  'Café da Manhã': 'bg-warning/10 text-warning',
  'Lanche da Manhã': 'bg-info/10 text-info',
  'Almoço': 'bg-success/10 text-success',
  'Lanche da Tarde': 'bg-info/10 text-info',
  'Jantar': 'bg-primary/10 text-primary',
  'Ceia': 'bg-muted text-muted-foreground',
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
      // Fetch meal plan
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

      // Fetch patient
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('full_name')
        .eq('id', planData.patient_id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch nutritionist profile
      const { data: nutritionistData, error: nutritionistError } = await supabase
        .from('nutritionists')
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
    if (!mealPlan || !patient) return;

    setSharing(true);
    try {
      const shareText = `Cardápio: ${mealPlan.title}\nPaciente: ${patient.full_name}\n\nGerado por NutriFlow`;
      
      // Try Web Share API first, but only if supported and likely to work
      if (navigator.share && navigator.canShare && navigator.canShare({ text: shareText })) {
        try {
          await navigator.share({
            title: mealPlan.title,
            text: shareText,
          });
          return; // Success, exit early
        } catch (shareError: any) {
          // If user cancelled, don't show error
          if (shareError.name === 'AbortError') {
            return;
          }
          // Fall through to clipboard fallback
        }
      }
      
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText);
      toast({
        title: "Copiado!",
        description: "Informações copiadas para a área de transferência.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar. Tente novamente.",
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
        description: "As alterações foram salvas com sucesso.",
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
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${id}`)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-bold text-lg">{mealPlan.title}</h1>
              <p className="text-xs text-muted-foreground">{patient.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={isEditing ? "secondary" : "outline"}
              size="icon"
              onClick={() => setIsEditing(!isEditing)}
              title="Editar cardápio"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleShare}
              disabled={sharing || isEditing}
            >
              {sharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={handleDownloadPDF}
              disabled={downloading || !hasNutritionistProfile || isEditing}
              title={!hasNutritionistProfile ? "Configure seu perfil primeiro" : "Baixar PDF"}
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-3xl space-y-6">
        {/* Aviso de perfil incompleto */}
        {!hasNutritionistProfile && (
          <Card className="border-warning bg-warning/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Settings className="w-8 h-8 text-warning" />
                <div className="flex-1">
                  <p className="font-medium">Configure seu perfil</p>
                  <p className="text-sm text-muted-foreground">
                    Adicione seu nome, CRN e logo para que apareçam nos documentos exportados.
                  </p>
                </div>
                <Button onClick={() => navigate('/profile')} variant="outline">
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Mode */}
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
        <Card className="border-0 shadow-md gradient-card">
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(mealPlan.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>
                {mealPlan.is_active && (
                  <Badge variant="default">Cardápio Ativo</Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">
                  {mealPlan.total_calories || planData.totalCalories || '-'}
                </p>
                <p className="text-sm text-muted-foreground">kcal/dia</p>
              </div>
            </div>

            {planData.macros && (
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-xl font-semibold text-info">{planData.macros.protein}g</p>
                  <p className="text-xs text-muted-foreground">Proteínas</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-warning">{planData.macros.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carboidratos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-semibold text-success">{planData.macros.fat}g</p>
                  <p className="text-xs text-muted-foreground">Gorduras</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meals */}
        <div className="space-y-4">
          {planData.meals?.map((meal, index) => (
            <Card key={index} className="border-0 shadow-md overflow-hidden">
              <CardHeader className={`${mealColors[meal.name] || 'bg-muted'} py-4`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center">
                      {mealIcons[meal.name] || <UtensilsCrossed className="w-5 h-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{meal.name}</CardTitle>
                      {meal.time && (
                        <CardDescription className="text-current/70">{meal.time}</CardDescription>
                      )}
                    </div>
                  </div>
                  {meal.totalCalories && (
                    <Badge variant="secondary" className="bg-background/50">
                      {meal.totalCalories} kcal
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {meal.items?.map((item, itemIndex) => (
                    <div 
                      key={itemIndex} 
                      className="flex items-center justify-between py-2 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium">{item.food}</p>
                        <p className="text-sm text-muted-foreground">{item.portion}</p>
                      </div>
                      {item.calories && (
                        <div className="text-right">
                          <p className="font-semibold">{item.calories} kcal</p>
                          {(item.protein || item.carbs || item.fat) && (
                            <p className="text-xs text-muted-foreground">
                              {item.protein && `P:${item.protein}g `}
                              {item.carbs && `C:${item.carbs}g `}
                              {item.fat && `G:${item.fat}g`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Notes */}
        {planData.notes && (
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{planData.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4">
          <Button 
            variant="default"
            className="w-full"
            onClick={() => navigate(`/patients/${id}/meal-plan/${planId}/grocery-list`)}
          >
            <ShoppingCart className="mr-2 w-4 h-4" />
            Gerar Lista de Compras
          </Button>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate(`/patients/${id}`)}
            >
              Voltar ao Paciente
            </Button>
            <Button 
              variant="secondary"
              className="flex-1"
              onClick={() => navigate(`/patients/${id}/meal-plan/generate`)}
            >
              <Edit className="mr-2 w-4 h-4" />
              Gerar Novo
            </Button>
          </div>
        </div>
          </>
        )}
      </main>

      {/* Hidden document for PDF generation */}
      {nutritionist && (
        <div className="fixed left-[-9999px] top-0">
          <MealPlanDocument
            ref={documentRef}
            mealPlan={mealPlan}
            patientName={patient.full_name}
            nutritionist={nutritionist}
          />
        </div>
      )}
    </div>
  );
}
