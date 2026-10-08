-- ============================================
-- CORREÇÃO: Criar tabela anthropometrics se não existir
-- Execute no Supabase SQL Editor
-- ============================================

-- Criar tabela anthropometrics se não existir
CREATE TABLE IF NOT EXISTS public.anthropometrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2),
    height_cm DECIMAL(5,2),
    waist_cm DECIMAL(5,2),
    hip_cm DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_anthropometrics_patient_id
ON public.anthropometrics(patient_id);

CREATE INDEX IF NOT EXISTS idx_anthropometrics_measured_at
ON public.anthropometrics(measured_at DESC);

-- Habilitar Row Level Security
ALTER TABLE public.anthropometrics ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Nutricionistas podem ver/gerenciar medidas dos seus pacientes
CREATE POLICY IF NOT EXISTS "Nutritionists can view their patients anthropometrics"
ON public.anthropometrics FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE nutritionist_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY IF NOT EXISTS "Nutritionists can insert their patients anthropometrics"
ON public.anthropometrics FOR INSERT
WITH CHECK (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE nutritionist_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY IF NOT EXISTS "Nutritionists can update their patients anthropometrics"
ON public.anthropometrics FOR UPDATE
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE nutritionist_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY IF NOT EXISTS "Nutritionists can delete their patients anthropometrics"
ON public.anthropometrics FOR DELETE
USING (
  patient_id IN (
    SELECT id FROM public.patients
    WHERE nutritionist_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  )
);

-- Política adicional: Pacientes podem ver suas próprias medidas
CREATE POLICY IF NOT EXISTS "Patients can view their own anthropometrics"
ON public.anthropometrics FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- Verificação
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'anthropometrics';

SELECT COUNT(*) as total_policies
FROM pg_policies
WHERE tablename = 'anthropometrics';

SELECT '✅ Tabela anthropometrics criada/verificada com sucesso!' as status;
