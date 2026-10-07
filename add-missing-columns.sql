-- Adicionar coluna CRN que está faltando na tabela nutritionists

ALTER TABLE public.nutritionists
ADD COLUMN IF NOT EXISTS crn TEXT;

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'nutritionists'
ORDER BY ordinal_position;
