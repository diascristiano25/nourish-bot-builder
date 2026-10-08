-- SCRIPT FINAL PARA CORRIGIR TODOS OS ERROS DE SCHEMA
-- Copie e cole isso no Supabase SQL Editor e execute

-- 1. Verificar se a coluna activity_level existe em patients
-- Se não existir, adicionar
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderado';

-- 2. Verificar se a tabela custom_recipes existe
-- Se não existir, criar
CREATE TABLE IF NOT EXISTS public.custom_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    ingredients JSONB DEFAULT '[]'::jsonb,
    instructions TEXT,
    nutrition_info JSONB DEFAULT '{}'::jsonb,
    category TEXT,
    prep_time_minutes INTEGER,
    servings INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Configurar RLS para custom_recipes
ALTER TABLE public.custom_recipes ENABLE ROW LEVEL SECURITY;

-- Policies para custom_recipes
DROP POLICY IF EXISTS "Users can view own recipes" ON public.custom_recipes;
CREATE POLICY "Users can view own recipes"
    ON public.custom_recipes FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

DROP POLICY IF EXISTS "Users can insert own recipes" ON public.custom_recipes;
CREATE POLICY "Users can insert own recipes"
    ON public.custom_recipes FOR INSERT
    WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

DROP POLICY IF EXISTS "Users can update own recipes" ON public.custom_recipes;
CREATE POLICY "Users can update own recipes"
    ON public.custom_recipes FOR UPDATE
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

DROP POLICY IF EXISTS "Users can delete own recipes" ON public.custom_recipes;
CREATE POLICY "Users can delete own recipes"
    ON public.custom_recipes FOR DELETE
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

-- 4. Criar índices
CREATE INDEX IF NOT EXISTS idx_custom_recipes_nutritionist_id ON public.custom_recipes(nutritionist_id);

-- 5. Crear trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_custom_recipes_updated_at ON public.custom_recipes;
CREATE TRIGGER update_custom_recipes_updated_at
    BEFORE UPDATE ON public.custom_recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Verificação final
SELECT COUNT(*) as total_patients, 
       COUNT(CASE WHEN activity_level IS NOT NULL THEN 1 END) as with_activity_level
FROM public.patients;
