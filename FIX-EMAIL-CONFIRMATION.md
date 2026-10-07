# 🔧 Como Corrigir o Erro de Confirmação de Email no Supabase

## Problema
O Supabase está bloqueando login com erro `email_not_confirmed` porque a confirmação de email está habilitada por padrão.

## Solução Rápida (Via Dashboard)

### Passo 1: Acessar Configurações de Autenticação
1. Abra o Supabase Dashboard: https://supabase.com/dashboard
2. Selecione seu projeto **FlowNutri**
3. Vá em: **Authentication** → **Settings** (ou **Configurações**)

### Passo 2: Desabilitar Confirmação de Email
1. Procure a seção **Email Auth**
2. Encontre a opção: **"Enable email confirmations"** ou **"Confirmar email obrigatório"**
3. **DESABILITE** essa opção (toggle OFF)
4. Clique em **Save** / **Salvar**

### Passo 3: Confirmar Usuários Existentes (Opcional)
Execute este script no **SQL Editor** do Supabase para confirmar todos os usuários já cadastrados:

```sql
-- Confirmar todos os usuários existentes
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;
```

## Solução Alternativa (Apenas SQL)

Se você não conseguir acessar as configurações, execute no SQL Editor:

```sql
-- Confirmar todos os usuários
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Verificar resultado
SELECT email, email_confirmed_at FROM auth.users;
```

## Testar Após a Correção

1. Volte para: http://localhost:8080/auth (ou https://nutriflow2026.netlify.app/auth)
2. Tente fazer login com:
   - **Email**: seu@email.com
   - **Senha**: sua senha

Ou crie uma nova conta - ela deve funcionar imediatamente sem precisar confirmar email!

## Status das Correções

✅ Código atualizado - `emailRedirectTo` configurado
✅ Script SQL criado - [disable-email-confirmation.sql](./disable-email-confirmation.sql)
✅ Trigger de perfil criado - usuários são criados automaticamente em `nutritionists`

⚠️ **PENDENTE**: Você precisa desabilitar "Enable email confirmations" no Supabase Dashboard
