-- ============================================
-- FORÇAR REFRESH DO SCHEMA CACHE DO SUPABASE
-- Execute DEPOIS do diagnóstico completo
-- ============================================

-- 1. Verificar e recriar tabela se necessário (safe)
DO $$
BEGIN
    -- Se a tabela não existir, criar
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'anthropometrics'
    ) THEN
        CREATE TABLE public.anthropometrics (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
            weight_kg DECIMAL(5,2),
            height_cm DECIMAL(5,2),
            waist_cm DECIMAL(5,2),
            hip_cm DECIMAL(5,2),
            body_fat_percentage DECIMAL(4,1),
            measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            notes TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela anthropometrics criada';
    ELSE
        RAISE NOTICE 'Tabela anthropometrics já existe';
    END IF;
END $$;

-- 2. Garantir que RLS está habilitado
ALTER TABLE public.anthropometrics ENABLE ROW LEVEL SECURITY;

-- 3. Dropar políticas antigas e recriar (evita conflitos)
DROP POLICY IF EXISTS "Nutritionists can view their patients anthropometrics" ON public.anthropometrics;
DROP POLICY IF EXISTS "Nutritionists can create anthropometrics for their patients" ON public.anthropometrics;
DROP POLICY IF EXISTS "Nutritionists can update their patients anthropometrics" ON public.anthropometrics;
DROP POLICY IF EXISTS "Nutritionists can delete their patients anthropometrics" ON public.anthropometrics;
DROP POLICY IF EXISTS "Patients can view their own anthropometrics" ON public.anthropometrics;

-- 4. Criar políticas RLS corrigidas
CREATE POLICY "Nutritionists can view their patients anthropometrics"
ON public.anthropometrics FOR SELECT
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p
    INNER JOIN public.profiles pr ON p.nutritionist_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

CREATE POLICY "Nutritionists can create anthropometrics for their patients"
ON public.anthropometrics FOR INSERT
WITH CHECK (
  patient_id IN (
    SELECT p.id FROM public.patients p
    INNER JOIN public.profiles pr ON p.nutritionist_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

CREATE POLICY "Nutritionists can update their patients anthropometrics"
ON public.anthropometrics FOR UPDATE
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p
    INNER JOIN public.profiles pr ON p.nutritionist_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

CREATE POLICY "Nutritionists can delete their patients anthropometrics"
ON public.anthropometrics FOR DELETE
USING (
  patient_id IN (
    SELECT p.id FROM public.patients p
    INNER JOIN public.profiles pr ON p.nutritionist_id = pr.id
    WHERE pr.user_id = auth.uid()
  )
);

-- Política para pacientes verem suas próprias medidas
CREATE POLICY "Patients can view their own anthropometrics"
ON public.anthropometrics FOR SELECT
USING (
  patient_id IN (
    SELECT id FROM public.patients WHERE user_id = auth.uid()
  )
);

-- 5. Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_anthropometrics_patient_id
ON public.anthropometrics(patient_id);

CREATE INDEX IF NOT EXISTS idx_anthropometrics_measured_at
ON public.anthropometrics(measured_at DESC);

-- 6. FORÇAR REFRESH DO CACHE (importante!)
NOTIFY pgrst, 'reload schema';

-- 7. Verificação final
SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'anthropometrics';

SELECT
    policyname,
    cmd as command
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'anthropometrics'
ORDER BY policyname;

SELECT '✅ Schema cache refreshed! Aguarde 5 segundos e recarregue a aplicação.' as status;
