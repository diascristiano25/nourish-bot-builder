-- ============================================
-- CORREÇÃO: Verificar e corrigir coluna total_calories na tabela meal_plans
-- Execute no Supabase SQL Editor
-- ============================================

-- 1. Verificar se a coluna total_calories existe
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'meal_plans'
            AND column_name = 'total_calories'
        ) THEN '✅ Coluna total_calories EXISTE'
        ELSE '❌ Coluna total_calories NÃO EXISTE'
    END as status_coluna;

-- 2. Adicionar coluna se não existir
ALTER TABLE public.meal_plans
ADD COLUMN IF NOT EXISTS total_calories INTEGER;

-- 3. Verificar estrutura completa da tabela meal_plans
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'meal_plans'
ORDER BY ordinal_position;

-- 4. FORÇAR REFRESH DO SCHEMA CACHE
NOTIFY pgrst, 'reload schema';

-- 5. Teste de acesso à coluna
SELECT
    COUNT(*) as total_meal_plans,
    COUNT(total_calories) as with_total_calories
FROM public.meal_plans;

SELECT '✅ Coluna total_calories verificada/criada com sucesso!' as resultado;
SELECT '⏳ Aguarde 10 segundos e recarregue a aplicação (Ctrl+Shift+R)' as proximos_passos;
