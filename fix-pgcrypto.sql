-- Habilitar extensão pgcrypto (necessária para crypt e gen_salt)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Verificar se auth.users existe e tem dados
SELECT COUNT(*) as total_users FROM auth.users;

-- Verificar se profiles existe e tem a estrutura correta
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
