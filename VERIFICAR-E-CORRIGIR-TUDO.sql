-- ========================================
-- VERIFICAÇÃO E CORREÇÃO COMPLETA
-- ========================================
-- Execute este script para verificar e corrigir todos os problemas

-- PASSO 1: Verificar se a tabela profiles existe e tem as colunas corretas
SELECT
    'PROFILES TABLE' as check_type,
    COUNT(*) as total_columns
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles';

-- PASSO 2: Verificar colunas da tabela profiles
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- PASSO 3: Verificar se a função RPC existe
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'get_user_account_status';

-- PASSO 4: Criar/Recriar a função RPC (se não existir)
CREATE OR REPLACE FUNCTION public.get_user_account_status()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    CASE
      WHEN p.is_active = false THEN 'inactive'
      WHEN p.account_status = 'suspended' THEN 'suspended'
      ELSE 'active'
    END
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
$$;

-- PASSO 5: Verificar quantos usuários têm perfil
SELECT
    'USER PROFILES' as check_type,
    COUNT(*) as total_profiles
FROM public.profiles;

-- PASSO 6: Verificar se existem usuários sem perfil
SELECT
    'USERS WITHOUT PROFILE' as check_type,
    COUNT(*) as users_without_profile
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL;

-- PASSO 7: Criar perfis para usuários que não têm
INSERT INTO public.profiles (user_id, full_name, is_admin)
SELECT
    u.id,
    COALESCE(
        u.raw_user_meta_data->>'full_name',
        u.raw_user_meta_data->>'name',
        SPLIT_PART(u.email, '@', 1)
    ) as full_name,
    false as is_admin
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.id IS NULL
ON CONFLICT (user_id) DO NOTHING;

-- PASSO 8: Verificar resultado final
SELECT
    p.id,
    p.user_id,
    p.full_name,
    p.crn,
    p.phone,
    p.is_active,
    p.account_status,
    p.trial_ends_at,
    p.created_at,
    u.email,
    u.email_confirmed_at
FROM public.profiles p
JOIN auth.users u ON u.id = p.user_id
ORDER BY p.created_at DESC;
