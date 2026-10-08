-- ========================================
-- NUTRIFLOW - TESTES PÓS-CORREÇÃO
-- ========================================
-- Execute estas queries após aplicar a correção
-- para validar que tudo está funcionando
-- ========================================

-- TESTE 1: Verificar se a coluna activity_level existe
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT 'TESTE 1: Verificando coluna activity_level' AS teste;

SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'patients'
  AND column_name = 'activity_level';

-- Resultado esperado:
-- column_name    | data_type | column_default | is_nullable
-- activity_level | text      | 'moderado'     | YES


-- TESTE 2: Verificar estrutura completa da tabela patients
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT 'TESTE 2: Estrutura completa da tabela patients' AS teste;

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'patients'
ORDER BY ordinal_position;


-- TESTE 3: Listar pacientes existentes com activity_level
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT 'TESTE 3: Pacientes com nível de atividade' AS teste;

SELECT
  id,
  name,
  activity_level,
  created_at
FROM public.patients
ORDER BY created_at DESC
LIMIT 10;

-- Resultado esperado:
-- Pacientes existentes devem mostrar activity_level = 'moderado' (default)
-- Novos pacientes poderão ter valores diferentes


-- TESTE 4: Inserir paciente de teste (OPCIONAL - só se quiser testar)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
/*
-- DESCOMENTE PARA TESTAR INSERÇÃO:

INSERT INTO public.patients (
  nutritionist_id,
  name,
  email,
  activity_level
) VALUES (
  (SELECT id FROM public.profiles LIMIT 1),  -- Pegar primeiro nutricionista
  'Teste Activity Level',
  'teste@example.com',
  'intenso'
) RETURNING *;
*/


-- TESTE 5: Distribuição de níveis de atividade
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT 'TESTE 5: Distribuição dos níveis de atividade' AS teste;

SELECT
  activity_level,
  COUNT(*) as total_pacientes,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM public.patients
WHERE activity_level IS NOT NULL
GROUP BY activity_level
ORDER BY total_pacientes DESC;

-- Resultado esperado:
-- Mostrar quantos pacientes têm cada nível de atividade


-- TESTE 6: Verificar RLS (Row Level Security) funcionando
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT 'TESTE 6: Verificando políticas RLS' AS teste;

SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'patients'
ORDER BY policyname;

-- Resultado esperado:
-- Ver todas as políticas de segurança da tabela patients


-- TESTE 7: Verificar todas as tabelas essenciais
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SELECT 'TESTE 7: Status de todas as tabelas essenciais' AS teste;

SELECT
  schemaname,
  tablename,
  tableowner,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'profiles',
    'patients',
    'appointments',
    'custom_foods',
    'custom_recipes',
    'messages',
    'meal_plans',
    'anthropometrics',
    'weight_logs',
    'water_logs',
    'financial_records'
  )
ORDER BY tablename;

-- Resultado esperado:
-- Todas as 11 tabelas devem aparecer com rowsecurity = true


-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- RESUMO DOS TESTES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--
-- ✅ TESTE 1: Coluna existe e está configurada corretamente
-- ✅ TESTE 2: Estrutura da tabela está completa
-- ✅ TESTE 3: Dados podem ser lidos com a nova coluna
-- ✅ TESTE 4: (Opcional) Inserção funciona
-- ✅ TESTE 5: Distribuição dos valores é razoável
-- ✅ TESTE 6: RLS está ativo e configurado
-- ✅ TESTE 7: Todas as tabelas essenciais existem
--
-- Se todos os testes passarem, o banco está 100% funcional!
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
