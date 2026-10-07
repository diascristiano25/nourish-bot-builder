-- PASSO 1: Habilitar extensão pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- PASSO 2: Criar usuário de teste
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'teste@nutriflow.com',
  crypt('Teste123!', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Usuário Teste"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
)
RETURNING id, email;

-- PASSO 3: Criar profile correspondente (use o ID que retornar acima)
-- Substitua 'COLE_O_ID_AQUI' pelo UUID que retornar
INSERT INTO profiles (id, email, full_name, subscription_plan, subscription_status)
VALUES (
  'COLE_O_ID_AQUI',
  'teste@nutriflow.com',
  'Usuário Teste',
  'free',
  'active'
);
