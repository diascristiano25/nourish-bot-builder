-- CORREÇÕES CRÍTICAS DO BANCO DE DADOS
-- Execute no Supabase SQL Editor

-- 1. Adicionar coluna activity_level na tabela patients
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderado';

-- 2. Criar tabela custom_recipes
CREATE TABLE IF NOT EXISTS public.custom_recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nutritionist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    ingredients JSONB,
    instructions TEXT,
    nutrition_info JSONB,
    category TEXT,
    prep_time_minutes INTEGER,
    servings INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_custom_recipes_nutritionist_id ON public.custom_recipes(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_custom_recipes_category ON public.custom_recipes(category);

-- 4. Configurar RLS para custom_recipes
ALTER TABLE public.custom_recipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Nutricionistas podem ver próprias receitas" ON public.custom_recipes;
CREATE POLICY "Nutricionistas podem ver próprias receitas"
    ON public.custom_recipes FOR SELECT
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

DROP POLICY IF EXISTS "Nutricionistas podem inserir receitas" ON public.custom_recipes;
CREATE POLICY "Nutricionistas podem inserir receitas"
    ON public.custom_recipes FOR INSERT
    WITH CHECK (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

DROP POLICY IF EXISTS "Nutricionistas podem atualizar receitas" ON public.custom_recipes;
CREATE POLICY "Nutricionistas podem atualizar receitas"
    ON public.custom_recipes FOR UPDATE
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

DROP POLICY IF EXISTS "Nutricionistas podem deletar receitas" ON public.custom_recipes;
CREATE POLICY "Nutricionistas podem deletar receitas"
    ON public.custom_recipes FOR DELETE
    USING (auth.uid() = (SELECT user_id FROM profiles WHERE id = nutritionist_id));

-- 5. Adicionar trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
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

-- 6. Validar estrutura final
SELECT
    'Verificação final' as status,
    COUNT(*) as total_tables
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('patients', 'custom_recipes', 'profiles');

-- 7. Listar colunas de patients
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'patients'
ORDER BY ordinal_position;
