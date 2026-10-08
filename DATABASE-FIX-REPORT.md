# NutriFlow - Relatório de Correção do Banco de Dados

## 📊 Status Atual

**Data:** 2025-01-29
**Banco:** Supabase (nwenbxqmfpyspxpibgwp)

### ✅ Tabelas Existentes e Funcionais

Todas as tabelas críticas do sistema já existem:

1. ✅ **profiles** - Perfis de usuários
2. ✅ **patients** - Pacientes (REQUER CORREÇÃO)
3. ✅ **appointments** - Agendamentos
4. ✅ **custom_foods** - Alimentos personalizados
5. ✅ **custom_recipes** - Receitas personalizadas
6. ✅ **messages** - Mensagens
7. ✅ **meal_plans** - Planos alimentares
8. ✅ **anthropometrics** - Dados antropométricos
9. ✅ **weight_logs** - Registro de peso
10. ✅ **water_logs** - Registro de água
11. ✅ **financial_records** - Registros financeiros

---

## 🔧 Problema Identificado

### ❌ **Coluna Faltante: `activity_level` na tabela `patients`**

**Erro:** A coluna `activity_level` está sendo referenciada no código da aplicação mas não existe no banco de dados.

**Impacto:** 
- Formulários de cadastro/edição de pacientes podem falhar
- Cálculos nutricionais que dependem do nível de atividade não funcionam corretamente

---

## 🛠️ Solução Implementada

### Arquivo: `ADD-ACTIVITY-LEVEL-COLUMN.sql`

Este script SQL adiciona a coluna faltante com as seguintes características:

```sql
ALTER TABLE public.patients
ADD COLUMN activity_level TEXT DEFAULT 'moderado';
```

**Características:**
- **Tipo:** TEXT
- **Valor padrão:** 'moderado'
- **Nullable:** Sim
- **Valores esperados:** 
  - 'sedentário'
  - 'leve'
  - 'moderado'
  - 'intenso'
  - 'muito intenso'

---

## 📋 Instruções de Execução

### Opção 1: SQL Editor do Supabase (Recomendado)

1. **Acesse o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/sql/new
   ```

2. **Copie e cole o conteúdo do arquivo:**
   ```
   ADD-ACTIVITY-LEVEL-COLUMN.sql
   ```

3. **Clique em "Run" para executar**

4. **Verifique a execução:**
   - Deve aparecer a mensagem: ✅ Column activity_level added
   - Verifique a estrutura da tabela

5. **Valide a correção:**
   ```bash
   node execute-database-fix.mjs
   ```

### Opção 2: Arquivo Completo (Caso necessite recriar tudo)

Se por algum motivo precisar recriar todas as tabelas, use:

**Arquivo:** `FIX-ALL-DATABASE-ISSUES.sql`

Este arquivo contém:
- Criação de todas as tabelas do sistema
- Políticas RLS (Row Level Security)
- Índices para performance
- Triggers para updated_at

---

## ✅ Validação

Após executar o SQL, valide com o script:

```bash
node execute-database-fix.mjs
```

**Resultado esperado:**
```
🎉 SUCCESS! All required tables and columns are present!
✅ Database schema is complete and ready to use.
```

---

## 📝 Testes Recomendados

Após a correção, teste as seguintes funcionalidades:

### 1. Cadastro de Paciente
- [ ] Criar novo paciente
- [ ] Selecionar nível de atividade
- [ ] Salvar e verificar no banco

### 2. Edição de Paciente
- [ ] Abrir paciente existente
- [ ] Modificar nível de atividade
- [ ] Salvar alterações

### 3. Cálculos Nutricionais
- [ ] Verificar TMB (Taxa Metabólica Basal)
- [ ] Validar gasto energético total
- [ ] Confirmar recomendações calóricas

### 4. Query de Teste
Execute no SQL Editor para confirmar:

```sql
-- Ver todos os níveis de atividade dos pacientes
SELECT 
  id, 
  name, 
  activity_level,
  created_at
FROM public.patients
LIMIT 10;

-- Verificar distribuição dos níveis de atividade
SELECT 
  activity_level,
  COUNT(*) as total
FROM public.patients
WHERE activity_level IS NOT NULL
GROUP BY activity_level;
```

---

## 🔍 Detalhes Técnicos

### Schema da Tabela Patients (Após Correção)

```
| Column           | Type                     | Default         | Nullable |
|------------------|--------------------------|-----------------|----------|
| id               | uuid                     | gen_random_uuid()| NO       |
| nutritionist_id  | uuid                     | -               | NO       |
| user_id          | uuid                     | -               | YES      |
| name             | text                     | -               | NO       |
| email            | text                     | -               | YES      |
| phone            | text                     | -               | YES      |
| date_of_birth    | date                     | -               | YES      |
| gender           | text                     | -               | YES      |
| height           | numeric                  | -               | YES      |
| weight           | numeric                  | -               | YES      |
| activity_level   | text                     | 'moderado'      | YES      | ⬅️ NOVO
| medical_history  | text                     | -               | YES      |
| allergies        | text                     | -               | YES      |
| dietary_restrictions | text                 | -               | YES      |
| goals            | text                     | -               | YES      |
| notes            | text                     | -               | YES      |
| is_active        | boolean                  | true            | YES      |
| created_at       | timestamp with time zone | now()           | YES      |
| updated_at       | timestamp with time zone | now()           | YES      |
```

### Políticas RLS Aplicadas

A tabela `patients` já possui as seguintes políticas de segurança:

1. **Leitura:** Nutricionistas só veem seus próprios pacientes
2. **Inserção:** Nutricionistas só podem criar pacientes para si
3. **Atualização:** Nutricionistas só podem editar seus próprios pacientes
4. **Exclusão:** Nutricionistas só podem deletar seus próprios pacientes

---

## 📂 Arquivos Criados

1. **ADD-ACTIVITY-LEVEL-COLUMN.sql** ⭐
   - Script simples e direto para adicionar a coluna
   - Recomendado para uso imediato

2. **FIX-ALL-DATABASE-ISSUES.sql**
   - Script completo com todas as tabelas
   - Uso em caso de necessidade de recriar schema

3. **execute-database-fix.mjs**
   - Script Node.js para validação
   - Verifica estado atual do banco
   - Fornece relatório detalhado

4. **DATABASE-FIX-REPORT.md** (este arquivo)
   - Documentação completa da correção
   - Guia de execução e testes

---

## 🎯 Checklist de Conclusão

- [x] Identificado problema: coluna `activity_level` faltante
- [x] Script SQL criado: `ADD-ACTIVITY-LEVEL-COLUMN.sql`
- [x] Script de validação criado: `execute-database-fix.mjs`
- [ ] SQL executado no Supabase
- [ ] Validação executada com sucesso
- [ ] Testes funcionais realizados
- [ ] Aplicação funcionando normalmente

---

## 📞 Suporte

Em caso de dúvidas ou problemas:

1. Verifique os logs do Supabase SQL Editor
2. Execute o script de validação: `node execute-database-fix.mjs`
3. Consulte a documentação do Supabase
4. Verifique as políticas RLS se houver problemas de permissão

---

**Status:** ✅ Solução pronta para execução
**Prioridade:** 🔴 Alta - Bloqueia funcionalidades essenciais
**Tempo estimado:** ⏱️ 5 minutos
