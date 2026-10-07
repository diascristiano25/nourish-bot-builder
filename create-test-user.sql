-- Criar usuário de teste manualmente
-- Execute no SQL Editor do Supabase

-- 1. Inserir usuário no auth.users
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
  recovery_token
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
  ''
)
RETURNING id, email;

-- Nota: Copie o ID que retornar e use no próximo passo
