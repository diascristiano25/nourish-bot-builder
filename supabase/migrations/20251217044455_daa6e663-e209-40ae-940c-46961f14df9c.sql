-- Add missing RLS policies for patients

-- 1. Patients can delete their own weight logs
CREATE POLICY "Patients can delete their own weight logs"
ON public.weight_logs
FOR DELETE
USING (patient_id IN (
  SELECT id FROM public.patients WHERE user_id = auth.uid()
));

-- 2. Patients can delete their own water logs
CREATE POLICY "Patients can delete their own water logs"
ON public.water_logs
FOR DELETE
USING (patient_id IN (
  SELECT id FROM public.patients WHERE user_id = auth.uid()
));

-- 3. Nutritionists can delete their patients water logs
CREATE POLICY "Nutritionists can delete their patients water logs"
ON public.water_logs
FOR DELETE
USING (patient_id IN (
  SELECT p.id FROM public.patients p
  JOIN public.nutritionists n ON p.nutritionist_id = n.id
  WHERE n.user_id = auth.uid()
));

-- 4. Patients can view their own appointments
CREATE POLICY "Patients can view their own appointments"
ON public.appointments
FOR SELECT
USING (patient_id IN (
  SELECT id FROM public.patients WHERE user_id = auth.uid()
));