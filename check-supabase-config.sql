-- VERIFICAR E CORRIGIR CONFIGURAÇÕES AUTH

-- 1. Verificar se há schemas faltando
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name IN ('auth', 'public', 'storage', 'extensions');

-- 2. Verificar extensões necessárias
SELECT extname, extversion
FROM pg_extension
WHERE extname IN ('pgcrypto', 'uuid-ossp', 'pgjwt');

-- 3. Instalar extensões faltantes
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 4. Verificar se auth.users tem a coluna instance_id
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'auth'
  AND table_name = 'users'
  AND column_name = 'instance_id';

-- 5. Se não tiver, precisamos verificar a versão do Supabase
SELECT current_setting('server_version') as postgres_version;

-- 6. Verificar permissões do schema public
SELECT
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND table_name = 'profiles';
