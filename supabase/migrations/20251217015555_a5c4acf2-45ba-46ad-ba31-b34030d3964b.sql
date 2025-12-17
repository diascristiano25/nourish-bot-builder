-- Create weight_logs table
CREATE TABLE public.weight_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  weight DECIMAL(5,2) NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, recorded_at)
);

-- Create water_logs table
CREATE TABLE public.water_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  quantity_ml INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  goal_ml INTEGER NOT NULL DEFAULT 2000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(patient_id, date)
);

-- Enable RLS
ALTER TABLE public.weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

-- RLS for weight_logs: Nutritionists can manage their patients' logs
CREATE POLICY "Nutritionists can view their patients weight logs"
ON public.weight_logs FOR SELECT
USING (patient_id IN (
  SELECT p.id FROM patients p
  JOIN nutritionists n ON p.nutritionist_id = n.id
  WHERE n.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can create weight logs for their patients"
ON public.weight_logs FOR INSERT
WITH CHECK (patient_id IN (
  SELECT p.id FROM patients p
  JOIN nutritionists n ON p.nutritionist_id = n.id
  WHERE n.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can update their patients weight logs"
ON public.weight_logs FOR UPDATE
USING (patient_id IN (
  SELECT p.id FROM patients p
  JOIN nutritionists n ON p.nutritionist_id = n.id
  WHERE n.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can delete their patients weight logs"
ON public.weight_logs FOR DELETE
USING (patient_id IN (
  SELECT p.id FROM patients p
  JOIN nutritionists n ON p.nutritionist_id = n.id
  WHERE n.user_id = auth.uid()
));

-- RLS for weight_logs: Patients can manage their own logs
CREATE POLICY "Patients can view their own weight logs"
ON public.weight_logs FOR SELECT
USING (patient_id IN (
  SELECT id FROM patients WHERE user_id = auth.uid()
));

CREATE POLICY "Patients can create their own weight logs"
ON public.weight_logs FOR INSERT
WITH CHECK (patient_id IN (
  SELECT id FROM patients WHERE user_id = auth.uid()
));

CREATE POLICY "Patients can update their own weight logs"
ON public.weight_logs FOR UPDATE
USING (patient_id IN (
  SELECT id FROM patients WHERE user_id = auth.uid()
));

-- RLS for water_logs: Nutritionists can manage their patients' logs
CREATE POLICY "Nutritionists can view their patients water logs"
ON public.water_logs FOR SELECT
USING (patient_id IN (
  SELECT p.id FROM patients p
  JOIN nutritionists n ON p.nutritionist_id = n.id
  WHERE n.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can create water logs for their patients"
ON public.water_logs FOR INSERT
WITH CHECK (patient_id IN (
  SELECT p.id FROM patients p
  JOIN nutritionists n ON p.nutritionist_id = n.id
  WHERE n.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can update their patients water logs"
ON public.water_logs FOR UPDATE
USING (patient_id IN (
  SELECT p.id FROM patients p
  JOIN nutritionists n ON p.nutritionist_id = n.id
  WHERE n.user_id = auth.uid()
));

-- RLS for water_logs: Patients can manage their own logs
CREATE POLICY "Patients can view their own water logs"
ON public.water_logs FOR SELECT
USING (patient_id IN (
  SELECT id FROM patients WHERE user_id = auth.uid()
));

CREATE POLICY "Patients can create their own water logs"
ON public.water_logs FOR INSERT
WITH CHECK (patient_id IN (
  SELECT id FROM patients WHERE user_id = auth.uid()
));

CREATE POLICY "Patients can update their own water logs"
ON public.water_logs FOR UPDATE
USING (patient_id IN (
  SELECT id FROM patients WHERE user_id = auth.uid()
));