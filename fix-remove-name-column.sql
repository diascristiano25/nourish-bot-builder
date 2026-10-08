-- CORREÇÃO: Remover coluna 'name' duplicada da tabela patients
-- Execute no Supabase SQL Editor

-- 1. Verificar se ambas as colunas existem
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patients'
AND column_name IN ('name', 'full_name');

-- 2. Remover constraint NOT NULL da coluna 'name' se existir
ALTER TABLE public.patients ALTER COLUMN name DROP NOT NULL;

-- 3. Copiar dados de 'name' para 'full_name' se houver algum
UPDATE public.patients
SET full_name = COALESCE(name, full_name, 'Sem nome')
WHERE full_name IS NULL OR full_name = '';

-- 4. Remover a coluna 'name'
ALTER TABLE public.patients DROP COLUMN IF EXISTS name;

-- 5. Verificação final
SELECT
    COUNT(*) as total_patients,
    COUNT(full_name) as with_full_name
FROM public.patients;

SELECT 'Coluna name removida com sucesso!' as status;
