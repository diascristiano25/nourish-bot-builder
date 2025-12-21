-- Renomear tabela nutritionists para profiles
ALTER TABLE public.nutritionists RENAME TO profiles;

-- Adicionar coluna has_seen_onboarding
ALTER TABLE public.profiles 
ADD COLUMN has_seen_onboarding boolean NOT NULL DEFAULT false;

-- Atualizar funções que referenciam nutritionists

-- Atualizar is_current_user_master_admin
CREATE OR REPLACE FUNCTION public.is_current_user_master_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND is_master_admin = true
  )
$$;

-- Atualizar is_current_user_admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND is_admin = true
  )
$$;

-- Atualizar get_user_type
CREATE OR REPLACE FUNCTION public.get_user_type()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()) THEN 'nutritionist'
      WHEN EXISTS (SELECT 1 FROM public.patients WHERE user_id = auth.uid()) THEN 'patient'
      ELSE 'unknown'
    END
$$;

-- Atualizar get_user_account_status
CREATE OR REPLACE FUNCTION public.get_user_account_status()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    CASE 
      WHEN p.is_active = false THEN 'inactive'
      WHEN p.account_status = 'suspended' THEN 'suspended'
      ELSE 'active'
    END
  FROM public.profiles p 
  WHERE p.user_id = auth.uid()
$$;

-- ATUALIZAR RLS POLICIES DA TABELA PROFILES (antiga nutritionists)
-- Primeiro dropar as policies antigas
DROP POLICY IF EXISTS "Admins can update any nutritionist" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all nutritionists" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own nutritionist profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own nutritionist profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own nutritionist profile" ON public.profiles;

-- Recriar com novos nomes
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (is_current_user_admin() = true);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (is_current_user_admin() = true);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- ATUALIZAR RLS POLICIES DAS OUTRAS TABELAS QUE REFERENCIAM nutritionists

-- PATIENTS
DROP POLICY IF EXISTS "Nutritionists can create patients" ON public.patients;
DROP POLICY IF EXISTS "Nutritionists can delete their own patients" ON public.patients;
DROP POLICY IF EXISTS "Nutritionists can update their own patients" ON public.patients;
DROP POLICY IF EXISTS "Nutritionists can view their own patients" ON public.patients;

CREATE POLICY "Nutritionists can create patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can delete their own patients" 
ON public.patients 
FOR DELETE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can update their own patients" 
ON public.patients 
FOR UPDATE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can view their own patients" 
ON public.patients 
FOR SELECT 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- APPOINTMENTS
DROP POLICY IF EXISTS "Nutritionists can create appointments" ON public.appointments;
DROP POLICY IF EXISTS "Nutritionists can delete their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Nutritionists can update their appointments" ON public.appointments;
DROP POLICY IF EXISTS "Nutritionists can view their own appointments" ON public.appointments;

CREATE POLICY "Nutritionists can create appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can delete their appointments" 
ON public.appointments 
FOR DELETE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can update their appointments" 
ON public.appointments 
FOR UPDATE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can view their own appointments" 
ON public.appointments 
FOR SELECT 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- MEAL_PLANS
DROP POLICY IF EXISTS "Nutritionists can create meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Nutritionists can delete their meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Nutritionists can update their meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Nutritionists can view their meal plans" ON public.meal_plans;

CREATE POLICY "Nutritionists can create meal plans" 
ON public.meal_plans 
FOR INSERT 
WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can delete their meal plans" 
ON public.meal_plans 
FOR DELETE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can update their meal plans" 
ON public.meal_plans 
FOR UPDATE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can view their meal plans" 
ON public.meal_plans 
FOR SELECT 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- FINANCIAL_RECORDS
DROP POLICY IF EXISTS "Nutritionists can create their own financial records" ON public.financial_records;
DROP POLICY IF EXISTS "Nutritionists can delete their own financial records" ON public.financial_records;
DROP POLICY IF EXISTS "Nutritionists can update their own financial records" ON public.financial_records;
DROP POLICY IF EXISTS "Nutritionists can view their own financial records" ON public.financial_records;

CREATE POLICY "Nutritionists can create their own financial records" 
ON public.financial_records 
FOR INSERT 
WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can delete their own financial records" 
ON public.financial_records 
FOR DELETE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can update their own financial records" 
ON public.financial_records 
FOR UPDATE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can view their own financial records" 
ON public.financial_records 
FOR SELECT 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- CUSTOM_FOODS
DROP POLICY IF EXISTS "Nutritionists can create their own custom foods" ON public.custom_foods;
DROP POLICY IF EXISTS "Nutritionists can delete their own custom foods" ON public.custom_foods;
DROP POLICY IF EXISTS "Nutritionists can update their own custom foods" ON public.custom_foods;
DROP POLICY IF EXISTS "Nutritionists can view their own custom foods" ON public.custom_foods;

