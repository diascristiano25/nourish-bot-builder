# 🔧 NutriFlow - Correção do Banco de Dados Supabase

## 📊 Status Atual

```
✅ TABELAS: 11/11 existem e estão funcionando
❌ PROBLEMA: Coluna 'activity_level' faltando na tabela 'patients'
🔴 PRIORIDADE: ALTA
⏱️  TEMPO: 2 minutos para corrigir
```

---

## 🎯 Problema Identificado

### ❌ Coluna `activity_level` faltando na tabela `patients`

**Impacto:**
- Cadastro de novos pacientes falha
- Edição de pacientes existentes falha  
- Cálculos nutricionais não funcionam corretamente
- Sistema bloqueado para uso em produção

---

## ⚡ Solução Rápida (2 minutos)

### 1️⃣ Abra o Supabase SQL Editor

```
https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/sql/new
```

### 2️⃣ Execute este SQL

```sql
ALTER TABLE public.patients
ADD COLUMN IF NOT EXISTS activity_level TEXT DEFAULT 'moderado';
```

### 3️⃣ Valide a correção

```bash
node FINAL-DATABASE-STATUS.mjs
```

**Resultado esperado:**
```
🎉 BANCO DE DADOS 100% OPERACIONAL!
```

---

## 📁 Arquivos Disponíveis

| Arquivo | Descrição | Quando Usar |
|---------|-----------|-------------|
| **QUICK-FIX.sql** ⭐ | Comando SQL mínimo | Correção rápida (USE ESTE!) |
| **ADD-ACTIVITY-LEVEL-COLUMN.sql** | SQL completo com validação | Correção detalhada |
| **FIX-ALL-DATABASE-ISSUES.sql** | Recriar todas as tabelas | Problemas múltiplos |
| **FINAL-DATABASE-STATUS.mjs** | Validador automático | Verificar status |
| **POST-FIX-TESTS.sql** | Suite de testes | Validar correção |
| **RELATORIO-CORRECAO-BANCO.txt** | Relatório completo | Documentação |

---

## 🔍 Validação Passo a Passo

### Antes da Correção

```bash
node FINAL-DATABASE-STATUS.mjs
```

Resultado:
```
🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS:
   1. Coluna activity_level FALTANDO na tabela patients
```

### Depois da Correção

```bash
node FINAL-DATABASE-STATUS.mjs
```

Resultado esperado:
```
🎉 BANCO DE DADOS 100% OPERACIONAL!
✅ Todas as tabelas estão presentes e acessíveis
✅ Todas as colunas necessárias existem
✅ Sistema pronto para uso
```

---

## 🧪 Testes Funcionais

Após aplicar a correção, teste estas funcionalidades:

### ✅ Teste 1: Cadastro de Paciente
1. Acesse a aplicação
2. Vá para "Pacientes" → "Novo Paciente"
3. Preencha os dados
4. Selecione o nível de atividade
5. Salve e confirme que foi criado

### ✅ Teste 2: Edição de Paciente
1. Abra um paciente existente
2. Modifique o nível de atividade
3. Salve as alterações
4. Confirme que foi atualizado

### ✅ Teste 3: Validação no Banco
Execute no SQL Editor:
```sql
SELECT id, name, activity_level, created_at
FROM public.patients
LIMIT 5;
```

---

## 📋 Detalhes Técnicos

### Coluna: `activity_level`

```
Tipo:           TEXT
Default:        'moderado'
Nullable:       Sim
```

### Valores Válidos

| Valor | Descrição | Uso |
|-------|-----------|-----|
| `sedentário` | Pouca ou nenhuma atividade | TMB × 1.2 |
| `leve` | Exercício 1-3 dias/semana | TMB × 1.375 |
| `moderado` | Exercício 3-5 dias/semana | TMB × 1.55 (padrão) |
| `intenso` | Exercício 6-7 dias/semana | TMB × 1.725 |
| `muito intenso` | Atletas, treino 2x/dia | TMB × 1.9 |

