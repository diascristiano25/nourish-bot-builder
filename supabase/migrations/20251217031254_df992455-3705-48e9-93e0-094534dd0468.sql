-- Create custom_foods table for nutritionist's personalized foods
CREATE TABLE public.custom_foods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id UUID NOT NULL REFERENCES public.nutritionists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  unit_type TEXT NOT NULL DEFAULT 'g',
  kcal NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  carb NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom_recipes table for nutritionist's recipes
CREATE TABLE public.custom_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id UUID NOT NULL REFERENCES public.nutritionists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  estimated_macros JSONB DEFAULT '{"kcal": 0, "protein": 0, "carb": 0, "fat": 0}'::jsonb,
  ingredients JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_recipes ENABLE ROW LEVEL SECURITY;

-- RLS policies for custom_foods
CREATE POLICY "Nutritionists can view their own custom foods"
ON public.custom_foods FOR SELECT
USING (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can create their own custom foods"
ON public.custom_foods FOR INSERT
WITH CHECK (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can update their own custom foods"
ON public.custom_foods FOR UPDATE
USING (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can delete their own custom foods"
ON public.custom_foods FOR DELETE
USING (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

-- RLS policies for custom_recipes
CREATE POLICY "Nutritionists can view their own custom recipes"
ON public.custom_recipes FOR SELECT
USING (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can create their own custom recipes"
ON public.custom_recipes FOR INSERT
WITH CHECK (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can update their own custom recipes"
ON public.custom_recipes FOR UPDATE
USING (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

CREATE POLICY "Nutritionists can delete their own custom recipes"
ON public.custom_recipes FOR DELETE
USING (nutritionist_id IN (
  SELECT id FROM public.nutritionists WHERE user_id = auth.uid()
));

-- Triggers for updated_at
CREATE TRIGGER update_custom_foods_updated_at
BEFORE UPDATE ON public.custom_foods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_recipes_updated_at
BEFORE UPDATE ON public.custom_recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();