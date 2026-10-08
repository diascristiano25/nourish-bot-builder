-- ============================================
-- SCRIPT DE VERIFICAÇÃO DO BANCO SUPABASE
-- Execute no Supabase SQL Editor para diagnosticar estado atual
-- ============================================

-- 1. VERIFICAR ESTRUTURA DA TABELA PATIENTS
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'patients'
ORDER BY ordinal_position;

-- 2. VERIFICAR SE COLUNA 'name' AINDA EXISTE (PROBLEMA ANTERIOR)
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'patients'
            AND column_name = 'name'
        ) THEN '❌ PROBLEMA: Coluna "name" ainda existe!'
        ELSE '✅ OK: Apenas "full_name" existe'
    END as status_coluna_name;

-- 3. VERIFICAR ENUM activity_level
SELECT
    e.enumlabel as valor_enum
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'activity_level'
ORDER BY e.enumsortorder;

-- 4. VERIFICAR SE TABELA custom_recipes EXISTE
SELECT
    CASE
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'custom_recipes'
        ) THEN '✅ OK: Tabela custom_recipes existe'
        ELSE '❌ PROBLEMA: Tabela custom_recipes não existe'
    END as status_custom_recipes;

-- 5. CONTAR PACIENTES E VERIFICAR DADOS
SELECT
    COUNT(*) as total_pacientes,
    COUNT(full_name) as com_full_name,
    COUNT(CASE WHEN full_name IS NULL OR full_name = '' THEN 1 END) as sem_nome,
    COUNT(activity_level) as com_activity_level,
    COUNT(CASE WHEN activity_level IS NULL THEN 1 END) as sem_activity_level
FROM public.patients;

-- 6. AMOSTRAR 3 PACIENTES (verificar dados reais)
SELECT
    id,
    full_name,
    email,
    activity_level,
    goal,
    created_at
FROM public.patients
ORDER BY created_at DESC
LIMIT 3;

-- 7. VERIFICAR RLS (Row Level Security) nas tabelas principais
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('patients', 'custom_recipes', 'meal_plans', 'profiles')
ORDER BY tablename;

-- 8. RESUMO FINAL
SELECT
    '✅ VERIFICAÇÃO COMPLETA' as status,
    NOW() as executado_em;
