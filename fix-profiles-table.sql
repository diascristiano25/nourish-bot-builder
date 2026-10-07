-- CORREÇÃO COMPLETA: Adicionar colunas faltantes na tabela profiles

-- 1. Adicionar coluna CRN (Conselho Regional de Nutrição)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS crn TEXT;

-- 2. Adicionar outras colunas que podem estar faltando
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#10B981',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#059669',
ADD COLUMN IF NOT EXISTS email_signature TEXT;

-- 3. Verificar estrutura final da tabela
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Verificar dados dos perfis existentes
SELECT
    id,
    user_id,
    full_name,
    crn,
    phone,
    created_at
FROM public.profiles
ORDER BY created_at DESC
LIMIT 10;