CREATE POLICY "Nutritionists can create their own custom foods" 
ON public.custom_foods 
FOR INSERT 
WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can delete their own custom foods" 
ON public.custom_foods 
FOR DELETE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can update their own custom foods" 
ON public.custom_foods 
FOR UPDATE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can view their own custom foods" 
ON public.custom_foods 
FOR SELECT 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- CUSTOM_RECIPES
DROP POLICY IF EXISTS "Nutritionists can create their own custom recipes" ON public.custom_recipes;
DROP POLICY IF EXISTS "Nutritionists can delete their own custom recipes" ON public.custom_recipes;
DROP POLICY IF EXISTS "Nutritionists can update their own custom recipes" ON public.custom_recipes;
DROP POLICY IF EXISTS "Nutritionists can view their own custom recipes" ON public.custom_recipes;

CREATE POLICY "Nutritionists can create their own custom recipes" 
ON public.custom_recipes 
FOR INSERT 
WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can delete their own custom recipes" 
ON public.custom_recipes 
FOR DELETE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can update their own custom recipes" 
ON public.custom_recipes 
FOR UPDATE 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can view their own custom recipes" 
ON public.custom_recipes 
FOR SELECT 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- SUPPORT_TICKETS
DROP POLICY IF EXISTS "Nutritionists can create their own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Nutritionists can view their own tickets" ON public.support_tickets;

CREATE POLICY "Nutritionists can create their own tickets" 
ON public.support_tickets 
FOR INSERT 
WITH CHECK (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Nutritionists can view their own tickets" 
ON public.support_tickets 
FOR SELECT 
USING (nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- SUPPORT_TICKET_MESSAGES
DROP POLICY IF EXISTS "Nutritionists can create messages on their tickets" ON public.support_ticket_messages;
DROP POLICY IF EXISTS "Nutritionists can view messages of their tickets" ON public.support_ticket_messages;

CREATE POLICY "Nutritionists can create messages on their tickets" 
ON public.support_ticket_messages 
FOR INSERT 
WITH CHECK (
  sender_type = 'nutritionist' 
  AND ticket_id IN (
    SELECT st.id 
    FROM support_tickets st 
    WHERE st.nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

CREATE POLICY "Nutritionists can view messages of their tickets" 
ON public.support_ticket_messages 
FOR SELECT 
USING (
  ticket_id IN (
    SELECT st.id 
    FROM support_tickets st 
    WHERE st.nutritionist_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
  )
);

-- ANTHROPOMETRICS - Atualizar policies
DROP POLICY IF EXISTS "Nutritionists can create anthropometrics for their patients" ON public.anthropometrics;
DROP POLICY IF EXISTS "Nutritionists can delete their patients anthropometrics" ON public.anthropometrics;
DROP POLICY IF EXISTS "Nutritionists can update their patients anthropometrics" ON public.anthropometrics;
DROP POLICY IF EXISTS "Nutritionists can view their patients anthropometrics" ON public.anthropometrics;

CREATE POLICY "Nutritionists can create anthropometrics for their patients" 
ON public.anthropometrics 
FOR INSERT 
WITH CHECK (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can delete their patients anthropometrics" 
ON public.anthropometrics 
FOR DELETE 
USING (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can update their patients anthropometrics" 
ON public.anthropometrics 
FOR UPDATE 
USING (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can view their patients anthropometrics" 
ON public.anthropometrics 
FOR SELECT 
USING (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

-- WATER_LOGS - Atualizar policies
DROP POLICY IF EXISTS "Nutritionists can create water logs for their patients" ON public.water_logs;
DROP POLICY IF EXISTS "Nutritionists can delete their patients water logs" ON public.water_logs;
DROP POLICY IF EXISTS "Nutritionists can update their patients water logs" ON public.water_logs;
DROP POLICY IF EXISTS "Nutritionists can view their patients water logs" ON public.water_logs;

CREATE POLICY "Nutritionists can create water logs for their patients" 
ON public.water_logs 
FOR INSERT 
WITH CHECK (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can delete their patients water logs" 
ON public.water_logs 
FOR DELETE 
USING (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can update their patients water logs" 
ON public.water_logs 
FOR UPDATE 
USING (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can view their patients water logs" 
ON public.water_logs 
FOR SELECT 
USING (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

-- WEIGHT_LOGS - Atualizar policies
DROP POLICY IF EXISTS "Nutritionists can create weight logs for their patients" ON public.weight_logs;
DROP POLICY IF EXISTS "Nutritionists can delete their patients weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Nutritionists can update their patients weight logs" ON public.weight_logs;
DROP POLICY IF EXISTS "Nutritionists can view their patients weight logs" ON public.weight_logs;

CREATE POLICY "Nutritionists can create weight logs for their patients" 
ON public.weight_logs 
FOR INSERT 
WITH CHECK (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can delete their patients weight logs" 
ON public.weight_logs 
FOR DELETE 
USING (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can update their patients weight logs" 
ON public.weight_logs 
FOR UPDATE 
USING (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));

CREATE POLICY "Nutritionists can view their patients weight logs" 
ON public.weight_logs 
FOR SELECT 
USING (patient_id IN (
  SELECT p.id 
  FROM patients p 
  JOIN profiles pr ON p.nutritionist_id = pr.id 
  WHERE pr.user_id = auth.uid()
));