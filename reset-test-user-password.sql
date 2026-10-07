-- Resetar senha do usuário teste@nutriflow.com
UPDATE auth.users
SET
  encrypted_password = crypt('Teste123!', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE email = 'teste@nutriflow.com';

-- Verificar se profile existe, se não, criar
INSERT INTO profiles (id, email, full_name, subscription_plan, subscription_status)
SELECT
  id,
  email,
  'Usuário Teste',
  'free',
  'active'
FROM auth.users
WHERE email = 'teste@nutriflow.com'
ON CONFLICT (id) DO UPDATE SET
  full_name = 'Usuário Teste',
  subscription_plan = 'free',
  subscription_status = 'active';

-- Mostrar resultado
SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'teste@nutriflow.com';
