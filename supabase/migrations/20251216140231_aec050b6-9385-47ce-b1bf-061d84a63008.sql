-- Add user_id column to patients table for patient portal auth
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_patients_user_id ON public.patients(user_id);

-- Allow patients to view their own data
CREATE POLICY "Patients can view their own data" 
ON public.patients 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow patients to view their own meal plans
CREATE POLICY "Patients can view their own meal plans" 
ON public.meal_plans 
FOR SELECT 
USING (patient_id IN (
  SELECT id FROM public.patients WHERE user_id = auth.uid()
));

-- Create function to check if user is a patient
CREATE OR REPLACE FUNCTION public.is_user_patient()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.patients
    WHERE user_id = auth.uid()
  )
$$;

-- Create function to get user type (nutritionist or patient)
CREATE OR REPLACE FUNCTION public.get_user_type()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM public.nutritionists WHERE user_id = auth.uid()) THEN 'nutritionist'
      WHEN EXISTS (SELECT 1 FROM public.patients WHERE user_id = auth.uid()) THEN 'patient'
      ELSE 'unknown'
    END
$$;