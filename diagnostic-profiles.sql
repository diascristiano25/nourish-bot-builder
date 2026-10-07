-- DIAGNÓSTICO COMPLETO: Verificar estrutura da tabela profiles

-- 1. Ver TODAS as colunas da tabela profiles
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Ver se a tabela profiles existe
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'profiles';

-- 3. Ver dados da tabela (se existir)
SELECT * FROM public.profiles LIMIT 5;
