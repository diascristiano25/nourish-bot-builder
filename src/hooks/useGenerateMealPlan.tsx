import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  generateMealPlan,
  validateMealPlan,
  type MealPlanRequest,
  type MealPlan,
} from "@/services/gemini";
import { useToast } from "@/components/ui/use-toast";

export function useGenerateMealPlan() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (request: MealPlanRequest) => {
      const plan = await generateMealPlan(request);

      // Validate the generated meal plan
      const isValid = await validateMealPlan(plan);
      if (!isValid) {
        throw new Error("Generated meal plan failed validation");
      }

      return plan;
    },
    onSuccess: (plan) => {
      setMealPlan(plan);
      toast({
        title: "✅ Plano alimentar gerado com sucesso!",
        description: "Seu cardápio personalizado está pronto para edição.",
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Erro ao gerar plano";
      toast({
        title: "❌ Erro ao gerar plano",
        description: message,
        variant: "destructive",
      });
    },
  });

  return {
    mealPlan,
    setMealPlan,
    generateMealPlan: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
