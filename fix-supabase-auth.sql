-- Script para verificar e corrigir problemas de autenticação no Supabase

-- 1. Verificar se o schema auth existe
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'auth';

-- 2. Verificar se a tabela auth.users existe
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'auth' AND table_name = 'users';

-- 3. Listar usuários existentes no auth.users
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
LIMIT 10;

-- 4. Verificar se existe a tabela profiles ou nutritionists
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'nutritionists');

-- 5. Verificar as policies RLS (Row Level Security) em auth.users
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'auth' AND tablename = 'users';

-- 6. Verificar se RLS está habilitado nas tabelas
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname IN ('auth', 'public')
AND tablename IN ('users', 'profiles', 'nutritionists');
