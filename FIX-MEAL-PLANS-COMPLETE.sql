-- ============================================
-- CORREÇÃO COMPLETA: Schema cache e colunas faltantes
-- Execute TODO este SQL de uma vez no Supabase SQL Editor
-- ============================================

-- 1. Garantir que tabela meal_plans existe
CREATE TABLE IF NOT EXISTS public.meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    total_calories INTEGER,
    plan_data JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_active BOOLEAN DEFAULT true,
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Adicionar coluna total_calories se não existir
ALTER TABLE public.meal_plans
ADD COLUMN IF NOT EXISTS total_calories INTEGER;

-- 3. Habilitar RLS se ainda não estiver
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- 4. Criar/recriar políticas RLS
DROP POLICY IF EXISTS "Nutritionists can view their patients meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Nutritionists can create meal plans for their patients" ON public.meal_plans;
DROP POLICY IF EXISTS "Nutritionists can update their patients meal plans" ON public.meal_plans;
DROP POLICY IF EXISTS "Nutritionists can delete their patients meal plans" ON public.meal_plans;

CREATE POLICY "Nutritionists can view their patients meal plans"
ON public.meal_plans FOR SELECT
USING (
  nutritionist_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Nutritionists can create meal plans for their patients"
ON public.meal_plans FOR INSERT
WITH CHECK (
  nutritionist_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Nutritionists can update their patients meal plans"
ON public.meal_plans FOR UPDATE
USING (
  nutritionist_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Nutritionists can delete their patients meal plans"
ON public.meal_plans FOR DELETE
USING (
  nutritionist_id IN (
    SELECT id FROM public.profiles WHERE user_id = auth.uid()
  )
);

-- 5. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_patient_id ON public.meal_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_nutritionist_id ON public.meal_plans(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_is_active ON public.meal_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_meal_plans_created_at ON public.meal_plans(created_at DESC);

-- 6. FORÇAR REFRESH DO SCHEMA CACHE (IMPORTANTE!)
NOTIFY pgrst, 'reload schema';

-- 7. Verificação final
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'meal_plans'
ORDER BY ordinal_position;

SELECT
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'meal_plans';

SELECT '✅ CORREÇÃO COMPLETA!' as status;
SELECT '⏳ Aguarde 10 segundos e recarregue a aplicação (Ctrl+Shift+R)' as acao;
