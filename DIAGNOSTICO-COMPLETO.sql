-- ============================================
-- DIAGNÓSTICO COMPLETO DO BANCO SUPABASE
-- Execute este SQL no Supabase SQL Editor e me envie o resultado
-- ============================================

-- 1. VERIFICAR SE TABELA ANTHROPOMETRICS EXISTE
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'anthropometrics'
        ) THEN '✅ Tabela anthropometrics EXISTE'
        ELSE '❌ Tabela anthropometrics NÃO EXISTE'
    END as status_tabela;

-- 2. VERIFICAR COLUNAS DA TABELA ANTHROPOMETRICS
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'anthropometrics'
ORDER BY ordinal_position;

-- 3. VERIFICAR RLS (Row Level Security)
SELECT
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'anthropometrics';

-- 4. VERIFICAR POLÍTICAS RLS EXISTENTES
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'anthropometrics'
ORDER BY policyname;

-- 5. VERIFICAR TABELA PATIENTS (deve existir)
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'patients'
            AND column_name = 'full_name'
        ) THEN '✅ patients.full_name EXISTE'
        ELSE '❌ patients.full_name NÃO EXISTE'
    END as status_patients;

-- 6. CONTAR REGISTROS
SELECT
    'patients' as tabela,
    COUNT(*) as total
FROM public.patients
UNION ALL
SELECT
    'anthropometrics' as tabela,
    COUNT(*) as total
FROM public.anthropometrics
UNION ALL
SELECT
    'profiles' as tabela,
    COUNT(*) as total
FROM public.profiles;

-- 7. VERIFICAR FOREIGN KEYS
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'anthropometrics';

-- 8. TESTE DE ACESSO (se retornar erro, RLS está bloqueando)
SELECT COUNT(*) as test_access
FROM public.anthropometrics
LIMIT 1;

SELECT '✅ Diagnóstico completo executado!' as resultado;
