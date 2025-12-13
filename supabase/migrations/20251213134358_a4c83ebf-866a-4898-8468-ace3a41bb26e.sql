-- Create enum for patient goals
CREATE TYPE public.patient_goal AS ENUM ('hypertrophy', 'weight_loss', 'maintenance', 'health', 'performance');

-- Create enum for activity levels
CREATE TYPE public.activity_level AS ENUM ('sedentary', 'light', 'moderate', 'active', 'very_active');

-- Create nutritionists profile table
CREATE TABLE public.nutritionists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  crn TEXT,
  phone TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#4a7c59',
  secondary_color TEXT DEFAULT '#2d5a3d',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nutritionist_id UUID REFERENCES public.nutritionists(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  gender TEXT,
  goal patient_goal DEFAULT 'health',
  activity_level activity_level DEFAULT 'moderate',
  allergies TEXT[],
  dietary_restrictions TEXT[],
  medical_conditions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anthropometrics table for tracking measurements
CREATE TABLE public.anthropometrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,1),
  waist_cm DECIMAL(5,2),
  hip_cm DECIMAL(5,2),
  measured_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meal plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE NOT NULL,
  nutritionist_id UUID REFERENCES public.nutritionists(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  total_calories INTEGER,
  plan_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  valid_from DATE,
  valid_until DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.nutritionists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anthropometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for nutritionists
CREATE POLICY "Users can view their own nutritionist profile" 
ON public.nutritionists FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own nutritionist profile" 
ON public.nutritionists FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own nutritionist profile" 
ON public.nutritionists FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for patients
CREATE POLICY "Nutritionists can view their own patients" 
ON public.patients FOR SELECT 
USING (nutritionist_id IN (SELECT id FROM public.nutritionists WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can create patients" 
ON public.patients FOR INSERT 
WITH CHECK (nutritionist_id IN (SELECT id FROM public.nutritionists WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can update their own patients" 
ON public.patients FOR UPDATE 
USING (nutritionist_id IN (SELECT id FROM public.nutritionists WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can delete their own patients" 
ON public.patients FOR DELETE 
USING (nutritionist_id IN (SELECT id FROM public.nutritionists WHERE user_id = auth.uid()));

-- RLS Policies for anthropometrics
CREATE POLICY "Nutritionists can view their patients anthropometrics" 
ON public.anthropometrics FOR SELECT 
USING (patient_id IN (
  SELECT p.id FROM public.patients p 
  JOIN public.nutritionists n ON p.nutritionist_id = n.id 
  WHERE n.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can create anthropometrics for their patients" 
ON public.anthropometrics FOR INSERT 
WITH CHECK (patient_id IN (
  SELECT p.id FROM public.patients p 
  JOIN public.nutritionists n ON p.nutritionist_id = n.id 
  WHERE n.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can update their patients anthropometrics" 
ON public.anthropometrics FOR UPDATE 
USING (patient_id IN (
  SELECT p.id FROM public.patients p 
  JOIN public.nutritionists n ON p.nutritionist_id = n.id 
  WHERE n.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can delete their patients anthropometrics" 
ON public.anthropometrics FOR DELETE 
USING (patient_id IN (
  SELECT p.id FROM public.patients p 
  JOIN public.nutritionists n ON p.nutritionist_id = n.id 
  WHERE n.user_id = auth.uid()
));

-- RLS Policies for meal_plans
CREATE POLICY "Nutritionists can view their meal plans" 
ON public.meal_plans FOR SELECT 
USING (nutritionist_id IN (SELECT id FROM public.nutritionists WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can create meal plans" 
ON public.meal_plans FOR INSERT 
WITH CHECK (nutritionist_id IN (SELECT id FROM public.nutritionists WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can update their meal plans" 
ON public.meal_plans FOR UPDATE 
USING (nutritionist_id IN (SELECT id FROM public.nutritionists WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can delete their meal plans" 
ON public.meal_plans FOR DELETE 
USING (nutritionist_id IN (SELECT id FROM public.nutritionists WHERE user_id = auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_nutritionists_updated_at
BEFORE UPDATE ON public.nutritionists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
BEFORE UPDATE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at
BEFORE UPDATE ON public.meal_plans
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();