### Uso no Sistema

- **TMB (Taxa Metabólica Basal)**: Cálculo do metabolismo base
- **GET (Gasto Energético Total)**: TMB × fator de atividade
- **Recomendações Calóricas**: Ajuste baseado no objetivo + atividade
- **Macronutrientes**: Distribuição baseada na atividade física

---

## 🔄 Comandos Úteis

### Verificar Status do Banco
```bash
node FINAL-DATABASE-STATUS.mjs
```

### Executar Correção Completa
Arquivo: `ADD-ACTIVITY-LEVEL-COLUMN.sql`
```sql
-- Copie e cole no Supabase SQL Editor
```

### Executar Testes Pós-Correção
Arquivo: `POST-FIX-TESTS.sql`
```sql
-- 7 testes de validação completos
```

---

## 🚨 Troubleshooting

### Problema: "Column already exists"
**Solução:** A coluna já foi adicionada. Execute a validação.
```bash
node FINAL-DATABASE-STATUS.mjs
```

### Problema: "Permission denied"
**Solução:** Você precisa estar autenticado no Supabase com permissões de admin.

### Problema: Aplicação ainda com erro
**Soluções:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Faça logout e login novamente
3. Aguarde 30 segundos para o schema cache atualizar
4. Recarregue a página (F5)

### Problema: Validação ainda mostra erro
**Solução:** Aguarde 1 minuto e tente novamente. O Supabase precisa atualizar o schema cache.

---

## 📊 Status das Tabelas

### ✅ Tabelas Existentes e Funcionais

```
✅ profiles             - Perfis de usuários
✅ patients             - Pacientes
✅ appointments         - Agendamentos
✅ custom_foods         - Alimentos personalizados
✅ custom_recipes       - Receitas personalizadas
✅ messages             - Mensagens
✅ meal_plans           - Planos alimentares
✅ anthropometrics      - Dados antropométricos
✅ weight_logs          - Registro de peso
✅ water_logs           - Registro de água
✅ financial_records    - Registros financeiros
```

### 🔧 Correções Aplicadas

- [x] Identificado problema crítico
- [x] Scripts SQL criados
- [x] Validadores implementados
- [x] Documentação completa
- [ ] **SQL executado (VOCÊ ESTÁ AQUI)**
- [ ] Validação confirmada
- [ ] Testes aprovados
- [ ] Sistema em produção

---

## 🎯 Checklist de Conclusão

```
□ 1. Executar QUICK-FIX.sql no Supabase SQL Editor
□ 2. Validar com: node FINAL-DATABASE-STATUS.mjs
□ 3. Testar cadastro de paciente na aplicação
□ 4. Testar edição de paciente existente
□ 5. Validar cálculos nutricionais
□ 6. Confirmar que tudo funciona normalmente
```

---

## 🆘 Suporte

### Links Úteis
- **Supabase Dashboard**: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp
- **SQL Editor**: https://supabase.com/dashboard/project/nwenbxqmfpyspxpibgwp/sql/new
- **Documentação Supabase**: https://supabase.com/docs

### Comandos de Diagnóstico

```bash
# Status completo do banco
node FINAL-DATABASE-STATUS.mjs

# Validação estendida (após correção)
# Execute POST-FIX-TESTS.sql no Supabase SQL Editor
```

---

## ✅ Resumo Final

```
PROBLEMA:   Coluna activity_level faltando
SOLUÇÃO:    Execute QUICK-FIX.sql
VALIDAÇÃO:  node FINAL-DATABASE-STATUS.mjs
TEMPO:      2 minutos
IMPACTO:    100% das funcionalidades de pacientes
```

**🚀 Execute agora e volte o sistema para produção!**

---

*Documentação gerada em: 29/01/2025*
*Projeto: NutriFlow SaaS*
*Banco: Supabase (nwenbxqmfpyspxpibgwp)*
