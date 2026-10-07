-- Criar usuário de teste completo (executa tudo de uma vez)

-- 1. Habilitar extensão
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Criar usuário e profile em uma transação
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Inserir usuário
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
  RETURNING id INTO new_user_id;

  -- Inserir profile automaticamente
  INSERT INTO profiles (id, email, full_name, subscription_plan, subscription_status)
  VALUES (
    new_user_id,
    'teste@nutriflow.com',
    'Usuário Teste',
    'free',
    'active'
  );

  RAISE NOTICE 'Usuário criado com sucesso! ID: %', new_user_id;
END $$;
