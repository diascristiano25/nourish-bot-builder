-- ========================================
-- NUTRIFLOW - CORREÇÃO RÁPIDA
-- ========================================
-- Execute este SQL no Supabase SQL Editor
-- URL: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/sql/new
-- ========================================

-- Adicionar coluna activity_level na tabela patients
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderado';

-- Verificar se foi adicionado
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'patients'
  AND column_name = 'activity_level';
