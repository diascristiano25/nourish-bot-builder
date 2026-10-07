-- DIAGNÓSTICO COMPLETO DO SUPABASE AUTH

-- 1. Verificar se auth.users existe e está acessível
SELECT 'auth.users existe' as check_name,
       COUNT(*) as total,
       COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed
FROM auth.users;

-- 2. Verificar structure de auth.users
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. Verificar se profiles existe
SELECT 'profiles existe' as check_name, COUNT(*) as total
FROM public.profiles;

-- 4. Verificar structure de profiles
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Verificar triggers
SELECT
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' OR event_object_schema = 'auth';

-- 6. Verificar RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 7. Verificar usuário teste
SELECT
  id,
  email,
  encrypted_password IS NOT NULL as has_password,
  email_confirmed_at,
  created_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'teste@nutriflow.com';

-- 8. Verificar se profile do usuário existe
SELECT p.*
FROM public.profiles p
JOIN auth.users u ON u.id = p.id
WHERE u.email = 'teste@nutriflow.com';
